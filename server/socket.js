const socketIo = require('socket.io');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

class Socket {
    constructor(server, db) {
        this.io = socketIo(server, {
            cors: {
                origin: `https://localhost:${process.env.PORT}`,
                methods: ['GET', 'POST'],
                credentials: true
            }
        });
        this.db = db;
        this.online = {
            users: {},
        };

        this.io.on('connection', (socket) => {
            console.log(`${this.constructor.name} - ${socket.id} - New connection`);

            socket.on('logout', (cb) => { this.logoutUser(socket, cb) });
            socket.on('register', (data, cb) => { this.registerUser(socket, data, cb) });
            socket.on('login', (data, cb) => { this.loginUser(socket, data, cb) });
            socket.on('forgot', (data, cb) => { this.forgotPassword(socket, data, cb) });
            socket.on('edit', (data, cb) => { this.editUser(socket, data, cb) });

            socket.on('disconnect', () => {
                console.log(`${this.constructor.name} - ${socket.id} - Disconnected`);
                delete online.users[socket.id];
            });
        });
    }

    // Method to logout users
    logoutUser(socket, cb) {
        try {
            if (!online.users[socket.id]) {
                throw new Error(`${this.constructor.name} - Not logged in`);
            }
            const username = online.users[socket.id].username;
            delete online.users[socket.id];
            console.log(`${this.constructor.name} - ${socket.id} - Logout with username '${username}'`);
            cb(null, 'Logged out');
        } catch (err) {
            const error = `${this.constructor.name} - ${err.message}`;
            cb(error);
            throw new Error(error);
        }
    }

    // Method to register users
    async registerUser(socket, data, cb) {
        try {
            await this.db.insert('users', data);
            console.log(`${this.constructor.name} - ${socket.id} - Register with username '${data.username}'`);
            cb(null, 'Registered');
        } catch (err) {
            const error = `${this.constructor.name} - ${err.message}`;
            cb(error);
            throw new Error(error);
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
                throw new Error(`${this.constructor.name} - Username '${username}' not found`);
            }
            // 2. Compare the password
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                throw new Error(`${this.constructor.name} - Incorrect password`);
            }
            // 3. Add the user to the online list
            online.users[socket.id] = { username: data.username };
            console.log(`${this.constructor.name} - ${socket.id} - Username '${username}' logged in`);
            cb(null, 'User logged in');
        } catch (err) {
            const error = `${this.constructor.name} - ${err.message}`;
            cb(error);
            throw new Error(error);
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
                throw new Error(`${this.constructor.name} - Email '${email}' not found`);
            }
            // 2. Update the user
            const newPassword = Math.random().toString(36).slice(-8);
            await this.db.update('users', { password: newPassword }, `email = '${email}'`);
            // 3. Send the new password by email
            let transporter = nodemailer.createTransport({
                host: 'mail.smtpbucket.com', // Using SMTP Bucket for testing
                port: 8025,
                ignoreTLS: true, // TLS is a security feature, but not needed for testing
            });
            let mailOptions = {
                from: 'email@server.com',
                to: email,
                subject: 'Your new password',
                text: `Your new password is ${newPassword}`
            };
            await transporter.sendMail(mailOptions);
            console.log(`${this.constructor.name} - ${socket.id} - New password sent by email to '${email}'`);
            cb(null, 'New password sent by email');
        } catch (err) {
            const error = `${this.constructor.name} - ${err.message}`;
            cb(error);
            throw new Error(error);
        }
    }

    // Method to edit users
    async editUser(socket, data, cb) {
        try {
            const { username } = online.users[socket.id];
            if (!username) {
                throw new Error(`${this.constructor.name} - .editUser -> User not logged in`);
            }
            await this.db.update('users', data, `username = '${username}'`);
            console.log(`${this.constructor.name} - ${socket.id} - .editUser -> User with username '${username}' edited`);
            cb(null, 'User edited');
        } catch (err) {
            const error = `${this.constructor.name} - ${err.message}`;
            cb(error);
            throw new Error(error);
        }
    }
}

module.exports = Socket;