// Method to request the likers of a user
async function handleClientLikers(socket, cb) {
    const session_token = socket.handshake.auth.token;
    try {
        // Extract data
        const session = this.session_store[session_token];
        if (!session.account) {
            throw { client: 'Cannot request likers while not logged in', status: 401 };
        }
        const likers = (await this.db.execute(
            this.db.select('users_private', 'likers', `id = '${session.account}'`)
        ))[0].likers;
    
        cb(null, likers);
        console.log(`${session_token}:${socket.id} - Request likers for account '${session.account}'`);  
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`${session_token}:${socket.id} - Request likers error: ${err.client || err}`);
    }
}

module.exports = handleClientLikers;
