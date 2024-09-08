const Email = require('./email');

class Event {
    constructor(io, db, store) {
        this.io = io;
        this.configureBinds();
        this.db = db;
        this.email = new Email();
        this.store = store;
        this.handleClientConnection();
    }

    configureBinds() {
        const eventHandlers = [
            'handleClientBlock',
            'handleClientBrowsing',
            'handleClientChat',
            'handleClientChatHistories',
            'handleClientEdit',
            'handleClientGeolocation',
            'handleClientLike',
            'handleClientLikers',
            'handleClientLogin',
            'handleClientLogout',
            'handleClientMatchs',
            'handleClientPasswordReset',
            'handleClientPasswordResetConfirmation',
            'handleClientRegistration',
            'handleClientRegistrationConfirmation',
            'handleClientReport',
            'handleClientResearch',
            'handleClientUnblock',
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
            socket.join(socket.handshake.sessionID);

            // Log the connection
            console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Connected`);

            // Get the session data from the store and update the online status in the database if logged in 
            const session_account = await this.getSessionAccount(socket.handshake.sessionID);
            if (session_account) {

                // Emit to the socket of the session
                socket.emit('server:account', { account: account_data.id });

                // Join all match rooms of the current session account and notify the other clients of the connection
                (await this.db.execute(
                    this.db.select('users_match', ['id'], `accounts @> ARRAY[${account_data.id}]`)
                ))?.forEach(room => {
                    this.io.to(room.id).emit('server:online', { account: account_data.id });
                    socket.join(room.id);
                });

                // Get offline notifications
                const notifications = await this.db.execute(
                    this.db.select('users_notification', ['data'], `account = ${account_data.id}`)
                );
                // If there are notifications
                if (notifications.length > 0) {
                    // For each notification
                    notifications.forEach(notification => {
                        // Emit to each socket of the session
                        socket.emit('server:notification', notification.data);
                    });
                    // Clear the notifications
                    await this.db.execute(
                        this.db.delete('users_notification', `account = ${account_data.id}`)
                    );
                }

                // Get geolocation proxy boolean
                const geolocation_proxy = (await this.db.execute(
                    this.db.select('users_public', ['geolocation_proxy'], `id = ${account_data.id}`)
                ))[0].geolocation_proxy;
                if (geolocation_proxy) {
                    // Get geolocation and location by IP address and update the user's data
                    const { latitude, longitude, location } = await getGeolocationAndLocationByIP(socket.handshake.headers['x-forwarded-for'] || socket.handshake.address);
                    if (latitude && longitude && location) {
                        await this.db.execute(
                            this.db.update('users_public', { geolocation: [latitude, longitude], location: location }, `id = ${account_data.id}`)
                        )
                    }
                    // Request geolocation
                    socket.emit('server:geolocation');
                    console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Approximate geolocation by IP address (${latitude}, ${longitude}): ${location}`);
                }

                // View own profile at login
                await this.handleClientView(socket, { account: account_data.id }, (err, result) => {
                    if (!err) {
                        console.error("An error occurred:", err);
                    }
                });

            }

            // Handle the client events
            const events = [
                { name: 'client:block', handler: 'handleClientBlock', arguments: ['data', 'cb'] },
                { name: 'client:browsing', handler: 'handleClientBrowsing', arguments: ['data', 'cb'] },
                { name: 'client:chat', handler: 'handleClientChat', arguments: ['data', 'cb'] },
                { name: 'client:chat_histories', handler: 'handleClientChatHistories', arguments: ['cb'] },
                { name: 'client:edit', handler: 'handleClientEdit', arguments: ['data', 'cb'] },
                { name: 'client:geolocation', handler: 'handleClientGeolocation', arguments: ['data', 'cb'] },
                { name: 'client:like', handler: 'handleClientLike', arguments: ['data', 'cb'] },
                { name: 'client:likers', handler: 'handleClientLikers', arguments: ['cb'] },
                { name: 'client:login', handler: 'handleClientLogin', arguments: ['data', 'cb'] },
                { name: 'client:logout', handler: 'handleClientLogout', arguments: ['cb'] },
                { name: 'client:matchs', handler: 'handleClientMatchs', arguments: ['cb'] },
                { name: 'client:password_reset', handler: 'handleClientPasswordReset', arguments: ['data', 'cb'] },
                { name: 'client:password_reset_confirmation', handler: 'handleClientPasswordResetConfirmation', arguments: ['data', 'cb'] },
                { name: 'client:registration', handler: 'handleClientRegistration', arguments: ['data', 'cb'] },
                { name: 'client:registration_confirmation', handler: 'handleClientRegistrationConfirmation', arguments: ['data', 'cb'] },
                { name: 'client:report', handler: 'handleClientReport', arguments: ['data', 'cb'] },
                { name: 'client:research', handler: 'handleClientResearch', arguments: ['data', 'cb'] },
                { name: 'client:unblock', handler: 'handleClientUnblock', arguments: ['data', 'cb'] },
                { name: 'client:unlike', handler: 'handleClientUnlike', arguments: ['data', 'cb'] },
                { name: 'client:unregistration', handler: 'handleClientUnregistration', arguments: ['cb'] },
                { name: 'client:view', handler: 'handleClientView', arguments: ['data', 'cb'] },
                { name: 'client:viewers', handler: 'handleClientViewers', arguments: ['cb'] }
            ];
            events.forEach(event => {
                if (event.arguments.length === 2) {
                    socket.on(event.name, (data, cb) => {
                        if (typeof data === 'object' && typeof cb === 'function') {
                            this[event.handler](socket, data, cb);
                        }
                    });
                } else if (event.arguments.length === 1) {
                    socket.on(event.name, (cb) => {
                        if (typeof cb === 'function') {
                            this[event.handler](socket, cb);
                        }
                    });
                }
            });

            // Handle the client disconnection
            socket.on('disconnect', async (err) => {

                // Leave the session room
                socket.leave(socket.handshake.sessionID);

                // Get the session data from the store and update the online status in the database if logged in
                const session_account = await this.getSessionAccount(socket.handshake.sessionID);
                if (session_account) {
                    // If there is no more socket of the session
                    if (!this.io.sockets.adapter.rooms.get(socket.handshake.sessionID)) {
                        // Update the online status in the database
                        await this.db.execute(
                            this.db.update('users_public', { online: false, last_connection: 'NOW()' }, `id = ${session_account}`)
                        );
                    }

                    // Leave all match rooms and notify the other clients of the disconnection
                    Object.keys(socket.rooms)?.forEach(room => {
                        socket.leave(room);
                        this.io.to(room).emit('serveur:offline', { account: session_account });
                    });
                }

                // Log the disconnection
                console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Disconnected${err ? `(${err})` : ``}`);
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

    async getSessionAccount(sessionID) {
        return (await this.db.execute(
            this.db.select('users_session', ['account'], `sid = '${sessionID}'`)
        ))[0]?.account;
    }

    async setSessionAccount(sessionID, account) {
        await this.db.execute(
            this.db.update('users_session', { account: account }, `sid = '${sessionID}'`)
        );
    }
}

module.exports = Event;
