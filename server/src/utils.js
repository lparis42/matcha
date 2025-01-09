const axios = require('axios');
const geoip = require('geoip-lite');

async function getAddressByGeolocation(latitude, longitude) {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=14`);
    if (response.data.error) {
        throw 'Geolocation not found';
    }
    return response.data.display_name;
}

async function getGeolocationAndLocationByIP(ip) {
    let geo = geoip.lookup(ip);
    if (!geo) {
        ip = (await axios.get('https://api.ipify.org?format=json')).data.ip;
        geo = geoip.lookup(ip);
        if (!geo) {
            throw 'Geolocation not found';
        }
    }
    return { latitude: geo.ll[0], longitude: geo.ll[1], location: `${geo.country}, ${geo.region}, ${geo.city}` };
}

module.exports = { getAddressByGeolocation, getGeolocationAndLocationByIP };
