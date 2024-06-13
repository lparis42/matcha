// Function to check if a client is online
async function handleClientOnline(socket, data, cb) {
    try {
        // Extract data
        const session = await this.getSession(socket.handshake.sessionID);
        if (!session.account) {
            throw { client: 'Cannot check online while not logged in', status: 401 };
        }
        if (!Array.isArray(data.target_accounts)) {
            throw { client: 'Invalid target accounts', status: 400 };
        }
        const target_sessions = [];
        for (const target_account of data.target_accounts) {
            if (typeof target_account !== 'number' || target_account < 1) {
                throw { client: `Invalid target account: ${target_account}`, status: 400 };
            }
            const target_session = await this.getSessionByAccount(target_account).account;
            target_sessions.push(target_session);
        }

        cb(null, target_sessions);
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Client online check for accounts: ${data.target_accounts}`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Online check error: ${err.client || err}`);
    }
}

module.exports = handleClientOnline;