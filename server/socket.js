const socketIo = require('socket.io');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

class Socket {
    constructor(server, db) {
        this.io = socketIo(server);
        this.db = db;
        this.online = {
            users: {},
        };
        this.transporter = nodemailer.createTransport({
            host: 'mail.smtpbucket.com', // Using SMTP Bucket for testing
            port: 8025,
            ignoreTLS: true, // TLS is a security feature, but not needed for testing
        });

        this.io.on('connection', (socket) => {
            console.log(`${socket.id} - New connection`);

            socket.on('client:logout', (cb) => { this.handleClientLogout(socket, cb) });
            socket.on('client:registration', (data, cb) => { this.handleClientRegistration(socket, data, cb) });
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
    async handleClientLogout(socket, cb) {
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

    // Method to Registration users
    async handleClientRegistration(socket, data, cb) {
        try {
            if (this.online.users[socket.id]) {
                throw `Cannot register while logged in`;
            }
            await this.db.insert('users', data);
            await this.transporter.sendMail({
                from: 'email@server.com',
                to: data.email,
                subject: 'Account registration',
                html: `Here is the link to confirm your registration:
                <a href="https://localhost:443/confirm?username=${data.username}">
                https://localhost:443/confirm?username=${data.username}
                </a>`
            });
            console.log(`${socket.id} - Confirmation email sent to '${data.email}'`);
            cb(null, 'Confirmation email sent');
        } catch (err) {
            cb(err);
            console.error(`${socket.id} - Registration error: ${err}`);
        }
    }

    // Method to login users
    async handleClientLogin(socket, data, cb) {
        try {
            if (this.online.users[socket.id]) {
                throw `Already logged in`;
            }
            const { username, password } = data;
            const users = await this.db.select('users', '*', `username = '${username}'`);
            const user = users[0];
            if (!user) {
                throw `Username '${username}' not found`;
            }
            if (!user.activated) {
                throw `Username '${username}' not activated`;
            }
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                throw `Password mismatch for username '${username}'`;
            }
            this.online.users[socket.id] = { username: data.username };
            cb(null, 'User logged in');
            console.log(`${socket.id} - Login with username '${username}'`);
        } catch (err) {
            cb(err);
            console.error(`${socket.id} - Login error: ${err}`);
        }
    }

    // Method to send a new password by email
    async handleClientPasswordReset(socket, data, cb) {
        try {
            if (this.online.users[socket.id]) {
                throw `Cannot reset password while logged in`;
            }
            const { email } = data;
            const user = (await this.db.select('users', '*', `email = '${email}'`))[0];
            if (!user) {
                throw `Email '${email}' not found`;
            }
            if (!user.activated) {
                throw `Username '${row.username}' not activated`;
            }
            const password = Math.random().toString(36).slice(-8);
            await this.db.update('users', { password: password }, `email = '${email}'`);
            await this.transporter.sendMail({
                from: 'email@server.com',
                to: email,
                subject: 'New password',
                html: `Your new password is: ${password}`
            });
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