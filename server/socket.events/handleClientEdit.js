const constant = require('../constant');

// Handler function for client edit event
async function handleClientEdit(socket, data, cb) {
    const session_token = socket.handshake.auth.token;
    try {
        // Extract data
        const session = this.session_store[session_token]; 
        const account = session.account;
        if (!account) {
            throw { client: 'Cannot edit profile while not logged in', status: 401 };
        }
        const valid_fields = constant.database.users_public.column_names;
        const fields = Object.fromEntries(Object.entries(data).filter(([key]) => valid_fields.includes(key)));

        // Update user profile
        await this.db.execute(
            this.db.update('users_public', fields, `id = '${account}'`)
        );

        console.log(`${session_token}:${socket.id} - Edit profile for account ${account}`);
        cb(null);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`${session_token}:${socket.id} - Edit profile error: ${err.client || err}`);
    }
}

module.exports = handleClientEdit;
