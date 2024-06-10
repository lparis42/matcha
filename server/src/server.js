const path = require('path');
const express = require('express');
const https = require('https');
const fs = require('fs');
const event = require('./event');
const constants = require('./constants');
const session = require('express-session');
const sharedsession = require("express-socket.io-session");
const cookieParser = require('cookie-parser');
const socketIo = require('socket.io');
const e = require('express');

class Server {

  constructor() {
    this.start(constants.https.port);
  }

  // Start the server
  async start(port) {
    process.env.PORT = port;
    this.app = express();
    this.configureHTTPSServer();
    this.configureSocketIO();
    this.configureMiddleware();
    this.configureRoutes();
    this.server.listen(process.env.PORT, '0.0.0.0', () => {
      console.log(`Listening on port ${process.env.PORT}`);
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

  // Configure Socket.IO
  configureSocketIO() {
    this.io = socketIo(this.server, {
      maxHttpBufferSize: 1e7, // 10 MB
    });
    this.store = new session.MemoryStore();
    this.event = new event(this.io, this.store);
    console.log(`Socket.IO configured`);
  }


  // Configure the middleware
  configureMiddleware() {

    // Serve the client
    this.app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

    // Configure the session middleware
    const secretKey = this.event.generateSecurePassword(32);
    console.log(`Secret key: ${secretKey}`);
    const sessionMiddleware = session({
      store: this.store,
      secret: secretKey,
      resave: false,
      saveUninitialized: true,
      proxy: true,
      cookie: {
        secure: true,
        httpOnly: true,
        sameSite: true,
        maxAge: 1000 * 60 * 60 * 24,
        path: '/',
        signed: true,
      },
    });


    // Use the cookie parser middleware
    this.app.use(cookieParser(secretKey));

    // Use the session middleware
    this.app.use(sessionMiddleware);

    // Use the shared session middleware for Socket.IO
    this.io.use(sharedsession(sessionMiddleware, {
      autoSave: true
    }));

    // Log the cookies and session ID
    this.app.use((req, res, next) => {
      console.log('signedCookies: ', req.signedCookies['connect.sid']);
      console.log('Session ID: ', req.sessionID);
      next();
    });

    // Configure the Socket.IO middleware
    this.io.use((socket, next) => {

      // Log the packet size
      socket.use((packet, next) => {
        const size = Buffer.byteLength(JSON.stringify(packet), 'utf8');
        console.log('\r\x1b[K');
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Sending packet of size ${size} bytes:`);

        next();
      });

      next();
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
