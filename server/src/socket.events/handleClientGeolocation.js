const { getAddressByGeolocation } = require('../utils');

async function handleClientGeolocation(socket, data, cb) {
    try {
        // Extract data
        const session_account = await this.getSessionAccount(socket.handshake.sessionID);
        if (!session_account) {
            throw { client: 'Cannot update geolocation while not logged in', status: 401 };
        }
        const { latitude, longitude } = data;
        if (!latitude || typeof latitude !== 'number' || !longitude || typeof longitude !== 'number') {
            throw { client: 'Invalid geolocation', status: 400 };
        }

        // Get geolocation by coordinates
        const address = await getAddressByGeolocation(latitude, longitude);
        await this.db.execute(
            this.db.update('users_public', { geolocation: [latitude, longitude], location: address }, `id = ${session_account}`)
        );

        cb(null);
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Current geolocation emitted by the client (${latitude}, ${longitude}): ${address}`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Geolocation error: ${err.client || err}`);
    }
}

module.exports = handleClientGeolocation;
