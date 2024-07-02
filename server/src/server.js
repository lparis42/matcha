const path = require('path');
const express = require('express');
const https = require('https');
const fs = require('fs');
const event = require('./event');
const database = require('./database');
const structure = require('./structure');
const session = require('express-session');
const sharedsession = require('express-socket.io-session');
const cookieParser = require('cookie-parser');
const socketIo = require('socket.io');
const cors = require('cors');
const { maxHeaderSize } = require('http');

class Server {

  constructor() {
    if (process.env.HTTPS_PORT === undefined) {
      console.error('Error: environment variables are not defined.');
      return;
    }
    this.start(process.env.HTTPS_PORT);
  }

  // Start the server
  async start(port) {
    await this.configureDatabase();
    this.configureStore();
    this.configureSessionMiddleware();
    this.configureApplication();
    this.configureRoutes();
    this.configureHTTPSServer();
    this.configureSocketIoServer();
    this.configureSocketIoEvent();
    this.server.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  }

  // Configure the database
  async configureDatabase() {
    const options = {
      user: process.env.DATABASE_USER,
      host: process.env.DATABASE_HOST,
      database: process.env.DATABASE_NAME,
      password: process.env.DATABASE_PASSWORD,
      port: process.env.DATABASE_PORT,
    };
    this.db = new database(...Object.values(options));
    await this.db.connect();
    await Promise.all([ // Reset the database tables for testing purposes
      this.db.execute(this.db.drop('users_match')),
      this.db.execute(this.db.drop('users_private')),
      this.db.execute(this.db.drop('users_preview')),
      this.db.execute(this.db.drop('users_public')),
      this.db.execute(this.db.drop('users_session')),
      this.db.execute(this.db.drop('users_report')),
    ]);
    await Promise.all([
      this.db.execute(this.db.create('users_private', structure.database.users_private.columns)),
      this.db.execute(this.db.create('users_preview', structure.database.users_preview.columns)),
      this.db.execute(this.db.create('users_public', structure.database.users_public.columns)),
      this.db.execute(this.db.create('users_match', structure.database.users_match.columns)),
      this.db.execute(this.db.create('users_session', structure.database.users_session.columns)),
      this.db.execute(this.db.create('users_report', structure.database.users_report.columns)),
    ]);

    console.log(`Database configured`);
  }

  // Configure the store
  configureStore() {
    const pgSession = require('connect-pg-simple')(session);
    const { Pool } = require('pg');
    const options = {
      user: process.env.DATABASE_USER,
      host: process.env.DATABASE_HOST,
      database: process.env.DATABASE_NAME,
      password: process.env.DATABASE_PASSWORD,
      port: process.env.DATABASE_PORT,
    };
    const pool = new Pool(options);
    this.store = new pgSession({ // Create a new PostgreSQL session store 
      pool: pool, // Use the connection parameters for the PostgreSQL database 
      tableName: 'users_session' // Use the users_session table for the session store 
    });
    console.log(`Store configured`);
  }

  // Configure the session middleware
  configureSessionMiddleware() {
    const options = {
      store: this.store,
      secret: process.env.SESSION_MIDDLEWARE_SECRET,
      resave: process.env.SESSION_MIDDLEWARE_RESAVE === 'true',
      saveUninitialized: process.env.SESSION_MIDDLEWARE_SAVE_UNINITIALIZED === 'true',
      cookie: {
        secure: process.env.SESSION_MIDDLEWARE_COOKIE_SECURE === 'true',
        httpOnly: process.env.SESSION_MIDDLEWARE_COOKIE_HTTP_ONLY === 'true',
        sameSite: process.env.SESSION_MIDDLEWARE_COOKIE_SAME_SITE,
        maxAge: parseInt(process.env.SESSION_MIDDLEWARE_COOKIE_MAX_AGE),
      },
    };
    this.sessionMiddleware = session(options);
    console.log(`Session middleware configured`);
  }

  // Configure the application
  configureApplication() {
    this.app = express(); // Create an express application 
    this.app.use(cors({ // Use the CORS middleware for the application 
      origin: [`https://localhost:${process.env.HTTPS_PORT}`, `https://localhost:${process.env.HTTPS_PORT_CLIENT}`],
      methods: ['GET', 'POST'],
      credentials: true,
      secure: true,
    }));
    this.app.use(cookieParser(process.env.SESSION_MIDDLEWARE_SECRET)); // Use the cookie parser middleware for the application 
    this.app.use(this.sessionMiddleware); // Use the session middleware for the application 
    console.log(`Application configured`);
  }

  // Configure the routes
  configureRoutes() {
    // For testing purposes only
    if (process.env.NODE_ENV === 'development') {
      this.app.get('/', (req, res) => {
        req.session.sessionID = null;
        res.sendStatus(200); // Send a status code of 200 OK to the client
      });
    } else {
      this.app.get('/', (req, res) => {
        req.session.sessionID = null;
        res.sendFile(path.join(process.cwd(), '..', 'client', 'dist', 'index.html'));
      });
      this.app.use(express.static(path.join(process.cwd(), '..', 'client', 'dist')));
    }
    console.log(`Routes configured`);
  }

  // Configure the HTTPS server
  configureHTTPSServer() {

    const options = {
      key: fs.readFileSync(path.join(process.cwd(), process.env.HTTPS_KEY)),
      cert: fs.readFileSync(path.join(process.cwd(), process.env.HTTPS_CERT)),
      passphrase: process.env.HTTPS_PASSPHRASE,
    };
    this.server = https.createServer(options, this.app);

    console.log(`HTTPS server configured`);
  }

  // Configure the Socket.IO server 
  configureSocketIoServer() {
    this.io = socketIo(this.server, { // Create a Socket.IO server
      maxHttpBufferSize: 1e7, // Set the maximum HTTP buffer size to 10MB
      cors: {
        origin: [`https://localhost:${process.env.HTTPS_PORT}`, `https://localhost:${process.env.HTTPS_PORT_CLIENT}`],
        methods: ['GET', 'POST'],
        credentials: true,
        secure: true,
      }
    });
    this.io.use(sharedsession(this.sessionMiddleware, { // Use the shared session middleware for the Socket.IO server 
      autoSave: true // Automatically save the session 
    }));
    this.io.use(async (socket, next) => { // Use the socket middleware for the Socket.IO server 
      try {
        if (socket.handshake.auth.simulator) { // For testing purposes only - create a session for the simulator
          await this.event.db.execute(
            this.event.db.insert('users_session', { sid: socket.handshake.sessionID, sess: JSON.stringify(socket.handshake.session), expire: 'NOW()' })
          );
        }
        // Verify if the session has been created by express-session middleware
        const session_account = await this.event.getSessionAccount(socket.handshake.sessionID);
        if (typeof session_account !== 'number') {
          console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Unauthorized`);
          return next(new Error('Unauthorized'));
        }
        // Add the socket ID to the session
        const socket_ids = (await this.db.execute(
          this.db.select('users_session', ['socket_ids'], `sid = '${socket.handshake.sessionID}'`)
        ))[0].socket_ids;
        const online_socket_ids = socket_ids.filter(socket_id => this.io.sockets.sockets[socket_id] && this.io.sockets.sockets[socket_id].connected);
        await this.db.execute(
          this.db.update('users_session', { socket_ids: [...online_socket_ids, socket.id] }, `sid = '${socket.handshake.sessionID}'`)
        );
        socket.use((packet, next) => { // Use the packet middleware for the socket 
          try {
            const size = Buffer.byteLength(JSON.stringify(packet), 'utf8'); // Calculate the size of the packet in bytes 
            console.log('\r\x1b[K');
            console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Sending packet of size ${size} bytes:`);

            next();
          } catch (err) {
            next(err);
            console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Error: ${err}`);
          }
        });
        next();
      } catch (err) {
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Error: ${err}`);
        return next(err);
      }
    });

    console.log(`Middleware configured`);
  }

  // Configure Socket.IO events
  configureSocketIoEvent() {
    this.event = new event(this.io, this.db, this.store); // Create an event object 
    console.log(`Socket.IO configured`);
  }

  // Close the server
  closeServer(done) {
    this.server.close(done);
    console.log(`Server closed`);
  }
}

module.exports = Server;
