// Method to unlike user's profile
async function handleClientUnlike(socket, data, cb) {
    
    try {
        // Extract data
        const session = await this.getSession(socket.handshake.sessionID);
        if (!session.account) {
            throw { client: 'Cannot unlike profile while not logged in', status: 401 };
        }
        const { target_account } = data;
        if (typeof target_account !== 'number' || target_account < 1) {
            throw { client: 'Invalid target account', status: 400 };
        }
        const target_fame_rating = (await this.db.execute(
            this.db.select('users_public', ['fame_rating'], `id = '${target_account}'`)
        ))[0]?.fame_rating;
        if (!target_fame_rating) {
            throw { client: `Account '${target_account}' not found`, status: 404 };
        }
        const target_likers = (await this.db.execute(
            this.db.select('users_private', ['likers'], `id = '${target_account}'`)
        ))[0].likers;

        // Check if target account is already liked
        if (target_likers.includes(session.account)) {

            // Update target user's fame rating and likers
            const fame_rating = target_fame_rating - 10;
            const likers = target_likers.filter(liker => liker !== session.account);
            await this.db.execute(
                this.db.update('users_public', { fame_rating: fame_rating }, `id = '${target_account}'`) +
                this.db.update('users_private', { likers: likers }, `id = '${target_account}'`)
            );

            // Update match status
            await this.db.execute(
                this.db.update('users_matchs', { connected: false }, `accounts @> ARRAY[${session.account}, ${target_account}]`)
            );
        } else {
            throw { client: 'Cannot unlike profile that was not liked', status: 400 };
        }

        cb(null);
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Unlike ${target_account}`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Unlike error: ${err.client || err}`);
    }
}

module.exports = handleClientUnlike;
