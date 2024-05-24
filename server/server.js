const path = require('path');
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const socketIo = require('socket.io');
const pgp = require('pg-promise')();

const PORT = process.env.PORT || 443;
const DEV_PORT = 3000;

class Server {
  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureHttpsServer();
    this.configureSocketIO();
    this.configureDatabase();
  }

  // Used to configure the middleware
  configureMiddleware() {
    this.app.use(cors({
      origin: [`https://localhost:${PORT}`, `https://localhost:${DEV_PORT}`],
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
        origin: [`https://localhost:${PORT}`, `https://localhost:${DEV_PORT}`],
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
    this.defaultDb = pgp({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: 'pg',
      port: 5432,
    });
    console.log('Database connection established');

    this.defaultDb.query("SELECT to_regclass('public.users')")
      .then(data => {
        if (!data[0].to_regclass) {
          console.log('Creating users table...');
          return this.defaultDb.none(`
          CREATE TABLE users(
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE,
            password TEXT,
            email TEXT UNIQUE,
            gender TEXT,
            date_of_birth DATE,
            bio TEXT,
            profile_picture TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        }
      })
      .then(() => {
        console.log('Table users is ready');
        this.defaultDb.query("INSERT INTO users(username, password) VALUES('admin', 'admin')")
          .catch(error => {
            if (error.message.includes('users_username_key')) {
              console.error('Username already exists');
            } else {
              console.error('Error inserting user', error);
            }
          });
      })
      .catch(error => {
        console.error('Error checking or creating users table', error);
      });
  }

  // Used to start the server
  start() {
    this.server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }

  // Used to close the server when testing
  closeServer(done) {
    this.server.close(done);
    console.log(`Server on port ${PORT} is closed`);
  }
}

const server = new Server();
server.start();
