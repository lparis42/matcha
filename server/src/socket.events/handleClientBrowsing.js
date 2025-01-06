const structure = require("../structure");

function haversineDistance(account, match) {

    const lat1 = account.geolocation[0] 
    const lon1 = account.geolocation[1]
    const lat2 = match.geolocation[0]
    const lon2 = match.geolocation[1];

    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers

    return distance;
}

async function handleClientBrowsing(socket, data, cb) {
    try {
        // Extract data
        const session_account = await this.getSessionAccount(socket.handshake.sessionID);
        if (!session_account) {
            throw { client: 'Account not found', status: 404 };
        }
        const { browsing_start, browsing_stop, sort } = data;
        if (browsing_start && typeof browsing_start !== 'number' || browsing_stop && typeof browsing_stop !== 'number') {
            throw { client: 'Invalid browsing window', status: 400 };
        }
        if (!sort || typeof sort !== 'string' || sort !== 'common_tags' && sort !== 'fame_rating' && sort !== 'distance' && sort !== 'age_difference') {
            throw { client: 'Invalid sort', status: 400 };
        }
        const account_data = (await this.db.execute(
            this.db.select('users_public',
                [`first_name`, `date_of_birth`, `gender`, `sexual_orientation`, `common_tags`, `pictures`, `fame_rating`, `geolocation`],
                `id = ${session_account}`)
        ))[0];
        // Get the blocked accounts of the user
        const blocked_accounts = (await this.db.execute(
            this.db.select('users_private', ['blocked_accounts'], `id = ${session_account}`)
        ))[0].blocked_accounts;

        //Get the id of account user liked
        const liked_accounts = (await this.db.execute(
            this.db.select('users_private', ['id'], `likers @> '{${session_account}}'`)
        ));

        let gender_browsing = null;
        switch (account_data.sexual_orientation) {
            case 'Heterosexual':
                gender_browsing = account_data.gender === 'Male' ? `'Female'` : `'Male'`;
                break;
            case 'Homosexual':
                gender_browsing = `'${account_data.gender}'`;
                break;
            default:
                break;
        }
        let matches = await this.db.execute(
            this.db.select('users_public',
                ['id', 'first_name', 'date_of_birth', 'common_tags', 'pictures', 'fame_rating', 'geolocation', 'location', 'online', 'pictures'],
                (blocked_accounts.length > 0 ? `id NOT IN (${blocked_accounts.join(',')}) AND ` : '') +
                `id != ${session_account}` + (gender_browsing ? ` AND gender IN (${gender_browsing})` : ``) +
                (liked_accounts.length > 0 ? ` AND id NOT IN (${liked_accounts.map(account => account.id).join(',')})` : ``)
        ));

        // Calculate the distance and age difference between the account and the matches
        const matches_with_calculated_data = matches.map((match) => {
            const distance = match.geolocation && account_data.geolocation ? haversineDistance(account_data, match) : 1000;
            const age_difference = match.date_of_birth && account_data.date_of_birth ?
                new Date(match.date_of_birth).getFullYear() - new Date(account_data.date_of_birth).getFullYear()
                : 1000;
            return { ...match, distance, age_difference: Math.abs(age_difference) };
        });
        
        // Sort the matches by common tags, fame rating, location and age difference
        const sorted_matches = matches_with_calculated_data.sort((a, b) => {
            
            const sorting = (a, b) => {

                if (sort === 'common_tags') {
                    const a_common_tags = Array.isArray(a.common_tags) ? a.common_tags.filter(tag => account_data.common_tags.includes(tag)) : [];
                    const b_common_tags = Array.isArray(b.common_tags) ? b.common_tags.filter(tag => account_data.common_tags.includes(tag)) : [];
                    if (a_common_tags.length !== b_common_tags.length) {
                        return b_common_tags.length - a_common_tags.length;
                    }
                    const a_fame_difference = Math.abs(a.fame_rating - account_data.fame_rating);
                    const b_fame_difference = Math.abs(b.fame_rating - account_data.fame_rating);
                    if (a_fame_difference !== b_fame_difference) {
                        return a_fame_difference - b_fame_difference;
                    }
                    if (a.age_difference !== b.age_difference) {
                        return a.age_difference - b.age_difference;
                    }
                    return a.distance - b.distance;
                } else if (sort === 'fame_rating') {
                    const a_fame_difference = Math.abs(a.fame_rating - account_data.fame_rating);
                    const b_fame_difference = Math.abs(b.fame_rating - account_data.fame_rating);
                    if (a_fame_difference !== b_fame_difference) {
                        return a_fame_difference - b_fame_difference;
                    }
                    const a_common_tags = Array.isArray(a.common_tags) ? a.common_tags.filter(tag => account_data.common_tags.includes(tag)) : [];
                    const b_common_tags = Array.isArray(b.common_tags) ? b.common_tags.filter(tag => account_data.common_tags.includes(tag)) : [];
                    if (a_common_tags.length !== b_common_tags.length) {
                        return b_common_tags.length - a_common_tags.length;
                    }
                    if (a.age_difference !== b.age_difference) {
                        return a.age_difference - b.age_difference;
                    }
                    return a.distance - b.distance;
                } else if (sort === 'distance') {
                    if (a.distance !== b.distance) {
                        return a.distance - b.distance;
                    }
                    const a_common_tags = Array.isArray(a.common_tags) ? a.common_tags.filter(tag => account_data.common_tags.includes(tag)) : [];
                    const b_common_tags = Array.isArray(b.common_tags) ? b.common_tags.filter(tag => account_data.common_tags.includes(tag)) : [];
                    if (a_common_tags.length !== b_common_tags.length) {
                        return b_common_tags.length - a_common_tags.length;
                    }
                    const a_fame_difference = Math.abs(a.fame_rating - account_data.fame_rating);
                    const b_fame_difference = Math.abs(b.fame_rating - account_data.fame_rating);
                    if (a_fame_difference !== b_fame_difference) {
                        return a_fame_difference - b_fame_difference;
                    }
                    return a.age_difference - b.age_difference;
                } else if (sort === 'age_difference') {
                    if (a.age_difference !== b.age_difference) {
                        return a.age_difference - b.age_difference;
                    }
                    const a_common_tags = Array.isArray(a.common_tags) ? a.common_tags.filter(tag => account_data.common_tags.includes(tag)) : [];
                    const b_common_tags = Array.isArray(b.common_tags) ? b.common_tags.filter(tag => account_data.common_tags.includes(tag)) : [];
                    if (a_common_tags.length !== b_common_tags.length) {
                        return b_common_tags.length - a_common_tags.length;
                    }
                    const a_fame_difference = Math.abs(a.fame_rating - account_data.fame_rating);
                    const b_fame_difference = Math.abs(b.fame_rating - account_data.fame_rating);
                    if (a_fame_difference !== b_fame_difference) {
                        return a_fame_difference - b_fame_difference;
                    }
                    return a.distance - b.distance;
                }
            };

            return sorting(a, b);
        });
        // Group the matches by distance and age difference
        const matches_grouped_by_distance_and_age = {
            'close_close': [],
            'close_distant': [],
            'distant_close': [],
            'distant_distant': [],
        };
        sorted_matches.forEach(match => {
            const { distance, age_difference } = match;
            const distance_group = distance <= 25 ? 'close' : 'distant';
            const age_group = age_difference <= 10 ? 'close' : 'distant';
            const group_key = `${distance_group}_${age_group}`;

            matches_grouped_by_distance_and_age[group_key].push(match);
        });
        const sorted_matches_final = Object.values(matches_grouped_by_distance_and_age).flat().slice(browsing_start || 0, browsing_stop || matches.length);
        // Data to return
        const data_to_return = sorted_matches_final.map(match => ({
            id: match.id,
            first_name: match.first_name,
            date_of_birth: match.date_of_birth,
            common_tags: match.common_tags,
            picture: match.pictures[0],
            geolocation: match.geolocation,
            location: match.location,
            online: match.online,
            fame_rating: match.fame_rating,
            distance: match.distance,
        }));

        cb(null, data_to_return);
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Browsing successful`);

    } catch (err) {
        cb({ client: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Browsing error: ${err.client || err}`);
    }
}

module.exports = handleClientBrowsing;
