// Method to request the likers of a user
async function handleClientViewers(socket, cb) {
    const session_token = socket.handshake.auth.token;
    try {
        // Extract data
        const session = this.session_store[session_token];
        if (!session.account) {
            throw { client: 'Cannot request viewers while not logged in', status: 401 };
        }
        const viewers = (await this.db.execute(
            this.db.select('users_private', 'viewers', `id = '${session.account}'`)
        ))[0].viewers;
        
        cb(null, viewers);
        console.log(`${session_token}:${socket.id} - Request viewers for account '${session.account}'`);  
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`${session_token}:${socket.id} - Request viewers error: ${err.client || err}`);
    }
}

module.exports = handleClientViewers;
