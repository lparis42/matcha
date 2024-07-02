// Method to unblock a client
async function handleClientUnblock(socket, data, cb) {
    try {
        // Check if the user is logged in
        const session_account = await this.getSessionAccount(socket.handshake.sessionID);
        if (!session_account) {
            throw { client: 'Cannot unblock without being logged in', status: 401 };
        }
        const { target_account } = data;
        // Validate the data
        if (!target_account || typeof target_account !== 'number') {
            throw { client: 'Invalid data', status: 400 };
        }
        // Check if the account exists
        const blocked_account = (await this.db.execute(
            this.db.select('users_public', ['id'], `id = ${target_account}`)
        ))[0];
        if (!blocked_account) {
            throw { client: 'Account not found', status: 404 };
        }
        // Retrieve the user's blocked accounts list
        const user_private_data = await this.db.execute(
            this.db.select('users_private', ['blocked_accounts'], `id = ${session_account}`)
        );
        const blocked_accounts = user_private_data[0].blocked_accounts;
        // Check if the account is actually blocked
        if (!blocked_accounts.includes(target_account)) {
            throw { client: 'Account not blocked', status: 409 };
        }
        // Update the blocked accounts list of the user to remove the unblocked account
        await this.db.execute(
            this.db.update('users_private', { blocked_accounts: target_account }, `id = ${session_account}`, 'ARRAY_REMOVE')
        );
        
        cb(null, { message: 'Account unblocked' });
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Unblocked account ${target_account}`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Account unblocking error: ${err.client || err}`);
    }
}

module.exports = handleClientUnblock;