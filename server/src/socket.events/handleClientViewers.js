// Method to request the likers of a user
async function handleClientViewers(socket, cb) {
    
    try {
        // Extract data
        const session_account = await this.getSessionAccount(socket.handshake.sessionID);
        if (!session_account) {
            throw { client: 'Cannot request viewers while not logged in', status: 401 };
        }
        const viewers = (await this.db.execute(
            this.db.select('users_private', ['viewers'], `id = '${session_account}'`)
        ))[0].viewers;

        // add username and profile picture
        for (let i = 0; i < viewers.length; i++) {
            const viewer_public_data = (await this.db.execute(
                this.db.select('users_public', ['username', 'profile_picture'], `id = '${viewers[i]}'`)
            ))[0];
            viewers[i] = { id: viewers[i], username: viewer_public_data.username, profile_picture: viewer_public_data.profile_picture };
        }
        
        cb(null, viewers);
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Request viewers for account '${session_account}'`);  
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Request viewers error: ${err.client || err}`);
    }
}

module.exports = handleClientViewers;
