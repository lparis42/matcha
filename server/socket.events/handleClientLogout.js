// Handler function for client logout event
async function handleClientLogout(socket, cb) {
    // Retrieve the session token from the socket handshake
    const session_token = socket.handshake.auth.token;
    try {
        // Extract data
        const session = this.session_store[session_token];
        if (!session.account) {
            throw { client: 'Cannot logout while not logged in', status: 401 };
        }

        // Unregister the account from the session
        const account_id = session.account;
        session.account = null;   

        cb(null);
        console.log(`${session_token}:${socket.id} - Logout from account '${account_id}'`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`${session_token}:${socket.id} - Logout error: ${err.client || err}`);
    }
}

module.exports = handleClientLogout;
