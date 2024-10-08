const bcrypt = require('bcrypt');
const validator = require('validator');
const geoip = require('geoip-lite');
const axios = require('axios');
const getGeolocationAndLocationByIP = require('./handleClientGeolocation').getGeolocationAndLocationByIP;

// Handler function for client login event
async function handleClientLogin(socket, data, cb) {

    try {
        // Extract data
        const session_account = await this.getSessionAccount(socket.handshake.sessionID);

        if (session_account) {
            throw { client: 'Already logged in', status: 403 };
        }
        const { email, password } = data;
        if (!email || typeof email !== 'string' || !validator.isEmail(email)) {
            throw { client: 'Invalid email', status: 400 };
        }
        if (!password || typeof password !== 'string' || !validator.isLength(password, { min: 8, max: 20 })) {
            throw { client: 'Invalid password', status: 400 };
        }
        const account_data = (await this.db.execute(
            this.db.select('users_private', ['id', 'email', 'password'], `email = '${email}'`)
        ))[0];
        if (!account_data) {
            throw { client: `Email '${email}' not found`, status: 404 };
        }

        // Check if the password is valid
        const is_password_valid = await bcrypt.compare(password, account_data.password);
        if (!is_password_valid) {
            throw { client: 'Invalid password', status: 401 };
        }

        // Log in the account
        await this.setSessionAccount(socket.handshake.sessionID, account_data.id);

        // Emit to all the sockets of the session
        this.io.to(socket.handshake.sessionID).emit('server:account', { account: account_data.id });

        // Join all match rooms of the current session account and notify the other clients of the connection
        (await this.db.execute(
            this.db.select('users_match', ['id'], `accounts @> ARRAY[${account_data.id}]`)
        ))?.forEach(room => {
            this.io.to(room.id).emit('server:online', { account: account_data.id });
            socket.join(room.id);
        });

        // Set online status to true
        await this.db.execute(
            this.db.update('users_public', { online: true }, `id = ${account_data.id}`)
        );

        // Get offline notifications
        const notifications = await this.db.execute(
            this.db.select('users_notification', ['data'], `account = ${session_account}`)
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
                this.db.delete('users_notification', `account = ${session_account}`)
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

        cb(null);

        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Logged in to account '${account_data.id}'`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Login error: ${err.client || err}`);
    }
}

module.exports = handleClientLogin;
