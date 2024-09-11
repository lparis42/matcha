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
    this.configureHTTPSServer();
    this.configureSocketIoServer();
    this.configureSocketIoEvent();
    this.configureRoutes();
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
      this.db.execute(this.db.drop('users_notification')),
    ]);
    await Promise.all([
      this.db.execute(this.db.create('users_private', structure.database.users_private.columns)),
      this.db.execute(this.db.create('users_preview', structure.database.users_preview.columns)),
      this.db.execute(this.db.create('users_public', structure.database.users_public.columns)),
      this.db.execute(this.db.create('users_match', structure.database.users_match.columns)),
      this.db.execute(this.db.create('users_session', structure.database.users_session.columns)),
      this.db.execute(this.db.create('users_report', structure.database.users_report.columns)),
      this.db.execute(this.db.create('users_notification', structure.database.users_notification.columns)),
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
    this.store = new pgSession({
      pool: pool,
      tableName: 'users_session'
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
    this.app = express();
     this.app.use(cors({ // Use the CORS middleware for the application
       origin: [`https://localhost:${process.env.HTTPS_PORT}`, `https://localhost:${process.env.HTTPS_PORT_CLIENT}`],
       methods: ['GET'],
       credentials: true, // Allow credentials
       secure: true, // Allow secure connections
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
        res.sendStatus(200);
      });
    }

    // Serve the images from the images directory
    const imagesPath = path.join(process.cwd(), '..', 'images');
    this.app.use('/images', express.static(imagesPath));

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
      maxHttpBufferSize: 1e6, // Set the maximum HTTP buffer size to 1MB
      cors: {
        origin: [`https://localhost:${process.env.HTTPS_PORT}`, `https://localhost:${process.env.HTTPS_PORT_CLIENT}`],
        methods: ['GET'],
        credentials: true,
      }
    });
    
    // Use the shared session middleware for the Socket.IO server
    this.io.use(sharedsession(this.sessionMiddleware, {
      autoSave: true // Automatically save the session 
    }));

    // Use the socket middleware for the Socket.IO server
    this.io.use(async (socket, next) => {
      try {
        // For testing purposes only - create a session for the simulator
        if (socket.handshake.auth.simulator) {
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

        // Use the packet middleware for the Socket.IO server
        socket.use((packet, next) => {
          try {
            const emit_list = [
              // Events from Socket.IO
              'connect', 'connect_error', 'disconnect', 'disconnecting', 'newListener', 'removeListener',
              // Events from the server
              'block', 'browsing', 'chat', 'chat_histories', 'edit', 'geolocation', 'like', 'likers',
              'login', 'logout', 'matchs', 'password_reset', 'password_reset_confirmation', 'registration',
              'registration_confirmation', 'report', 'research', 'unblock', 'unlike', 'unregistration', 'view', 'viewers',
            ];
            if (!packet[0].startsWith('client:') || !emit_list.includes(packet[0].slice(7))) { // Check if the packet is valid
              throw 'Invalid emit: ' + packet[0];
            }
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
