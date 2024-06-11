const constants = require("../constants");

async function handleClientBrowsing(socket, cb) {
    try {
        // Extract data
        const session = await this.getSession(socket.handshake.sessionID);
        if (!session.account) {
            throw { client: 'Account not found', status: 404 };
        }
        const fields = [`date_of_birth`, `gender`, `sexual_orientation`, `interests`, `fame_rating`, `geolocation`, `last_connection`];
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
        const conditions =
            `id != ${session.account}` +
            (gender_browsing ?
                ` AND ` + `gender IN (${gender_browsing})` : ``) +
            (account_data.geolocation ?
                ` AND ` + `geolocation[1] BETWEEN ${account_data.geolocation[1] - 0.45} AND ${account_data.geolocation[1] + 0.45}` +
                ` AND ` + `geolocation[0] BETWEEN ${account_data.geolocation[0] - 0.45} AND ${account_data.geolocation[0] + 0.45}` : ``);

        console.log(account_data.gender, account_data.sexual_orientation, conditions);
        // Update
        const potential_matches = await this.db.execute(
            this.db.select('users_public', ['id'], conditions)
        );
        cb(null, potential_matches.map(match => match.id));
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Browsing successful`);

    } catch (err) {
        cb({ client: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Browsing error: ${err.client || err}`);
    }
}

module.exports = handleClientBrowsing;