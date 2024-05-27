const path = require('path');
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const socketIo = require('socket.io');
const pgp = require('pg-promise')();
const bcrypt = require('bcrypt');
const Database = require('./database');

class Server {

  // Used to start the server
  async start() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureHttpsServer();
    this.configureSocketIO();
    await this.configureDatabase();

    this.server.listen(process.env.PORT, () => {
      console.log(`${this.constructor.name}: Listening on port ${process.env.PORT}`);
    });
  }

  // Used to configure the middleware
  async configureMiddleware() {
    this.app.use(cors({
      origin: [`https://localhost:${process.env.PORT}`],
      methods: ['GET', 'POST'],
      credentials: true,
    }));
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
    console.log(`${this.constructor.name}: Middleware configured`);
  }

  // Used to create the routes
  async configureRoutes() {
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
    });
    console.log(`${this.constructor.name}: Routes configured`);
  }

  // Used to create the HTTPS server
  async configureHttpsServer() {
    this.server = https.createServer({
      key: fs.readFileSync('./server.key'),
      cert: fs.readFileSync('./server.cert'),
      passphrase: 'matcha',
    }, this.app);
    console.log(`${this.constructor.name}: HTTPS server configured`);
  }

  // Used to create the socket server
  async configureSocketIO() {
    this.io = socketIo(this.server, {
      cors: {
        origin: [`https://localhost:${process.env.PORT}`],
        methods: ['GET', 'POST'],
        credentials: true,
      }
    });

    this.io.on('connection', (socket) => {
      console.log('A user connected', socket.id);

      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });
    console.log(`${this.constructor.name}: Socket.IO configured`);
  }

  // Used to configure the database
  async configureDatabase() {
    this.db = new Database('postgres', 'localhost', 'postgres', 'pg', 5432);

    await this.db.connect();
    await this.db.drop('users');
    const users_columns = require('./variables').User.columns;
    await this.db.create('users', users_columns);
    const row = {
      username: 'matcha42',
      password: 'matcha42',
    };
    await this.db.insert('users', row);
    console.log(`${this.constructor.name}: Database configured`);
  }

  // Used to close the server when testing
  closeServer(done) {
    this.server.close(done);
    console.log(`${this.constructor.name}: Server closed`);
  }
}

const server = new Server();
server.start();
