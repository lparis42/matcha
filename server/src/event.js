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

        // For testing purposes
        const ClientSimulator = require('./client.simulator');
        const clientSimulators = Array.from({ length: 2 }, () => new ClientSimulator());
        let scores = [0, 0];
        // Registration simulation
        await clientSimulators[0].simulateRegistration() ? scores[0]++ : scores[1]++;
        await clientSimulators[1].simulateRegistration() ? scores[0]++ : scores[1]++;
        // Login simulation
        await clientSimulators[0].simulateLogin() ? scores[0]++ : scores[1]++;
        await clientSimulators[1].simulateLogin() ? scores[0]++ : scores[1]++;
        // Edit simulation
        await clientSimulators[0].simulateEdit() ? scores[0]++ : scores[1]++;
        await clientSimulators[1].simulateEdit() ? scores[0]++ : scores[1]++;
        // View simulation
        await clientSimulators[0].simulateView(2) ? scores[0]++ : scores[1]++;
        await clientSimulators[1].simulateView(1) ? scores[0]++ : scores[1]++;
        // Viewers simulation
        await clientSimulators[0].simulateViewers() ? scores[0]++ : scores[1]++;
        await clientSimulators[1].simulateViewers() ? scores[0]++ : scores[1]++;
        // Like simulation
        await clientSimulators[0].simulateLike(2) ? scores[0]++ : scores[1]++;
        await clientSimulators[1].simulateLike(1) ? scores[0]++ : scores[1]++;
        // Likers simulation
        await clientSimulators[0].simulateLikers() ? scores[0]++ : scores[1]++;
        await clientSimulators[1].simulateLikers() ? scores[0]++ : scores[1]++;
        // Chat simulation
        await clientSimulators[0].simulateChat(2) ? scores[0]++ : scores[1]++;
        await clientSimulators[1].simulateChat(1) ? scores[0]++ : scores[1]++;
        // Unlike simulation
        await clientSimulators[0].simulateUnlike(2) ? scores[0]++ : scores[1]++;
        await clientSimulators[1].simulateUnlike(1) ? scores[0]++ : scores[1]++;
        // Geolocation simulation
        await clientSimulators[0].simulateGeolocation(null, null) ? scores[0]++ : scores[1]++;
        await clientSimulators[1].simulateGeolocation(48.8588443, 2.2943506) ? scores[0]++ : scores[1]++;
        // Unregistration simulation
        await clientSimulators[1].simulateUnregistration() ? scores[0]++ : scores[1]++;
        // Logout simulation
        await clientSimulators[0].simulateLogout() ? scores[0]++ : scores[1]++;
        // Password reset simulation
        await clientSimulators[0].simulatePasswordReset() ? scores[0]++ : scores[1]++;

        // Display the results
        console.log('\r\x1b[K');
        console.log(`ClientSimulator: \x1b[32m${scores[0]} tests passed\x1b[0m, \x1b[31m${scores[1]} tests failed\x1b[0m`);
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

            // Join the room of the current session
            socket.join(socket.request.sessionID);

            // Log the connection
            console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Connected`);

            // Handle the client events
            socket.on('client:chat', (data, cb) => { this.handleClientChat(socket, data, cb) });
            socket.on('client:edit', (data, cb) => { this.handleClientEdit(socket, data, cb) });
            socket.on('client:geolocation', (data, cb) => { this.handleClientGeolocation(socket, data, cb) });
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