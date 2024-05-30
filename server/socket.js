const socketIo = require('socket.io');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const validator = require('validator');

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
            socket.on('client:registration:confirmation', (data, cb) => { this.handleClientRegistrationConfirmation(socket, data, cb) });
            socket.on('client:login', (data, cb) => { this.handleClientLogin(socket, data, cb) });
            socket.on('client:passwordreset', (data, cb) => { this.handleClientPasswordReset(socket, data, cb) });
            socket.on('client:edit', (data, cb) => { this.handleClientEditProfile(socket, data, cb) });
            socket.on('client:view', (data, cb) => { this.handleViewProfile(socket, data, cb) });
            socket.on('client:like', (data, cb) => { this.handleLikeProfile(socket, data, cb) });
            socket.on('client:unlike', (data, cb) => { this.handleUnlikeProfile(socket, data, cb) });
            socket.on('client:gps', (data) => { this.handleClientCurrentPosition(socket, data) });

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
            const required_frields = ['username, password, email, last_name, first_name, date_of_birth'];
            for (const field of required_frields) {
                if (!data[field]) {
                    throw `Missing field for registration`;
                }
            }
            // Check if the username already exists to insert new registration in the users_preview table
            const activation_key = Math.random().toString(36).slice(-8);
            await this.checkAndHashPassword(data);
            const condition =
                `SELECT username FROM users_preview WHERE username = '${username}'
                UNION
                SELECT username FROM users WHERE username = '${username}'`;
            const query_iwne = this.db.insert_where_not_exists('users_preview', { ...data, activation_key: activation_key }, condition);
            const result = await this.db.execute(query_iwne);
            if (result.length === 0) {
                throw `Username '${username}' already exists`;
            }
            // Send the confirmation email
            const activation_link = `https://localhost:443/confirm?activation_key=${activation_key}`;
            await this.transporter.sendMail({
                from: 'email@server.com',
                to: data.email,
                subject: 'Account registration',
                html: `Here is the link to confirm your registration: <a href="${activation_link}">${activation_link}</a>`
            });
            console.log(`${socket.id} - Confirmation email sent to '${data.email}'`);
            cb(null, 'Confirmation email sent');
        } catch (err) {
            cb(err);
            console.error(`${socket.id} - Registration error: ${err}`);
        }
    }

    async handleClientRegistrationConfirmation(socket, data, cb) {
        try {
            const { activation_key } = data;
            const query_select = this.db.select('users_preview', '*', `activation_key = '${activation_key}'`);
            const user = (await this.db.execute(query_select))[0];
            if (!user) {
                throw `Activation key '${activation_key}' not found`;
            }
            if (user.created_at < new Date(Date.now() - 1 * 60 * 60 * 1000)) {
                throw `Activation key '${activation_key}' expired`;
            }
            delete user.activation_key;
            const query_insert = this.db.insert('users', user);
            await this.db.execute(query_insert);
            const query_delete = this.db.delete('users_preview', `activation_key = '${activation_key}'`);
            await this.db.execute(query_delete);
            console.log(`${socket.id} - Registration confirmed for username '${user.username}'`);
            cb(null, 'Registration confirmed');
        } catch (err) {
            console.error(`${socket.id} - Registration confirmation error: ${err}`);
            cb(err);
        }
    }

    // Method to login users
    async handleClientLogin(socket, data, cb) {
        try {
            if (this.online.users[socket.id]) {
                throw `Already logged in`;
            }
            const { username, password } = data;
            const query_select = this.db.select('users', '*', `username = '${username}'`);
            const user = (await this.db.execute(query_select))[0];
            if (!user) {
                throw `Username '${username}' not found`;
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
            const query_select = this.db.select('users', '*', `email = '${email}'`);
            const user = (await this.db.execute(query_select))[0];
            if (!user) {
                throw `Email '${email}' not found`;
            }
            const password = Math.random().toString(36).slice(-8);
            const query_update = this.db.update('users', { password: password }, `email = '${email}'`);
            await this.db.execute(query_update);
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
    async handleClientEditProfile(socket, data, cb) {
        try {
            const { username } = this.online.users[socket.id];
            if (!this.online.users[socket.id]) {
                throw `Not logged in`;
            }
            const allowed_fields = ['email', 'last_name', 'first_name', 'date_of_birth', 'gender', 'sexual_orientation', 'biography', 'interests', 'pictures'];
            for (const field in data) {
                if (!allowed_fields.includes(field)) {
                    throw `Invalid field for registration`;
                }
            }
            const query_update = this.db.update('users', data, `username = '${username}'`);
            await this.db.execute(query_update);
            console.log(`${socket.id} - Edit profil for username '${username}'`);
            cb(null, 'User edited');
        } catch (err) {
            cb(err);
            console.error(`${socket.id} - Edit profil error: ${err}`);
        }
    }

    // Method to view user's profile
    async handleViewProfile(socket, data, cb) {
        try {
            if (!this.online.users[socket.id]) {
                throw `Not logged in`;
            }
            const { username } = data;
            const fields = ['username', 'last_name', 'first_name', 'date_of_birth', 'gender', 'sexual_orientation', 'biography', 'interests', 'pictures', 'fame_rating', 'geolocation'];
            const query_select = this.db.select('users', fields, `username = '${username}'`);
            const user = (await this.db.execute(query_select))[0];
            if (!user) {
                throw `Username '${username}' not found`;
            }
            if (!user.viewers.includes(this.online.users[socket.id].username)) {
                user.viewers = [...user.viewers, this.online.users[socket.id].username];
                const query_update = this.db.update('users', { viewers: user.viewers, fame_rating: user.fame_rating + 1 }, `username = '${username}'`);
                await this.db.execute(query_update);
            }
            console.log(`${socket.id} - View profil for username '${username}'`);
            cb(null, user);
        } catch (err) {
            cb(err);
            console.error(`${socket.id} - View profil error: ${err}`);
        }
    }

    // Method to like user's profile
    async handleLikeProfile(socket, data, cb) {
        try {
            if (!this.online.users[socket.id]) {
                throw `Not logged in`;
            }
            const { username } = data;
            const query_select = this.db.select('users', 'likers', `username = '${username}'`);
            const user = (await this.db.execute(query_select))[0];
            if (!user) {
                throw `Username '${username}' not found`;
            }
            if (!user.likers.includes(this.online.users[socket.id].username)) {
                user.likers = [...user.likers, this.online.users[socket.id].username];
                const query_update = this.db.update('users', { viewers: user.likers, fame_rating: user.fame_rating + 42 }, `username = '${username}'`);
                await this.db.execute(query_update);
            }
            console.log(`${socket.id} - Like profil for username '${username}'`);
            cb(null, 'User liked');
        }
        catch (err) {
            cb(err);
            console.error(`${socket.id} - Like profil error: ${err}`);
        }
    }

    // Method to unlike user's profile
    async handleUnlikeProfile(socket, data, cb) {
        try {
            if (!this.online.users[socket.id]) {
                throw `Not logged in`;
            }
            const { username } = data;
            const query_select = this.db.select('users', 'likers', `username = '${username}'`);
            const user = (await this.db.execute(query_select))[0];
            if (!user) {
                throw `Username '${username}' not found`;
            }
            if (user.likers.includes(this.online.users[socket.id].username)) {
                user.likers = user.likers.filter((liker) => liker !== this.online.users[socket.id].username);
                const query_update = this.db.update('users', { viewers: user.likers, fame_rating: user.fame_rating - 42 }, `username = '${username}'`);
                await this.db.execute(query_update);
            }
            console.log(`${socket.id} - Unlike profil for username '${username}'`);
            cb(null, 'User unliked');
        }
        catch (err) {
            cb(err);
            console.error(`${socket.id} - Unlike profil error: ${err}`);
        }
    }

    // Method to handle the current position of the client
    async handleClientCurrentPosition(socket, data) {
        try {
            if (!this.online.users[socket.id]) {
                throw `Not logged in`;
            }
            const { latitude, longitude, address } = data;
            const query_update = this.db.update('users', { geolocation: [latitude, longitude] }, `username = '${this.online.users[socket.id].username}'`);
            await this.db.execute(query_update);
            console.log(`${socket.id} - Current position (${latitude}, ${longitude}): ${address}`);
        } catch (err) {
            console.error(`${socket.id} - Current position error: ${err}`);
        }
    }

    // ** Helper methods **

    // Check and hash the password
    async checkAndHashPassword(row) {
        try {
            if (!validator.isAlphanumeric(row.password) || !validator.isLength(row.password, { min: 8, max: 20 })) {
                throw new Error(`The password must be alphanumeric and between 8 and 20 characters`);
            } else {
                const hashedPassword = await bcrypt.hash(row.password, 10);
                row.password = hashedPassword;
            }
        } catch (err) {
            throw err;
        }
    }
}

module.exports = Socket;