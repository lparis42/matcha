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
        const { message } = data;
        const match_id = parseInt(data.match_id);
        const match = (await this.db.execute(
            this.db.select('users_matchs', ['connected', 'accounts', 'messages'], `id = '${match_id}'`)
        ))[0];
        if (!match || !match.connected || !match.accounts.includes(session.account)) {
            throw { client: `Match ${match_id} not found`, status: 404 };
        }
        if (!message || !validator.isLength(message, { min: 1, max: 255 }) || !validator.isAlphanumeric(message)) {
            throw { client: 'Invalid message', status: 400 };
        }

        // Update the chat with the new message
        const messages = [...match.messages, `${session.account}:${message}`];
        await this.db.execute(
            this.db.update('users_matchs', { messages: messages }, `id = '${match_id}'`)
        );

        console.log(`${session_token}:${socket.id} - Chat message sent to match ${match_id}`);
        cb(null);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`${session_token}:${socket.id} - Chat error: ${err.client || err}`);
    }
}

module.exports = handleClientChat;
