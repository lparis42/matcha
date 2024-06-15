const path = require('path');
const express = require('express');
const https = require('https');
const fs = require('fs');
const event = require('./event');
const database = require('./database');
const constants = require('./constants');
const session = require('express-session');
const sharedsession = require('express-socket.io-session');
const cookieParser = require('cookie-parser');
const socketIo = require('socket.io');

class Server {

  constructor() {
    this.start(constants.https.port);
  }

  // Start the server
  async start(port) {
    this.app = express();
    this.configureHTTPSServer();
    await this.configureDatabase();
    this.configureSocketIO();
    this.configureMiddleware();
    this.configureRoutes();
    this.server.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  }

  // Configure the HTTPS server
  configureHTTPSServer() {
    const { key, cert, passphrase } = constants.https.options;
    this.server = https.createServer({
      key: fs.readFileSync(key),
      cert: fs.readFileSync(cert),
      passphrase: passphrase,
    }, this.app);
    console.log(`HTTPS server configured`);
  }

  // Configure the database
  async configureDatabase() {
    this.db = new database(...Object.values(constants.database.connection_parameters));
    await this.db.connect();
    // Reset the database tables for testing purposes
    await Promise.all([
      this.db.execute(this.db.drop('users_match')),
      this.db.execute(this.db.drop('users_private')),
      this.db.execute(this.db.drop('users_preview')),
      this.db.execute(this.db.drop('users_public')),
      this.db.execute(this.db.drop('users_session')),
    ]);
    await Promise.all([
      this.db.execute(this.db.create('users_private', constants.database.users_private.columns)),
      this.db.execute(this.db.create('users_preview', constants.database.users_preview.columns)),
      this.db.execute(this.db.create('users_public', constants.database.users_public.columns)),
      this.db.execute(this.db.create('users_match', constants.database.users_match.columns)),
      this.db.execute(this.db.create('users_session', constants.database.users_session.columns)),
    ]);
    console.log(`Database configured`);
  }

  // Configure Socket.IO
  configureSocketIO() {
    this.io = socketIo(this.server, {
      maxHttpBufferSize: 1e7, // 10 MB
    });
    const pgSession = require('connect-pg-simple')(session);
    const { Pool } = require('pg');
    this.store = new pgSession({
      pool: new Pool(constants.database.connection_parameters),
      tableName: 'users_session'
    });
    this.event = new event(this.io, this.db, this.store);
    console.log(`Socket.IO configured`);
  }

  // Configure the middleware
  configureMiddleware() {

    // Serve the client
    this.app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

    // Configure the session middleware
    const secret_key = this.event.generateSecurePassword(32);
    console.log(`Secret key: ${secret_key}`);
    const sessionMiddleware = session({
      store: this.store,
      secret: secret_key,
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: true,
        httpOnly: true,
        sameSite: true,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        path: '/',
      },
    });

    // Use the cookie parser middleware
    this.app.use(cookieParser(secret_key));

    // Use the session middleware
    this.app.use(sessionMiddleware);

    // Use the shared session middleware for Socket.IO
    this.io.use(sharedsession(sessionMiddleware, {
      autoSave: true
    }));

    // Configure the Socket.IO middleware
    this.io.use(async (socket, next) => {
      try {

        // For testing purposes
        if (socket.handshake.auth.simulator) {
          await this.event.db.execute(
            this.event.db.insert('users_session', { sid: socket.handshake.sessionID, sess: JSON.stringify({}), expire: 'NOW()' })
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
        const online_socket_ids = socket_ids.filter(socket_id => this.io.sockets.sockets[socket_id] && this.io.sockets.sockets[socket_id].online);
        await this.db.execute(
          this.db.update('users_session', { socket_ids: [...online_socket_ids, socket.id] }, `sid = '${socket.handshake.sessionID}'`)
        );

        socket.use((packet, next) => {
          try {
            // Log the packet size in bytes 
            const size = Buffer.byteLength(JSON.stringify(packet), 'utf8');
            console.log('\r\x1b[K');
            console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Sending packet of size ${size} bytes:`);

            // Next
            next();
          } catch (err) {
            next(err);
            console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Error: ${err}`);
          }
        });

        // Next
        next();
      } catch (err) {
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Error: ${err}`);
        return next(err);
      }
    });

    console.log(`Middleware configured`);
  }

  // Configure the routes
  configureRoutes() {
    // Serve the client
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
    });

    // Redirect the socket.io route
    this.app.get('/socket.io', (req, res) => {
      res.redirect('/');
      res.end();
    });

    console.log(`Routes configured`);
  }

  // Close the server
  closeServer(done) {
    this.server.close(done);
    console.log(`Server closed`);
  }
}

module.exports = Server;
