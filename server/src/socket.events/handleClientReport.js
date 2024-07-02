// Method to report a client
async function handleClientReport(socket, data, cb) {
    try {
        // Check if logged in
        const session_account = await this.getSessionAccount(socket.handshake.sessionID);
        if (!session_account) {
            throw { client: 'Cannot report while not logged in', status: 401 };
        }
        const { account_id } = data;
        // Check data
        if (!account_id || typeof account_id !== 'number') {
            throw { client: 'Invalid data', status: 400 };
        }
        // Check if the account exists
        const reported_account = (await this.db.execute(
            this.db.select('users_public', ['id'], `id = ${account_id}`)
        ))[0];
        if (!reported_account) {
            throw { client: 'Account not found', status: 404 };
        }
        // Check if already reported
        const reported = (await this.db.execute(
            this.db.select('users_report', ['id'], `reporter = ${session_account} AND reported = ${account_id}`)
        ))[0];
        if (reported) {
            throw { client: 'Account already reported', status: 409 };
        }
        // Report the account
        await this.db.execute(
            this.db.insert('users_report', { reporter: session_account, reported: account_id })
        );
        cb(null, { message: 'Account reported' });
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Report account ${account_id}`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Report account error: ${err.client || err}`);
    }
}

module.exports = handleClientReport;