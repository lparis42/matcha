// Handler function for client logout event
async function handleClientLogout(socket, cb) {
    // Retrieve the session token from the socket handshake
    
    try {
        // Extract data
        const session = await this.getSession(socket.handshake.sessionID);
        if (!session.account) {
            throw { client: 'Cannot logout while not logged in', status: 401 };
        }

        // Unregister the account from the session
        await this.setSession(socket.handshake.sessionID, { account: 0 });

        cb(null);
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Logout from account '${session.account}'`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Logout error: ${err.client || err}`);
    }
}

module.exports = handleClientLogout;
