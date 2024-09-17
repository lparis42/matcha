// Méthode pour obtenir l'historique de tous les chats

async function handleClientChatHistories(socket, cb) {
    try {
        // Extract data
        const session_account = await this.getSessionAccount(socket.handshake.sessionID);
        if (!session_account) {
            throw { client: 'Cannot get chat histories while not logged in', status: 401 };
        }
        
        // Find all matches of the session account
        const matches = await this.db.execute(
            this.db.select('users_match', [`(array_remove(accounts, ${session_account}))[1] AS account`, 'messages'], `accounts @> ARRAY[${session_account}]`)
        );
        
        if (!matches.length) {
            throw { client: 'No matches found', status: 404 };
        }
        
        cb(null, matches);
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - All chat histories sent`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Chat histories error: ${err.client || err}`);
    }
}

module.exports = handleClientChatHistories;
