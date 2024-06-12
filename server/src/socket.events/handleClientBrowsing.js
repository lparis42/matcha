const constants = require("../constants");

async function handleClientBrowsing(socket, data, cb) {
    try {
        // Extract data
        const session = await this.getSession(socket.handshake.sessionID);
        if (!session.account) {
            throw { client: 'Account not found', status: 404 };
        }
        const { browsing_start, browsing_stop } = data;
        if (browsing_start && typeof browsing_start !== 'number' || browsing_stop && typeof browsing_stop !== 'number') {
            throw { client: 'Invalid browsing window', status: 400 };
        }
        const fields = [`first_name`, `date_of_birth`, `gender`, `sexual_orientation`, `common_tags`, `pictures`, `fame_rating`, `geolocation`, `last_connection`];
        const account_data = (await this.db.execute(
            this.db.select('users_public', fields, `id = ${session.account}`)
        ))[0];
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
            this.db.select('users_public', ['id', 'first_name', 'date_of_birth', 'common_tags', 'pictures', 'fame_rating', 'geolocation', 'location'],
                `id != ${session.account}` + gender_browsing ? ` AND gender IN (${gender_browsing})` : ``)
        );
        if (!matches.length) {
            throw { client: 'No potential matches found', status: 404 };
        }

        // Calculate the distance and age difference between the account and the matches
        const matches_with_calculated_data = matches.map((match) => {
            const distance = Math.sqrt(
                Math.pow((geolocation[0] - match.geolocation[0]) / 111.12, 2) +
                Math.pow((geolocation[1] - match.geolocation[1]) / 111.12, 2)
            );
            const age_difference = new Date(match.date_of_birth).getFullYear() - new Date(account_data.date_of_birth).getFullYear();
            return { ...match, distance, age_difference: Math.abs(age_difference) };
        });
        // Sort the matches by common tags, fame rating and age difference
        const sorted_matches = matches_with_calculated_data.sort((a, b) => {
            const a_common_tags = a.common_tags.filter(tag => account_data.common_tags.includes(tag));
            const b_common_tags = b.common_tags.filter(tag => account_data.common_tags.includes(tag));
            if (a_common_tags.length !== b_common_tags.length) {
                return b_common_tags.length - a_common_tags.length;
            }
            const a_fame_difference = Math.abs(a.fame_rating - account_data.fame_rating);
            const b_fame_difference = Math.abs(b.fame_rating - account_data.fame_rating);
            if (a_fame_difference !== b_fame_difference) {
                return a_fame_difference - b_fame_difference;
            }
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
        const data_to_return = sorted_matches_final.map(async match => ({
            id: match.id,
            first_name: match.first_name,
            date_of_birth: match.date_of_birth,
            common_tags: match.common_tags,
            picture: account_data.pictures[0],
            geolocation: match.geolocation,
            location: match.location,
            online: await this.getSessionByAccount(match.id).account ? true : false
        }));

        cb(null, data_to_return);
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Browsing successful`);

    } catch (err) {
        cb({ client: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Browsing error: ${err.client || err}`);
    }
}

module.exports = handleClientBrowsing;