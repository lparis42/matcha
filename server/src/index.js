const Server = require('./server');
const ClientSimulator = require('./client.simulator');

// Disable console.log and console.error in production
if (process.env.NODE_ENV !== 'development') {
    console.log = function () { };
    console.error = function () { };
}

// Start the server
const server = new Server();
