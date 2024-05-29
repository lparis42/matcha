const path = require('path');
const express = require('express');
const https = require('https');
const fs = require('fs');
const { key, cert, passphrase } = require('./constant').https.options;
const Socket = require('./socket');
const Database = require('./database');
const { user, host, database, password, port } = require('./constant').database.connection_parameters;
const users_columns = require('./constant').database.users.columns;

class Server {

  // Used to start the server
  async start() {
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
    console.log(`Routes configured`);
  }

  // Used to create the HTTPS server
  configureHttpsServer() {
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
    this.db = new Database(user, host, database, password, port);
    await this.db.connect();
    await this.db.drop('users'); // For testing purposes
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
server.start();
