// Handler function for client unregistration event
async function handleClientUnregistration(socket, cb) {
    const session_token = socket.handshake.auth.token;
    try {
        // Extract data
        const session = this.session_store[session_token];
        if (!session.account) {
            throw { client: 'Cannot unregister while not logged in', status: 401 };
        }
        const account_id = session.account;

        // Delete the account from the database
        await this.db.execute(
            this.db.delete('users_private', `id = '${account_id}'`) + this.db.delete('users_public', `id = '${account_id}'`)
        );

        // Unregister the account from the session
        session.account = null;

        cb(null);
        console.log(`${session_token}:${socket.id} - Unregistration for account '${account_id}'`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`${session_token}:${socket.id} - Unregistration error: ${err.client || err}`);
    }
}

module.exports = handleClientUnregistration;
