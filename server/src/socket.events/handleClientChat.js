const validator = require('validator');

// Method to send a message to a chat
async function handleClientChat(socket, data, cb) {

    try {
        // Extract data
        const session_account = await this.getSessionAccount(socket.handshake.sessionID);
        if (!session_account) {
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
            this.db.select('users_public', ['username', 'pictures'], `id = '${session_account}'`)
        ))[0];
        if (!account_data.pictures[0]) {
            throw { client: 'Cannot send message without at least one picture', status: 403 };
        }
        // Check if blocked by the target account
        const blocked = (await this.db.execute(
            this.db.select('users_private', ['blocked_accounts'], `id = ${target_account}`)
        ))[0].blocked_accounts.includes(session_account);
        if (blocked) {
            throw { client: 'Cannot send message to a account that blocked you', status: 403 };
        }
        const match = (await this.db.execute(
            this.db.select('users_match', ['id', 'online', 'accounts', 'messages'], `accounts @> ARRAY[${session_account}, ${target_account}]`)
        ))[0];
        if (!match) {
            throw { client: 'Match not found', status: 404 };
        }
        if (!match.online) {
            throw { client: 'Match not connected', status: 403 };
        }

        console.log('Chat message:', message, 'from', account_data.username, 'to', target_account);

        // Update the chat with the new message
        await this.db.execute(
            this.db.update('users_match', { messages: `${account_data.username}:${message}` }, `id = '${match.id}'`, 'ARRAY_APPEND')
        );

        // Check if the target account is online
        if ((await this.db.execute(
            this.db.select('users_public', ['online'], `id = '${target_account}'`)
        ))[0].online) {
            // Get the session ID of the target account
            const target_session_id = (await this.db.execute(
                this.db.select('users_session', ['sid'], `account = ${target_account}`)
            ))[0].sid;
            // Emit the notification to each socket of the target account
            this.io.to(target_session_id).emit('server:notification', { type: "chat", account_id: session_account, message: `${account_data.username}:${message}` });
            console.log(`Chat message sent to account ${target_session_id}`);
        } else {
            // Save the notification for the target account
            await this.db.execute(
                this.db.insert('users_notification', { account: target_account, data: JSON.stringify({ type: "chat", message: `${account_data.username}:${message}` }) })
            );
        }

        cb(null);
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Chat message sent to match ${match.id}`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Chat error: ${err.client || err}`);
    }
}

module.exports = handleClientChat;
