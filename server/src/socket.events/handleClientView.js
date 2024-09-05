const structure = require('../structure');

async function handleClientView(socket, data, cb) {

    try {
        // Extract data
        const session_account = await this.getSessionAccount(socket.handshake.sessionID);
        if (!session_account) {
            throw { client: 'Cannot view profile while not logged in', status: 401 };
        }
        const { target_account } = data;
        if (typeof target_account !== 'number' || target_account < 1) {
            throw { client: 'Invalid target account', status: 400 };
        }
        const target_public_data = (await this.db.execute(
            this.db.select('users_public', [...structure.database.users_public.column_names], `id = '${target_account}'`)
        ))[0];
        if (!target_public_data) {
            throw { client: `Account '${target_account}' not found`, status: 404 };
        }
        const target_viewers = (await this.db.execute(
            this.db.select('users_private', ['viewers'], `id = '${target_account}'`)
        ))[0].viewers;

        // Update target account viewers and fame rating, and current account view history
        if (target_viewers !== session_account) {

            // Update target account viewers and fame rating
            if (!target_viewers.includes(session_account)) {
                await this.db.execute(
                    this.db.update('users_public', { fame_rating: 1 }, `id = '${target_account}'`, 'ADD') +
                    this.db.update('users_private', { viewers: session_account }, `id = '${target_account}'`, 'ARRAY_APPEND')
                );

                // Check if the target account is online
                if ((await this.db.execute(
                    this.db.select('users_public', ['online'], `id = '${target_account}'`)
                ))[0].online) {
                    // Emit the notification to the target account for each socket
                    (await this.db.execute(
                        this.db.select('users_session', ['socket_ids'], `account = ${target_account}`)
                    ))[0].socket_ids.forEach(async socket_id => {
                        const retrievedSocket = this.io.sockets.sockets.get(socket_id);
                        await retrievedSocket.emit('server:notification', { type: "view", account_id: session_account });
                    });
                } else {
                    // Save the notification for the target account
                    await this.db.execute(
                        this.db.insert('users_notification', { account: target_account, data: JSON.stringify({ type: "view", account_id: session_account }) })
                    );
                }
            }

            // Update current account view history
            const view_history = (await this.db.execute(
                this.db.select('users_private', ['view_history'], `id = '${session_account}'`)
            ))[0].view_history;
            const updated_view_history = [...view_history, target_account];
            if (updated_view_history.length > 20) {
                updated_view_history.shift();
            }
            await this.db.execute(
                this.db.update('users_private', { view_history: updated_view_history }, `id = '${session_account}'`)
            );
        }

        cb(null, target_public_data);
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - view_profile '${target_account}'`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - view_profile_error: ${err.client || err}`);
    }
}

module.exports = handleClientView;
