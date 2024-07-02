// Method to block a client
async function handleClientBlock(socket, data, cb) {
    try {
        // Check if the user is logged in
        const session_account = await this.getSessionAccount(socket.handshake.sessionID);
        if (!session_account) {
            throw { client: 'Cannot block without being logged in', status: 401 };
        }
        const { account_id } = data;
        // Validate the data
        if (!account_id || typeof account_id !== 'number') {
            throw { client: 'Invalid data', status: 400 };
        }
        // Check if the account exists
        const blocked_account = (await this.db.execute(
            this.db.select('users_public', ['id'], `id = ${account_id}`)
        ))[0];
        if (!blocked_account) {
            throw { client: 'Account not found', status: 404 };
        }
        // Check if the account is already blocked
        const blocked = (await this.db.execute(
            this.db.select('users_private', ['blocked_accounts'], `id = ${session_account}`)
        ))[0].blocked_accounts.includes(account_id);
        if (blocked) {
            throw { client: 'Account already blocked', status: 409 };
        }
        // Update the blocked accounts list of the user
        await this.db.execute(
            this.db.update('users_private', { blocked_accounts: account_id }, `id = ${session_account}`, 'ARRAY_APPEND')
        );
        
        cb(null, { message: 'Account blocked' });
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Blocked account ${account_id}`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Account blocking error: ${err.client || err}`);
    }
}