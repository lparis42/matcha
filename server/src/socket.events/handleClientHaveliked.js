// Method to request the likers of a user
async function handleClientHaveliked(socket, data, cb) {
    
    try {
        // Extract data
        const session_account = await this.getSessionAccount(socket.handshake.sessionID);
        if (!session_account) {
            throw { client: 'Cannot request likers while not logged in', status: 401 };
        }

        const { target_account } = data;
        if (!target_account) {
            throw { client: 'No target account specified', status: 400 };
        }
        if (typeof target_account !== 'number') {
            throw { client: 'Invalid target account', status: 400 };
        }

        const likers = (await this.db.execute(
            this.db.select('users_private', ['likers'], `id = '${session_account}'`)
        ))[0].likers;

        const liker = likers.includes(target_account);

        cb(null, liker);
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Request likers for account '${session_account}'`);  
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Request likers error: ${err.client || err}`);
    }
}

module.exports = handleClientHaveliked;
