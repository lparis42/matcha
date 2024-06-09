const path = require('path');
const express = require('express');
const https = require('https');
const fs = require('fs');
const Socket = require('./socket');
const constants = require('./constants');
const session = require('express-session');
const cookieParser = require('cookie-parser');

class Server {

  constructor() {
    this.start(constants.https.port);
  }

  // Start the server
  async start(port) {
    process.env.PORT = port;
    this.app = express();
    this.configureRoutes();
    this.configureHTTPSServer();
    this.configureSocketIO();
    this.configureMiddleware();
    this.server.listen(process.env.PORT, '0.0.0.0', () => {
      console.log(`Listening on port ${process.env.PORT}`);
    });
  }

  // Configure the middleware
  configureMiddleware() {
    const secretKey = 'your_secure_and_random_secret_key';

    this.app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
    this.app.use(cookieParser(secretKey));
    // Create a session
    this.app.use(session({
      secret: secretKey,
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: true,
        maxAge: 900000,
        httpOnly: true
      },
    }));

    this.socket.io.use((socket, next) => {
      const ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;

      socket.use((packet, nextPacket) => {
        try {
          const size = Buffer.byteLength(JSON.stringify(packet), 'utf8');
          console.log(`Socket.io middleware - ${ip} - Packet size: ${size} bytes`);
        } catch (err) {
          console.error(`Socket.io middleware - ${ip} - ${err} - Ignoring packet`);
        }
        nextPacket();
      });

      const cookie = socket.handshake.headers.cookie;
      console.log(`Socket.io middleware - ${ip} - Received cookie: ${cookie}`);

      if (cookie) {
        const parsedCookie = require('cookie').parse(cookie);
        const sessionId = cookieParser.signedCookie(parsedCookie['connect.sid'], secretKey);
        console.log(`Socket.io middleware - ${ip} - Parsed cookie: ${parsedCookie}`);
        console.log(`Socket.io middleware - ${ip} - Found session ID: ${sessionId}`);
        this.sessionStore.get(sessionId, (err, session) => {
          if (err || !session) {
            session = {
              isNew: true,
              id: socket.id
            };
          }

          socket.session = session;

          console.log(`Socket.io middleware - ${ip} - Found session with ID: ${session.id}`);
        });
      }

      next();
    });


    console.log(`Middleware configured`);
  }

  // Configure the routes
  configureRoutes() {
    this.app.get('/', (req, res) => {
      req.session.views = (req.session.views || 0) + 1;
      res.send(`You have viewed this page ${req.session.views} times`);
    });
    console.log(`Routes configured`);
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

    this.socket = new Socket(this.server);
    console.log(`Socket.IO configured`);
  }

  // Close the server
  closeServer(done) {
    this.server.close(done);
    console.log(`Server closed`);
  }
}

module.exports = Server;
