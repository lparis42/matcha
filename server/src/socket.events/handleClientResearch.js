// Method to research clients by filters : age, distance, popularity, tags
async function handleClientResearch(socket, data, cb) {
    try {
        // Extract data
        const session_account = await this.getSessionAccount(socket.handshake.sessionID);
        if (!session_account) {
            throw { client: 'Cannot request research while not logged in', status: 401 };
        }
        const { age_min, age_max, dist_min, dist_max, fame_min, fame_max, tags, browsing_start, browsing_stop, sort } = data;
        if (age_min && typeof age_min !== 'number' || age_max && typeof age_max !== 'number' ||
            dist_min && typeof dist_min !== 'number' || dist_max && typeof dist_max !== 'number' ||
            fame_min && typeof fame_min !== 'number' || fame_max && typeof fame_max !== 'number' ||
            tags && !Array.isArray(tags) && tags.some(tag => typeof tag !== 'number') ||
            browsing_start && typeof browsing_start !== 'number' || browsing_stop && typeof browsing_stop !== 'number') {
            throw { client: 'Invalid data', status: 400 };
        }
        if (sort && typeof sort !== 'string' && sort !== 'common_tags' && sort !== 'fame_rating' && sort !== 'distance' && sort !== 'age_difference') {
            throw { client: 'Invalid sort', status: 400 };
        }
        const browsing_data = await new Promise((resolve, reject) => {
            const data = { browsing_start: 0, browsing_stop: Infinity, sort: 'common_tags', filter: '' };
            this.handleClientBrowsing(socket, data, (err, response) => {
                err ? reject(err) : resolve(response)
            })
        });

        // Get current user geolocation
        const geolocation = (await (this.db.execute(
            this.db.select('users_public', ['geolocation'], `id = ${session_account}`)
        )))[0].geolocation;

        // Filter the matches by age, distance, popularity and tags and return the result to the client 
        const filtered_data = browsing_data.filter(acc => {
            const age = acc.date_of_birth ? new Date().getFullYear() - new Date(acc.date_of_birth).getFullYear() : Infinity;
            const distance = geolocation && acc.geolocation ? Math.sqrt(
                Math.pow((geolocation[0] - acc.geolocation[0]) / 111.12, 2) +
                Math.pow((geolocation[1] - acc.geolocation[1]) / 111.12, 2)
            ) : Infinity;
            return (age >= age_min) && (age <= age_max) &&
                (distance >= dist_min) && (distance <= dist_max) &&
                (acc.fame_rating >= fame_min) && (acc.fame_rating <= fame_max) &&
                (tags.length === 0 || tags.every(tag => acc.common_tags.includes(tag)));
        });

        const sorted_filtered_data = Object.values(filtered_data).flat().slice(browsing_start || 0, browsing_stop || filtered_data.length);

        // Emit to the client the filtered data
        cb(null, sorted_filtered_data);
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Request research`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Request research: ${err.client || err}`);
    }
}

module.exports = handleClientResearch;