async function handleClientLike(socket, data, cb) {
    
    try {
        // Extract data
        const session = await this.getSession(socket.handshake.sessionID);
        if (!session.account) {
            throw { client: 'Cannot like while not logged in', status: 401 };
        }
        const { target_account } = data;
        if (typeof target_account !== 'number' || target_account < 1) {
            throw { client: 'Invalid target account', status: 400 };
        }
        if (session.account === target_account) {
            throw { client: 'Cannot like own account', status: 403 };
        }
        const target_likers = (await this.db.execute(
            this.db.select('users_private', ['likers'], `id = '${target_account}'`)
        ))[0]?.likers;
        if (!target_likers) {
            throw { client: `Account '${target_account}' not found`, status: 404 };
        }
        const pictures = (await this.db.execute(
            this.db.select('users_public', ['pictures'], `id = '${session.account}'`)
        ))[0].pictures;
        if (pictures.length === 0) {
            throw { client: 'Cannot like without at least one picture', status: 403 };
        }

        // Check if target account is already liked
        if (!target_likers.includes(session.account)) {

            // Extract data
            const target_fame_rating = (await this.db.execute(
                this.db.select('users_public', ['fame_rating'], `id = '${target_account}'`)
            ))[0].fame_rating;

            // Update target user's fame rating and likers
            await this.db.execute(
                this.db.update('users_public', { fame_rating: target_fame_rating + 10 }, `id = '${target_account}'`) +
                this.db.update('users_private', { likers: [...target_likers, session.account] }, `id = '${target_account}'`)
            );

            // Extract data
            const likers = (await this.db.execute(
                this.db.select('users_private', ['likers'], `id = '${session.account}'`)
            ))[0].likers;

            // Check if the target account already liked current account
            const connected = (await this.db.execute(
                this.db.select('users_matchs', ['connected'], `accounts @> ARRAY[${session.account}, ${target_account}]`)
            ))[0]?.connected;
            if (connected) {
                await this.db.execute(
                    this.db.update('users_matchs', { connected: true }, `accounts @> ARRAY[${session.account}, ${target_account}]`)
                );
            }
            // Check if current account liked target account
            else if (likers.includes(target_account)) {

                // Create match and get match id
                await this.db.execute(
                    this.db.insert('users_matchs', { connected: true, accounts: [session.account, target_account] })
                );

                console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Match between '${session.account}' and '${target_account}'`);
            }
        } else {
            throw { client: `Account '${target_account}' already liked`, status: 403 };
        }

        cb(null);
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Liked account '${target_account}'`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Like error: ${err.client || err}`);
    }
}

module.exports = handleClientLike;