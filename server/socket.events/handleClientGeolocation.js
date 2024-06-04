const axios = require('axios');

async function handleClientGeolocation(socket, data) {
    const session_token = socket.handshake.auth.token;
    try {
        // Extract data
        const session = this.session_store[session_token];
        if (!session.account) {
            throw { client: 'Cannot update geolocation while not logged in', status: 401 };
        }
        let { latitude, longitude } = data;

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
            latitude = response.data.lat;
            longitude = response.data.lon;
            const address = `${response.data.country}, ${response.data.regionName}, ${response.data.city}`;
            await this.db.execute(
                this.db.update('users_public', { geolocation: [latitude, longitude] }, `id = ${session.account}`)
            );
            console.log(`${session_token}:${socket.id} - Approximate geolocation by IP address (${latitude}, ${longitude}): ${address}`);
        } else {
            // Get geolocation by coordinates
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            if (response.data.error) {
                throw 'Geolocation not found';
            }
            const address = `${response.data.address.country}, ${response.data.address.state}, ${response.data.address.town}`
            await this.db.execute(
                this.db.update('users_public', { geolocation: [latitude, longitude] }, `id = ${session.account}`)
            );
            console.log(`${session_token}:${socket.id} - Current geolocation emitted by the client (${latitude}, ${longitude}): ${address}`);
        }
    } catch (err) {
        console.error(`${session_token}:${socket.id} - Geolocation error: ${err.client || err}`);
    }
}

module.exports = handleClientGeolocation;