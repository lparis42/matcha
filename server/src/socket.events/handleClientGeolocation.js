const axios = require('axios');
const geoip = require('geoip-lite');


async function handleClientGeolocation(socket, data, cb) {
    
    try {
        // Extract data
        const session = await this.getSession(socket.handshake.sessionID);
        if (!session.account) {
            throw { client: 'Cannot update geolocation while not logged in', status: 401 };
        }
        let { latitude, longitude } = data;
        if (latitude && typeof latitude !== 'number' || longitude && typeof longitude !== 'number') {
            throw { client: 'Invalid geolocation', status: 400 };
        }
        
        if (!latitude || !longitude) {
            // Get geolocation by IP address
            let ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
            let geo = geoip.lookup(ip);
            if (!geo) {
                // Get public IP if running locally
                ip = (await axios.get('https://api.ipify.org?format=json')).data.ip;
                geo = geoip.lookup(ip);
                if (!geo) {
                    throw 'Geolocation not found';
                }
            }
            latitude = geo.ll[0];
            longitude = geo.ll[1];
            const address = `${geo.country}, ${geo.region}, ${geo.city}`;
            await this.db.execute(
                this.db.update('users_public', { geolocation: [latitude, longitude], location: address }, `id = ${session.account}`)
            );

            cb && typeof cb === 'function' ? cb(null) : null;
            console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Approximate geolocation by IP address (${latitude}, ${longitude}): ${address}`);
        } else {
            // Get geolocation by coordinates
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            if (response.data.error) {
                throw 'Geolocation not found';
            }
            const address = response.data.display_name;
            await this.db.execute(
                this.db.update('users_public', { geolocation: [latitude, longitude], location: address }, `id = ${session.account}`)
            );
            cb && typeof cb === 'function' ? cb(null) : null;
            console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Current geolocation emitted by the client (${latitude}, ${longitude}): ${address}`);
        }
    } catch (err) {
        cb && typeof cb === 'function' ? cb({ message: err.client || 'Internal server error', status: err.status || 500 }) : null;
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Geolocation error: ${err.client || err}`);
    }
}

module.exports = handleClientGeolocation;