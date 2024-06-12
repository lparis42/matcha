// Function to check if a client is online
async function handleClientOnline(socket, data, cb) {
    try {
        // Extract data
        const session = await this.getSession(socket.handshake.sessionID);
        if (!session.account) {
            throw { client: 'Cannot check online while not logged in', status: 401 };
        }
        const { target_account } = data;
        if (!target_account || typeof target_account !== 'number' || target_account < 1) {
            throw { client: 'Invalid target account', status: 400 };
        }
        const target_session = this.store.filter(item => item.account === target_account)[0]?.account === target_account || 0;

        cb(null, target_session);
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Client online check for account '${target_account}'`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Online check error: ${err.client || err}`);
    }
}

module.exports = handleClientOnline;