const socketIo = require('socket.io');
const { online } = require('./variables');
const bcrypt = require('bcrypt');

class Socket {
    constructor(server, db) {
        this.db = db;
        this.io = socketIo(server);

        this.io.on('connection', (socket) => {
            console.log(`${this.constructor.name}: Client '${socket.id}' has connected`);

            socket.on('register', (data, cb) => { this.registerUser(socket, data, cb) });
            socket.on('login', (data, cb) => { this.loginUser(socket, data, cb) });

            socket.on('disconnect', () => {
                console.log(`${this.constructor.name}: Client '${socket.id}' has disconnected`);
                delete online.users[socket.id];
            });
        });
    }

    // Function to register new users
    async registerUser(socket, data, cb) {
        try {
            await this.db.insert('users', data);
            console.log(`${this.constructor.name}: User registered with username '${data.username}'`);
            cb(null, 'User registered');
        } catch (err) {
            console.error(err);
            cb(err);
        }
    }

    // Function to login users
    async loginUser(socket, data, cb) {
        try {
            const { username, password } = data;
            // 1. Find the user
            const users = await this.db.select('users', '*', `username = '${username}'`);
            const user = users[0];
            if (!user) {
                throw new Error('User not found');
            }
            // 2. Compare the password
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                throw new Error('Password incorrect');
            }
            // 3. Add the user to the online list
            online.users[socket.id] = { username: data.username };
            console.log(`${this.constructor.name}: User '${username}' logged in`);
            cb(null, 'User logged in');
        } catch (err) {
            console.error(`${this.constructor.name}: ${err.message}`);
            cb(err.message);
        }
    }

}

module.exports = Socket;