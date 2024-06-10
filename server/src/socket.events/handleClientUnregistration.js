// Handler function for client unregistration event
async function handleClientUnregistration(socket, cb) {
    
    try {
        // Extract data
        const session = await this.getSession(socket.handshake.sessionID);
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
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Unregistration for account '${account_id}'`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Unregistration error: ${err.client || err}`);
    }
}

module.exports = handleClientUnregistration;
