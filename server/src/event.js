const Email = require('./email');
const Database = require('./database');
const constants = require('./constants');


class Event {
    constructor(io, store) {
        this.io = io;
        this.configureBinds();
        this.db = new Database(...Object.values(constants.database.connection_parameters));
        this.configureDatabase();
        this.email = new Email();
        this.store = store;
        this.handleClientConnection();
    }

    // Configure the database
    async configureDatabase() {
        await this.db.connect();
        await this.db.execute(this.db.drop('users_matchs')); // For testing purposes
        await this.db.execute(this.db.drop('users_private')); // For testing purposes
        await this.db.execute(this.db.drop('users_preview')); // For testing purposes
        await this.db.execute(this.db.drop('users_public')); // For testing purposes
        await this.db.execute(this.db.create('users_private', constants.database.users_private.columns));
        await this.db.execute(this.db.create('users_preview', constants.database.users_preview.columns));
        await this.db.execute(this.db.create('users_public', constants.database.users_public.columns));
        await this.db.execute(this.db.create('users_matchs', constants.database.users_matchs.columns));

        console.log(`Database configured`);
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
            'handleClientPasswordResetConfirmation',
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

    handleClientConnection() {
        this.io.on('connection', async (socket) => {
            if (socket.handshake.auth.testing === true) {
                this.setSession(socket.handshake.sessionID, { account: 0 });
            }

            // Get the session
            const session = await this.getSession(socket.handshake.sessionID);
            if (!session) {
                socket.disconnect();
                console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - No session found - Disconnected`);
                return;
            }

            // Join the room of the current session
            socket.join(socket.request.sessionID);

            // Log the connection
            console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Connected`);

            // Handle the client events
            socket.on('client:chat', (data, cb) => { this.handleClientChat(socket, data, cb) });
            socket.on('client:edit', (data, cb) => { this.handleClientEdit(socket, data, cb) });
            socket.on('client:geolocation', (data) => { this.handleClientGeolocation(socket, data) });
            socket.on('client:like', (data, cb) => { this.handleClientLike(socket, data, cb) });
            socket.on('client:likers', (cb) => { this.handleClientLikers(socket, cb) });
            socket.on('client:login', (data, cb) => { this.handleClientLogin(socket, data, cb) });
            socket.on('client:logout', (cb) => { this.handleClientLogout(socket, cb) });
            socket.on('client:password_reset', (data, cb) => { this.handleClientPasswordReset(socket, data, cb) });
            socket.on('client:password_reset_confirmation', (data, cb) => { this.handleClientPasswordResetConfirmation(socket, data, cb) });
            socket.on('client:registration', (data, cb) => { this.handleClientRegistration(socket, data, cb) });
            socket.on('client:registration_confirmation', (data, cb) => { this.handleClientRegistrationConfirmation(socket, data, cb) });
            socket.on('client:unlike', (data, cb) => { this.handleClientUnlike(socket, data, cb) });
            socket.on('client:unregistration', (cb) => { this.handleClientUnregistration(socket, cb) });
            socket.on('client:view', (data, cb) => { this.handleClientView(socket, data, cb) });
            socket.on('client:viewers', (cb) => { this.handleClientViewers(socket, cb) });

            // Handle the client disconnection
            socket.on('disconnect', () => {
                socket.leave(socket.handshake.sessionID);
                console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Disconnected`);
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

    getSession(sessionId) {
        return new Promise((resolve, reject) => {
            this.store.get(sessionId, (error, session) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(session);
                }
            });
        });
    };

    setSession(sessionId, session) {
        return new Promise((resolve, reject) => {
            this.store.set(sessionId, session, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = Event;