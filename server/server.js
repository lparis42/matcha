const path = require('path');
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const socketIo = require('socket.io');
const pgp = require('pg-promise')();
const bcrypt = require('bcrypt');
const database = require('./database');

class Server {
  constructor() {
    this.app = express()
    this.configureMiddleware();
    this.configureRoutes();
    this.configureHttpsServer();
    this.configureSocketIO();
    this.configureDatabase();
  }

  // Used to configure the middleware
  configureMiddleware() {
    this.app.use(cors({
      origin: [`https://localhost:${process.env.PORT}`],
      methods: ['GET', 'POST'],
      credentials: true,
    }));
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
  }

  // Used to create the routes
  configureRoutes() {
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
    });
  }

  // Used to create the HTTPS server
  configureHttpsServer() {
    this.server = https.createServer({
      key: fs.readFileSync('./server.key'),
      cert: fs.readFileSync('./server.cert'),
      passphrase: 'matcha',
    }, this.app);
  }

  // Used to create the socket server
  configureSocketIO() {
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
  }

  // Used to create the database and table
  configureDatabase() {
    // Used to create database instance
    this.db = new database('postgres', 'localhost', 'postgres', 'pg', 5432);

    // Used to connect to the database
    this.db.connect()
      .then(() => {
        return this.db.dropTable('users');
      })
      .then(() => {
        const columns = [
          `id SERIAL PRIMARY KEY`,
          `username VARCHAR(20) UNIQUE CHECK (char_length(username) BETWEEN 6 AND 20 AND username ~ '^[A-Za-z0-9]+$')`,
          `password VARCHAR(60)`,
          `email VARCHAR(50) UNIQUE CHECK (char_length(email) BETWEEN 6 AND 50 AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')`,
          `last_name VARCHAR(35)`,
          `first_name VARCHAR(35)`,
          `date_of_birth DATE CHECK (date_of_birth BETWEEN '1900-01-01' AND '2021-12-31')`,
          `gender VARCHAR(35) CHECK (gender IN ('Male', 'Female', 'Other'))`,
          `sexual_orientation VARCHAR(35) CHECK (sexual_orientation IN ('Heterosexual', 'Bisexual', 'Homosexual', 'Other'))`,
          `biography VARCHAR(255)`,
          `interests VARCHAR(50)[10]`,
          `pictures VARCHAR(255)[5] DEFAULT ARRAY['defaut.jpg']::VARCHAR(255)[]`,
          `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
          `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
        ];
        return this.db.createTable('users', columns);
      })
      .then(() => {
        const row = {
          columns: ['username', 'password'],
          values: ['matcha42', 'matcha42'],
        };
        return this.db.insert('users', row);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  // Used to start the server
  start() {
    this.server.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  }

  // Used to close the server when testing
  closeServer(done) {
    this.server.close(done);
    console.log(`Server on port ${process.env.PORT} is closed`);
  }
}

const server = new Server();
server.start();
