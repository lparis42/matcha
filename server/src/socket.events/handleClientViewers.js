// Method to request the likers of a user
async function handleClientViewers(socket, cb) {
    
    try {
        // Extract data
        const session = await this.getSession(socket.handshake.sessionID);
        if (!session.account) {
            throw { client: 'Cannot request viewers while not logged in', status: 401 };
        }
        const viewers = (await this.db.execute(
            this.db.select('users_private', ['viewers'], `id = '${session.account}'`)
        ))[0].viewers;
        
        cb(null, viewers);
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Request viewers for account '${session.account}'`);  
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Request viewers error: ${err.client || err}`);
    }
}

module.exports = handleClientViewers;
