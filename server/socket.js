const socketIo = require('socket.io');
const { online } = require('./variables');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

class Socket {
    constructor(server, db) {
        this.db = db;
        this.io = socketIo(server, {
            cors: {
                origin: `https://localhost:${process.env.PORT}`,
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        this.io.on('connection', (socket) => {
            console.log(`${this.constructor.name} -> Client '${socket.id}' has connected`);

            socket.on('logout', (cb) => { this.logoutUser(socket, cb) });
            socket.on('register', (data, cb) => { this.registerUser(socket, data, cb) });
            socket.on('login', (data, cb) => { this.loginUser(socket, data, cb) });
            socket.on('forgot', (data, cb) => { this.forgotPassword(socket, data, cb) });
            socket.on('edit', (data, cb) => { this.editUser(socket, data, cb) });

            socket.on('disconnect', () => {
                console.log(`${this.constructor.name} -> Client '${socket.id}' has disconnected`);
                delete online.users[socket.id];
            });
        });
    }

    // Method to logout users
    logoutUser(socket, cb) {
        try {
            if (!online.users[socket.id]) {
                throw `${this.constructor.name} -> User not logged in`;
            }
            const username = online.users[socket.id].username;
            delete online.users[socket.id];
            console.log(`${this.constructor.name} -> Client '${socket.id}' has logged out with username '${username}'`);
            cb(null, 'User logged out');
        } catch (err) {
            console.error(`${this.constructor.name} -> ${err}`);
            cb(err);
        }
    }

    // Method to register users
    async registerUser(socket, data, cb) {
        try {
            await this.db.insert('users', data);
            console.log(`${this.constructor.name} -> Client '${socket.id}' has registered with username '${data.username}'`);
            cb(null, 'User registered');
        } catch (err) {
            console.error(`${this.constructor.name} -> ${err.message}`);
            cb(`${err.message}`);
        }
    }

    // Method to login users
    async loginUser(socket, data, cb) {
        try {
            const { username, password } = data;
            // 1. Find the user
            const users = await this.db.select('users', '*', `username = '${username}'`);
            const user = users[0];
            if (!user) {
                throw `${this.constructor.name} -> User '${username}' not found`;
            }
            // 2. Compare the password
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                throw `${this.constructor.name} -> Incorrect password for user '${username}'`;
            }
            // 3. Add the user to the online list
            online.users[socket.id] = { username: data.username };
            console.log(`${this.constructor.name} -> Client '${socket.id}' has logged in with username '${data.username}'`);
            cb(null, 'User logged in');
        } catch (err) {
            console.error(`${this.constructor.name} -> ${err.message}`);
            cb(`${err.message}`);
        }
    }

    // Method to send a new password by email
    async forgotPassword(socket, data, cb) {
        try {
            const { email } = data;
            // 1. Find the user
            const users = await this.db.select('users', '*', `email = '${email}'`);
            const user = users[0];
            if (!user) {
                throw `${this.constructor.name} -> User with email '${email}' not found`;
            }
            // 2. Update the user
            const newPassword = Math.random().toString(36).slice(-8);     
            await this.db.update('users', { password: newPassword }, `email = '${email}'`);
            // 3. Send the new password by email
            let transporter = nodemailer.createTransport({
                host: 'sandbox.smtp.mailtrap.io', // Using mailtrap for testing
                port: 2525,
                auth: {
                    user: '9caf58c4d412ae',
                    pass: '4a4ec4660f87d5'
                }
            });
            let mailOptions = {
                from: 'email@server.com',
                to: email,
                subject: 'Your new password',
                text: `Your new password is ${newPassword}`
            };
            await transporter.sendMail(mailOptions);
            console.log(`${this.constructor.name} -> Client '${socket.id}' has requested a new password by email '${email}'`);
            cb(null, 'New password sent by email');
        } catch (err) {
            console.error(`${this.constructor.name} -> ${err.message}`);
            cb(`${err.message}`);
        }
    }

    // Method to edit users
    async editUser(socket, data, cb) {
        try {
            const { username } = online.users[socket.id];
            if (!username) {
                throw `${this.constructor.name} -> User not logged in`;
            }
            await this.db.update('users', data, `username = '${username}'`);
            console.log(`${this.constructor.name} -> Client '${socket.id}' has edited the user with username '${username}'`);
            cb(null, 'User edited');
        } catch (err) {
            console.error(`${this.constructor.name} -> ${err}`);
            cb(err);
        }
    }
}

module.exports = Socket;