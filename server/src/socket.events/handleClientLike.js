async function handleClientLike(socket, data, cb) {

    try {
        // Extract data
        const session_account = await this.getSessionAccount(socket.handshake.sessionID);
        if (!session_account) {
            throw { client: 'Cannot like while not logged in', status: 401 };
        }
        const { target_account } = data;
        if (typeof target_account !== 'number' || target_account < 1) {
            throw { client: 'Invalid target account', status: 400 };
        }
        if (session_account === target_account) {
            throw { client: 'Cannot like own account', status: 403 };
        }
        const target_likers = (await this.db.execute(
            this.db.select('users_private', ['likers'], `id = '${target_account}'`)
        ))[0]?.likers;
        if (!target_likers) {
            throw { client: `Account '${target_account}' not found`, status: 404 };
        }
        if ((await this.db.execute(
            this.db.select('users_public', ['pictures'], `id = '${session_account}'`)
        ))[0].pictures[0].length === 0) {
            throw { client: 'Cannot like without at least one picture', status: 403 };
        }

        // ** Check if target account is already liked
        if (!target_likers.includes(session_account)) {

            // Update target user's fame rating and likers
            await this.db.execute(
                this.db.update('users_public', { fame_rating: 10 }, `id = '${target_account}'`, 'ADD') +
                this.db.update('users_private', { likers: session_account }, `id = '${target_account}'`, 'ARRAY_APPEND')
            );

            // ** Check if both accounts liked each other
            if ((await this.db.execute(
                this.db.select('users_private', ['likers'], `id = '${session_account}'`)
            ))[0].likers.includes(target_account)) {

                // Create the match or update the existing one
                const accounts = session_account < target_account ? [session_account, target_account] : [target_account, session_account]; // Sort the accounts to avoid duplicates
                const match_id = (await this.db.execute(
                    this.db.upsert('users_match', { online: true, accounts: accounts }, 'accounts', 'RETURNING id')
                ))[0].id;
                const match = (await this.db.execute(
                    this.db.select('users_match', ['id', 'online', 'accounts', 'messages'], `id = ${match_id}`)
                ))[0];

                // Get the sockets of the target account to join the match room and notify the client of the match
                (await this.db.execute(
                    this.db.select('users_session', ['socket_ids'], `account = ${target_account}`)
                ))[0]?.socket_ids.forEach(socket_id => {
                    const retrievedSocket = this.io.sockets.sockets.get(socket_id);
                    retrievedSocket.join(match_id);
                    retrievedSocket.emit('server:match', { account_id: session_account });
                });

                // Join the match room
                socket.join(match_id);

                // Notify the client
                this.io.to(socket.handshake.sessionID).emit('server:match', { account_id: target_account });

                console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Match between '${session_account}' and '${target_account}'`);
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
