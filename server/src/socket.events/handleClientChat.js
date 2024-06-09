const validator = require('validator');

// Method to send a message to a chat
async function handleClientChat(socket, data, cb) {
    const session_token = socket.handshake.auth.token;
    try {
        // Extract data
        const session = this.session_store[session_token];
        if (!session.account) {
            throw { client: 'Cannot send message while not logged in', status: 401 };
        }
        const { target_account, message } = data;
        if (!message || typeof message !== 'string' || !validator.isLength(message, { min: 1, max: 255 } || !validator.isAlphanumeric(message))) {
            throw { client: 'Invalid message', status: 400 };
        }
        if (typeof target_account !== 'number' || target_account < 1) {
            throw { client: 'Invalid target account', status: 400 };
        }
        const account_data = (await this.db.execute(
            this.db.select('users_public', ['username', 'pictures'], `id = '${session.account}'`)
        ))[0];
        if (!account_data.pictures[0]) {
            throw { client: 'Cannot send message without at least one picture', status: 403 };
        }
        const match = (await this.db.execute(
            this.db.select('users_matchs', ['id', 'connected', 'accounts', 'messages'], `accounts @> ARRAY[${session.account}, ${target_account}]`)
        ))[0];
        if (!match) {
            throw { client: 'Match not found', status: 404 };
        }
        if (!match.connected) {
            throw { client: 'Match not connected', status: 403 };
        }

        // Update the chat with the new message
        const messages = [...match.messages, `${account_data.username}:${message}`];
        await this.db.execute(
            this.db.update('users_matchs', { messages: messages }, `id = '${match.id}'`)
        );

        cb(null);
        console.log(`${session_token}:${socket.id} - Chat message sent to match ${match.id}`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`${session_token}:${socket.id} - Chat error: ${err.client || err}`);
    }
}

module.exports = handleClientChat;
