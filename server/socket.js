const socketIo = require('socket.io');
const Email = require('./email');

class Socket {
    constructor(server, db) {
        this.io = socketIo(server);
        this.db = db;
        this.email = new Email(require('nodemailer').createTransport(require('./constants').nodemailer));
        this.session_store = {};
        this.configureMiddleware();
        this.configureBinds();
        this.handleClientConnection();
    }

    configureMiddleware() {
        const MAX_MESSAGE_SIZE = 2000;
        // const MIN_DELAY_BETWEEN_MESSAGES = 100;
        // const message_timestamps = {};

        this.io.use((socket, next) => {
            socket.use((packet, nextPacket) => {
                try {
                    // Check packet size
                    const size = Buffer.byteLength(JSON.stringify(packet), 'utf8');
                    if (size > MAX_MESSAGE_SIZE) {
                        throw `Packet size too large (${size} bytes)`;
                    }
                    // // Check delay between messages
                    // const now = Date.now();
                    // const last_timestamp = message_timestamps[socket.id] || 0;
                    // message_timestamps[socket.id] = now;
                    // while (now - last_timestamp < MIN_DELAY_BETWEEN_MESSAGES) {
                    //     throw `Packets sent too quickly`;
                    // }
                } catch (err) {
                    return console.error(`Middleware - ${socket.handshake.headers['x-forwarded-for'] || socket.handshake.address} - ${err} - Ignoring packet`);
                }

                nextPacket();
            });

            next();
        });
    }

    configureBinds() {
        const eventHandlers = [
            'handleClientChat',
            'handleClientEdit',
            'handleClientGeolocation',
            'handleClientLike',
            'handleClientLikers',
            'handleClientLogin',
            'handleClientLogout',
            'handleClientPasswordReset',
            'handleClientRegistration',
            'handleClientRegistrationConfirmation',
            'handleClientUnlike',
            'handleClientUnregistration',
            'handleClientView',
            'handleClientViewers'
        ];

        eventHandlers.forEach(handler => {
            this[handler] = require(`./socket.events/${handler}`).bind(this);
        });
    }

    async configureSession(socket) {
        const ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
        const session_token = socket.handshake.auth.token;
        // Check if the session already exists
        if (this.session_store[session_token]) {
            console.log(`${session_token}:${socket.id} - Reconnected from ${ip}`);
        }
        // Create a new session if it does not exist
        else if (!this.session_store[session_token]) {
            const random_auth_token = this.generateSecurePassword(20);
            socket.handshake.auth.token = random_auth_token;
            this.session_store[random_auth_token] = { account: null };
            console.log(`${random_auth_token}:${socket.id} - Connected from ${ip}`);
            socket.emit('server:session', random_auth_token);
        }
        // Join the room of the session
        socket.join(socket.handshake.auth.token);
    }

    handleClientConnection() {
        this.io.on('connection', async (socket) => {

            // Configure the session
            await this.configureSession(socket);

            // Handle the client events
            socket.on('client:chat', (data, cb) => { this.handleClientChat(socket, data, cb) });
            socket.on('client:edit', (data, cb) => { this.handleClientEdit(socket, data, cb) });
            socket.on('client:geolocation', (data) => { this.handleClientGeolocation(socket, data) });
            socket.on('client:like', (data, cb) => { this.handleClientLike(socket, data, cb) });
            socket.on('client:likers', (cb) => { this.handleClientLikers(socket, cb) });
            socket.on('client:login', (data, cb) => { this.handleClientLogin(socket, data, cb) });
            socket.on('client:logout', (cb) => { this.handleClientLogout(socket, cb) });
            socket.on('client:password_reset', (data, cb) => { this.handleClientPasswordReset(socket, data, cb) });
            socket.on('client:registration', (data, cb) => { this.handleClientRegistration(socket, data, cb) });
            socket.on('client:registration_confirmation', (data, cb) => { this.handleClientRegistrationConfirmation(socket, data, cb) });
            socket.on('client:unlike', (data, cb) => { this.handleClientUnlike(socket, data, cb) });
            socket.on('client:unregistration', (cb) => { this.handleClientUnregistration(socket, cb) });
            socket.on('client:view', (data, cb) => { this.handleClientView(socket, data, cb) });
            socket.on('client:viewers', (cb) => { this.handleClientViewers(socket, cb) });

            // Handle the client disconnection
            socket.on('disconnect', () => {
                socket.leave(socket.handshake.auth.token);
                console.log(`${socket.handshake.auth.token}:${socket.id} - Disconnected`);
            });
        });
    }

    // ** Helper functions ** //

    // Generate a secure password
    generateSecurePassword(length) {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
        let retVal = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
    }
}

module.exports = Socket;