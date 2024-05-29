const path = require('path');
const express = require('express');
const https = require('https');
const fs = require('fs');
const Socket = require('./socket');
const Database = require('./database');
const constant = require('./constant');

class Server {

  // Used to start the server
  async start(port) {
    process.env.PORT = port;
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureHttpsServer();
    await this.configureDatabase();
    this.configureSocketIO();
    this.server.listen(process.env.PORT, () => {
      console.log(`Listening on port ${process.env.PORT}`);
    });
  }

  // Used to configure the middleware
  configureMiddleware() {
    this.app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
    console.log(`Middleware configured`);
  }

  // Used to create the routes
  configureRoutes() {
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
    });

    this.app.get('/confirm', (req, res) => {

      //res.redirect('/');
      res.redirect('http://localhost:5173/');
      this.socket.io.on('connection', async (socket) => {
        try {
          const username = req.query.username;
          const user = (await this.db.select('users', '*', `username = '${username}'`))[0];
          if (!user) {
            throw `User ${username} not found`;
          }
          if (user.created_at < new Date(Date.now() - 1 * 60 * 60 * 1000)) {
            throw `User ${username} registration has expired`;
          }
          await this.db.update('users', { activated: true }, `username = '${username}'`);

          console.log(`${socket.id} - Registration confirmed for username '${username}'`);
        } catch (error) {
          console.error(`Registration confirmation failed: ${error}`);
        }
      });
    });

    console.log(`Routes configured`);
  }

  // Used to create the HTTPS server
  configureHttpsServer() {
    const { key, cert, passphrase } = constant.https.options;
    this.server = https.createServer({
      key: fs.readFileSync(key),
      cert: fs.readFileSync(cert),
      passphrase: passphrase,
    }, this.app);
    console.log(`HTTPS server configured`);
  }

  // Used to create the socket server
  configureSocketIO() {
    this.socket = new Socket(this.server, this.db);
    console.log(`Socket.IO configured`);
  }

  // Used to configure the database
  async configureDatabase() {
    const { user, host, database, password, port } = constant.database.connection_parameters;
    this.db = new Database(user, host, database, password, port);
    await this.db.connect();
    await this.db.drop('users'); // For testing purposes
    const users_columns = constant.database.users.columns;
    await this.db.create('users', users_columns);
    console.log(`Database configured`);
  }

  // Used to close the server when testing
  closeServer(done) {
    this.server.close(done);
    console.log(`Server closed`);
  }
}

const server = new Server();
server.start(constant.https.port);
