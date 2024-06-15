// Handler function for client unregistration event
async function handleClientUnregistration(socket, cb) {
    
    try {
        // Extract data
        const session_account = await this.getSessionAccount(socket.handshake.sessionID);
        if (!session_account) {
            throw { client: 'Cannot unregister while not logged in', status: 401 };
        }

        // Delete the account from the database
        await this.db.execute(
            this.db.delete('users_private', `id = '${session_account}'`) +
            this.db.delete('users_public', `id = '${session_account}'`) +
            this.db.delete('users_match', `accounts @> ARRAY[${session_account}]`)
        );

        // Log out the account
        await this.setSessionAccount(socket.handshake.sessionID, 0);

        // Leave all match rooms and notify the other clients of the disconnection 
        Object.keys(socket.rooms)?.forEach(room => {
            if (room !== socket.handshake.sessionID) {
                socket.leave(room);
                this.io.to(room).emit('serveur:unregistrated', { account: session_account });
            }
        });

        // Emit the logout event to all the sockets of the session
        this.io.to(socket.handshake.sessionID).emit('server:account', { account: 0 });

        cb(null);
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Unregistration for account '${session_account}'`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Unregistration error: ${err.client || err}`);
    }
}

module.exports = handleClientUnregistration;
