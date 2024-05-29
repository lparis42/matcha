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
            console.log(`${socket.id} - New connection`);

            socket.on('client:logout', (cb) => { this.handleClientLogout(socket, cb) });
            socket.on('client:register', (data, cb) => { this.handleClientRegister(socket, data, cb) });
            socket.on('client:login', (data, cb) => { this.handleClientLogin(socket, data, cb) });
            socket.on('client:password_reset', (data, cb) => { this.handleClientPasswordReset(socket, data, cb) });
            socket.on('client:edit', (data, cb) => { this.handleClientEditProfil(socket, data, cb) });
            
            socket.on('disconnect', () => {
                console.log(`${socket.id} - Disconnected`);
                delete this.online.users[socket.id];
            });
        });
    }

    // Method to logout users
    handleClientLogout(socket, cb) {
        try {
            if (!this.online.users[socket.id]) {
                throw `Not logged in`;
            }
            const username = this.online.users[socket.id].username;
            delete this.online.users[socket.id];
            console.log(`${socket.id} - Logout from username '${username}'`);
            cb(null, 'Logged out');
        } catch (err) {
            cb(err);
            console.error(`${socket.id} - Logout error: ${err}`);
        }
    }

    // Method to register users
    async handleClientRegister(socket, data, cb) {
        try {
            await this.db.insert('users', data);
            console.log(`${socket.id} - Register with username '${data.username}'`);
            cb(null, 'Registered');
        } catch (err) {
            cb(err);
            console.error(`${socket.id} - Register error: ${err}`);
        }
    }

    // Method to login users
    async handleClientLogin(socket, data, cb) {
        try {
            const { username, password } = data;
            // 1. Find the user
            const users = await this.db.select('users', '*', `username = '${username}'`);
            const user = users[0];
            if (!user) {
                throw `Username '${username}' not found`;
            }
            // 2. Compare the password
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                throw `Password mismatch for username '${username}'`;
            }
            // 3. Add the user to the online list
            this.online.users[socket.id] = { username: data.username };
            console.log(`${socket.id} - Login with username '${username}'`);
            cb(null, 'User logged in');
        } catch (err) {
            cb(err);
            console.error(`${socket.id} - Login error: ${err}`);
        }
    }

    // Method to send a new password by email
    async handleClientPasswordReset(socket, data, cb) {
        try {
            // Check if the user is logged in
            if (this.online.users[socket.id]) {
                throw `Cannot reset password while logged in`;
            }
            const { email } = data;
            // 1. Find the user
            const users = await this.db.select('users', '*', `email = '${email}'`);
            const user = users[0];
            if (!user) {
                throw `Email '${email}' not found`;
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
            console.log(`${socket.id} - New password sent by email to '${email}'`);
            cb(null, 'New password sent by email');
        } catch (err) {
            cb(err);
            console.error(`${socket.id} - Password reset error: ${err}`);
        }
    }

    // Method to edit users
    async handleClientEditProfil(socket, data, cb) {
        try {
            const { username } = this.online.users[socket.id];
            if (!username) {
                throw `Not logged in`;
            }
            await this.db.update('users', data, `username = '${username}'`);
            console.log(`${socket.id} - Edit profil for username '${username}'`);
            cb(null, 'User edited');
        } catch (err) {
            cb(err);
            console.error(`${socket.id} - Edit profil error: ${err}`);
        }
    }
}

module.exports = Socket;