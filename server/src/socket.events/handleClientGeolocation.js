const axios = require('axios');

async function handleClientGeolocation(socket, data, cb) {
    
    try {
        // Extract data
        const session = await this.getSession(socket.handshake.sessionID);
        if (!session.account) {
            throw { client: 'Cannot update geolocation while not logged in', status: 401 };
        }
        const { latitude, longitude } = data;
        if (latitude && typeof latitude !== 'number' || longitude && typeof longitude !== 'number') {
            throw { client: 'Invalid geolocation', status: 400 };
        }
        
        if (!latitude || !longitude) {
            // Get geolocation by IP address
            let ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
            let response;
            response = await axios.get(`http://ip-api.com/json/${ip}`);
            if (response.data.status === 'fail') {
                // Get public IP address if socket IP address is private
                ip = (await axios.get('https://api.ipify.org?format=json')).data.ip;
                response = await axios.get(`http://ip-api.com/json/${ip}`);
                if (response.data.status === 'fail') {
                    throw 'Geolocation not found';
                }
            }
            const latitude = response.data.lat;
            const longitude = response.data.lon;
            const address = `${response.data.country}, ${response.data.regionName}, ${response.data.city}`;
            await this.db.execute(
                this.db.update('users_public', { geolocation: [latitude, longitude] }, `id = ${session.account}`)
            );

            cb(null);
            console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Approximate geolocation by IP address (${latitude}, ${longitude}): ${address}`);
        } else {
            // Get geolocation by coordinates
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            if (response.data.error) {
                throw 'Geolocation not found';
            }
            await this.db.execute(
                this.db.update('users_public', { geolocation: [latitude, longitude] }, `id = ${session.account}`)
            );

            cb(null);
            console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Current geolocation emitted by the client (${latitude}, ${longitude}): ${response.data.display_name}`);
        }
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Geolocation error: ${err.client || err}`);
    }
}

module.exports = handleClientGeolocation;