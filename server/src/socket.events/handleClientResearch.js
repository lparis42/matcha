const { handleClientBrowsing } = require('./handleClientBrowsing');

// Method to research clients by filters : age, distance, popularity, tags
async function handleClientResearch(socket, data, cb) {
    try {
        // Extract data
        const session_account = await this.getSessionAccount(socket.handshake.sessionID);
        if (!session_account) {
            throw { client: 'Cannot request research while not logged in', status: 401 };
        }
        const { age_min, age_max, dist_min, dist_max, fame_min, fame_max, tags, browsing_start, browsing_stop } = data;
        if (age_min && typeof age_min !== 'number' || age_max && typeof age_max !== 'number' ||
            dist_min && typeof dist_min !== 'number' || dist_max && typeof dist_max !== 'number' ||
            fame_min && typeof fame_min !== 'number' || fame_max && typeof fame_max !== 'number' ||
            tags && !Array.isArray(tags) && tags.some(tag => typeof tag !== 'number') ||
            browsing_start && typeof browsing_start !== 'number' || browsing_stop && typeof browsing_stop !== 'number') {
            throw { client: 'Invalid data', status: 400 };
        }
        const browsing_data = await new Promise((resolve, reject) => {
            const data = { browsing_start: 0, browsing_stop: Infinity };
            handleClientBrowsing(socket, data, (err, response) => {
                err ? reject(err) : resolve(response)
            })
        });
        // browsing_data returns a list of : {
        // id: match.id,
        // first_name: match.first_name,
        // date_of_birth: match.date_of_birth,
        // common_tags: match.common_tags,
        // picture: account_data.pictures[0],
        // geolocation: match.geolocation,
        // location: match.location,
        // online: match.online
        // }

        // Filter the matches by age, distance, popularity and tags and return the result to the client 
        const filtered_data = browsing_data.filter(match => {
            const age = new Date().getFullYear() - new Date(match.date_of_birth).getFullYear();
            const distance = Math.sqrt(
                Math.pow((browsing_data.geolocation[0] - match.geolocation[0]) / 111.12, 2) +
                Math.pow((browsing_data.geolocation[1] - match.geolocation[1]) / 111.12, 2)
            );
            return (age >= age_min) && (age <= age_max) &&
                (distance >= dist_min) && (distance <= dist_max) &&
                (match.fame_rating >= fame_min) && (match.fame_rating <= fame_max) &&
                (tags.length === 0 || tags.every(tag => match.common_tags.includes(tag)));
        });
        const sorted_filtered_data = Object.values(filtered_data).flat().slice(browsing_start || 0, browsing_stop || matches.length);

        // Emit to the client the filtered data
        cb(null, sorted_filtered_data);
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Request research`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Request research: ${err.client || err}`);
    }
}

module.exports = handleClientResearch;