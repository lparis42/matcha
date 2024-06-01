const socketIo = require('socket.io');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const validator = require('validator');
const axios = require('axios');
const transporterConfig = require('./constant').nodemailer;
const base64id = require('base64id');
const { Mutex } = require('async-mutex');

class Socket {
    constructor(server, db) {
        this.io = socketIo(server);
        this.db = db;
        this.transporter = nodemailer.createTransport(transporterConfig);
        this.sessionStore = {};
        this.mutex = new Mutex();
        this.configureMiddleware();
        this.handleClientConnection();
    }

    
    // Method to configure the middleware
    configureMiddleware() {
        this.io.use((socket, next) => {
            const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
            const sessionID = socket.handshake.auth.sessionID;
            
            if (sessionID) {
                const session = this.sessionStore[sessionID];
                if (session) {
                    // Associate the session with the socket
                    socket.sessionID = sessionID;
                    this.sessionStore[sessionID].socketID = socket.id;
                    console.log(`${socket.sessionID}:${socket.id} - Connect to session: ${sessionID}`);
                    return next();
                }
            }
            // Create a new session
            const randomSessionID = clientIp;
            socket.sessionID = randomSessionID;
            this.sessionStore[randomSessionID] = {
                socketID: socket.id, 
                loggedIn: false
            };
            console.log(`${socket.sessionID}:${socket.id} - Connect to session: ${socket.sessionID}`);
            next();
        });
    }

    handleClientConnection(socket) {
        
        this.io.on('connection', (socket) => {
            // Send the sessionID to the client
            socket.emit('server:session', socket.sessionID);
            // Handle the client events
            socket.on('client:geolocation', (data) => { this.handleClientGeolocation(socket, data) });
            socket.on('client:logout', (cb) => { this.handleClientLogout(socket, cb) });
            socket.on('client:registration', (data, cb) => { this.handleClientRegistration(socket, data, cb) });
            socket.on('client:registration:confirmation', (data, cb) => { this.handleClientRegistrationConfirmation(socket, data, cb) });
            socket.on('client:unregistration', (cb) => { this.handleClientUnregistration(socket, cb) });
            socket.on('client:login', (data, cb) => { this.handleClientLogin(socket, data, cb) });
            socket.on('client:passwordreset', (data, cb) => { this.handleClientPasswordReset(socket, data, cb) });
            socket.on('client:edit', (data, cb) => { this.handleClientEditProfile(socket, data, cb) });
            socket.on('client:view', (data, cb) => { this.handleViewProfile(socket, data, cb) });
            socket.on('client:like', (data, cb) => { this.handleLikeProfile(socket, data, cb) });
            socket.on('client:unlike', (data, cb) => { this.handleUnlikeProfile(socket, data, cb) });

            // Handle the client disconnection
            socket.on('disconnect', () => {
                console.log(`${socket.sessionID}:${socket.id} - Disconnected`);
            });
        });
    }

    async handleClientGeolocation(socket, data) {
        try {
            let { latitude, longitude } = data;
            let address;
            if (!latitude || !longitude) {
                let ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
                let response = await axios.get(`http://ip-api.com/json/${ip}`);
                if (response.data.status === 'fail') {  
                    ip = (await axios.get('https://api.ipify.org?format=json')).data.ip;
                    response = await axios.get(`http://ip-api.com/json/${ip}`);
                    if (response.data.status === 'fail') {
                        throw `Geolocation not found`;
                    }
                }
                latitude = response.data.lat;
                longitude = response.data.lon;
                address = `${response.data.country}, ${response.data.regionName}, ${response.data.city}`;
                console.log(`${socket.sessionID}:${socket.id} - Geolocation received from IP address`);
            } else {
                const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                if (response.data.error) {
                    throw `Geolocation not found`;
                }
                address = `${response.data.address.country}, ${response.data.address.state}, ${response.data.address.town}`
                console.log(`${socket.sessionID}:${socket.id} - GeoLocation received from client`);
            }
            const query_update = this.db.update('users', { geolocation: [latitude, longitude] }, `username = '${this.sessionStore[socket.sessionID].username}'`); await this.db.execute(query_update);
            await this.db.execute(query_update);
            console.log(`${socket.sessionID}:${socket.id} - Current position (${latitude}, ${longitude}): ${address}`);
        } catch (err) {
            console.error(`${socket.sessionID}:${socket.id} - Geolocation error: ${err}`);
        }
    }

    // Method to logout users
    async handleClientLogout(socket, cb) {
        try {
            if (!this.sessionStore[socket.sessionID].username) {
                throw `Not logged in`;
            }
            const username = this.sessionStore[socket.sessionID].username;
            this.sessionStore[socket.sessionID].username = undefined;
            console.log(`${socket.sessionID}:${socket.id} - Logout from username '${username}'`);
            cb(null, 'Logged out');
        } catch (err) {
            cb(err);
            console.error(`${socket.sessionID}:${socket.id} - Logout error: ${err}`);
        }
    }

    // Method to Registration users
    async handleClientRegistration(socket, data, cb) {
        try {
            if (this.sessionStore[socket.sessionID].username) {
                throw `Cannot register while logged in`;
            }
            const required_fields = ['username', 'password', 'email', 'last_name', 'first_name', 'date_of_birth'];
            for (const field of required_fields) {
                if (!data[field]) {
                    throw `Missing ${field} for registration`;
                }
            }
            // Check if the username already exists to insert new registration in the users_preview table
            const activation_key = base64id.generateId();
            await this.checkAndHashPassword(data);
            const condition =
                `SELECT username FROM users_preview WHERE username = '${data.username}'
                UNION
                SELECT username FROM users WHERE username = '${data.username}'`;
            const query_iwne = this.db.insert_where_not_exists('users_preview', { ...data, activation_key: activation_key }, condition);
            const result = await this.db.execute(query_iwne);
            if (result.length === 0) {
                throw `Username '${data.username}' already exists`;
            }
            // Send the confirmation email
            const activation_link = `https://localhost:443/confirm?activation_key=${activation_key}`;
            const activation_link_dev = `http://localhost:5173/confirm?activation_key=${activation_key}`;
            await this.transporter.sendMail({
                from: 'email@server.com',
                to: data.email,
                subject: 'Account registration',
                html:
                    `Here is the link to confirm your registration: <a href="${activation_link}">${activation_link}</a>
                <br>For development purposes: <a href="${activation_link_dev}">${activation_link_dev}</a>`
            });
            console.log(`${socket.sessionID}:${socket.id} - Confirmation email sent to '${data.email}'`);
            cb(null, 'Confirmation email sent');
        } catch (err) {
            cb(err);
            console.error(`${socket.sessionID}:${socket.id} - Registration error: ${err}`);
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
            delete user.activation_key;
            const query_insert = this.db.insert('users', user);
            await this.db.execute(query_insert);
            const query_delete = this.db.delete('users_preview', `activation_key = '${activation_key}'`);
            await this.db.execute(query_delete);
            console.log(`${socket.sessionID}:${socket.id} - Registration confirmed for username '${user.username}'`);
            cb(null, 'Registration confirmed');
        } catch (err) {
            console.error(`${socket.sessionID}:${socket.id} - Registration confirmation error: ${err}`);
            cb(err);
        }
    }

    async handleClientUnregistration(socket, cb) {
        try {
            if (!this.sessionStore[socket.sessionID].username) {
                throw `Not logged in`;
            }
            const { username } = this.sessionStore[socket.sessionID].username;
            const query_delete = this.db.delete('users', `username = '${username}'`);
            await this.db.execute(query_delete);
            this.sessionStore[socket.sessionID].username = undefined;
            console.log(`${socket.sessionID}:${socket.id} - Unregistration for username '${username}'`);
            cb(null, 'User unregistered');
        } catch (err) {
            cb(err);
            console.error(`${socket.sessionID}:${socket.id} - Unregistration error: ${err}`);
        }
    }

    // Method to login users
    async handleClientLogin(socket, data, cb) {
        try {
            if (this.sessionStore[socket.sessionID].username) {
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
            this.sessionStore[socket.sessionID] = { username: data.username };
            socket.emit('server:request:geolocation');
            cb(null, 'User logged in');
            console.log(`${socket.sessionID}:${socket.id} - Login with username '${username}'`);
        } catch (err) {
            cb(err);
            console.error(`${socket.sessionID}:${socket.id} - Login error: ${err}`);
        }
    }

    // Method to send a new password by email
    async handleClientPasswordReset(socket, data, cb) {
        try {
            if (this.sessionStore[socket.sessionID].username) {
                throw `Cannot reset password while logged in`;
            }
            const { email } = data;
            const query_select = this.db.select('users', '*', `email = '${email}'`);
            const user = (await this.db.execute(query_select))[0];
            if (!user) {
                throw `Email '${email}' not found`;
            }
            const password = base64id.generateId();
            const query_update = this.db.update('users', { password: password }, `email = '${email}'`);
            await this.db.execute(query_update);
            await this.transporter.sendMail({
                from: 'email@server.com',
                to: email,
                subject: 'New password',
                html: `Your new password is: ${password}`
            });
            console.log(`${socket.sessionID}:${socket.id} - New password sent by email to '${email}'`);
            cb(null, 'New password sent by email');
        } catch (err) {
            cb(err);
            console.error(`${socket.sessionID}:${socket.id} - Password reset error: ${err}`);
        }
    }

    // Method to edit users
    async handleClientEditProfile(socket, data, cb) {
        try {
            const { username } = this.sessionStore[socket.sessionID];
            if (!this.sessionStore[socket.sessionID].username) {
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
            console.log(`${socket.sessionID}:${socket.id} - Edit profil for username '${username}'`);
            cb(null, 'User edited');
        } catch (err) {
            cb(err);
            console.error(`${socket.sessionID}:${socket.id} - Edit profil error: ${err}`);
        }
    }

    // Method to view user's profile
    async handleViewProfile(socket, data, cb) {
        try {
            if (!this.sessionStore[socket.sessionID].username) {
                throw `Not logged in`;
            }
            const { username } = data;
            const fields = ['username', 'last_name', 'first_name', 'date_of_birth', 'gender', 'sexual_orientation', 'biography', 'interests', 'pictures', 'fame_rating', 'geolocation'];
            const query_select = this.db.select('users', fields, `username = '${username}'`);
            const user = (await this.db.execute(query_select))[0];
            if (!user) {
                throw `Username '${username}' not found`;
            }
            if (!user.viewers.includes(this.sessionStore[socket.sessionID].username)) {
                user.viewers = [...user.viewers, this.sessionStore[socket.sessionID].username];
                const query_update = this.db.update('users', { viewers: user.viewers, fame_rating: user.fame_rating + 1 }, `username = '${username}'`);
                await this.db.execute(query_update);
            }
            console.log(`${socket.sessionID}:${socket.id} - View profil for username '${username}'`);
            cb(null, user);
        } catch (err) {
            cb(err);
            console.error(`${socket.sessionID}:${socket.id} - View profil error: ${err}`);
        }
    }

    // Method to like user's profile
    async handleLikeProfile(socket, data, cb) {
        try {
            if (!this.sessionStore[socket.sessionID].username) {
                throw `Not logged in`;
            }
            const { username } = data;
            const query_select = this.db.select('users', 'likers', `username = '${username}'`);
            const user = (await this.db.execute(query_select))[0];
            if (!user) {
                throw `Username '${username}' not found`;
            }
            if (!user.likers.includes(this.sessionStore[socket.sessionID].username)) {
                user.likers = [...user.likers, this.sessionStore[socket.sessionID].username];
                const query_update = this.db.update('users', { viewers: user.likers, fame_rating: user.fame_rating + 42 }, `username = '${username}'`);
                await this.db.execute(query_update);
            }
            console.log(`${socket.sessionID}:${socket.id} - Like profil for username '${username}'`);
            cb(null, 'User liked');
        }
        catch (err) {
            cb(err);
            console.error(`${socket.sessionID}:${socket.id} - Like profil error: ${err}`);
        }
    }

    // Method to unlike user's profile
    async handleUnlikeProfile(socket, data, cb) {
        try {
            if (!this.sessionStore[socket.sessionID].username) {
                throw `Not logged in`;
            }
            const { username } = data;
            const query_select = this.db.select('users', 'likers', `username = '${username}'`);
            const user = (await this.db.execute(query_select))[0];
            if (!user) {
                throw `Username '${username}' not found`;
            }
            if (user.likers.includes(this.sessionStore[socket.sessionID].username)) {
                user.likers = user.likers.filter((liker) => liker !== this.sessionStore[socket.sessionID].username);
                const query_update = this.db.update('users', { viewers: user.likers, fame_rating: user.fame_rating - 42 }, `username = '${username}'`);
                await this.db.execute(query_update);
            }
            console.log(`${socket.sessionID}:${socket.id} - Unlike profil for username '${username}'`);
            cb(null, 'User unliked');
        }
        catch (err) {
            cb(err);
            console.error(`${socket.sessionID}:${socket.id} - Unlike profil error: ${err}`);
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