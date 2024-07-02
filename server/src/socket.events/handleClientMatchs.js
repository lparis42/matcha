// Method to return client matchs
async function handleClientMatchs(socket, cb) {
    
    try {
        // Extract data
        const session_account = await this.getSessionAccount(socket.handshake.sessionID);
        if (!session_account) {
            throw { client: 'Cannot request matchs while not logged in', status: 401 };
        }
        const matchs = (await this.db.execute(
            this.db.select('users_match', ['accounts'], `accounts @> ARRAY[${session_account}]`)
        ));

        // Emit to the client the matchs
        cb(null, matchs);
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Request matchs`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Request matchs: ${err.client || err}`);
    }
}

module.exports = handleClientMatchs;
