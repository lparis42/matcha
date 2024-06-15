// Method to request the likers of a user
async function handleClientLikers(socket, cb) {
    
    try {
        // Extract data
        const session_account = await this.getSessionAccount(socket.handshake.sessionID);
        if (!session_account) {
            throw { client: 'Cannot request likers while not logged in', status: 401 };
        }
        const likers = (await this.db.execute(
            this.db.select('users_private', ['likers'], `id = '${session_account}'`)
        ))[0].likers;
    
        cb(null, likers);
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Request likers for account '${session_account}'`);  
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Request likers error: ${err.client || err}`);
    }
}

module.exports = handleClientLikers;
