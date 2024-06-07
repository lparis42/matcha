const constants = require('../constants');

async function handle_client_view_profile(socket, data, cb) {
    const session_token = socket.handshake.auth.token;
    try {
        // Extract data
        const session = this.session_store[session_token];
        if (!session.account) {
            throw { client: 'Cannot view profile while not logged in', status: 401 };
        }
        const { target_account } = data;
        if (typeof target_account !== 'number' || target_account < 1) {
            throw { client: 'Invalid target account', status: 400 };
        }
        const target_public_data = (await this.db.execute(
            this.db.select('users_public', [...constants.database.users_public.column_names], `id = '${target_account}'`)
        ))[0];
        if (!target_public_data) {
            throw { client: `Account '${target_account}' not found`, status: 404 };
        }
        const target_viewers = (await this.db.execute(
            this.db.select('users_private', ['viewers'], `id = '${target_account}'`)
        ))[0].viewers;

        // Update target account fame rating and viewers
        if (!target_viewers.includes(session.account)) {
            const update_fame_rating_query = this.db.update('users_public', { fame_rating: target_public_data.fame_rating + 1 }, `id = '${target_account}'`);
            const update_viewers_query = this.db.update('users_private', { viewers: [...target_viewers, session.account] }, `id = '${target_account}'`);
            await this.db.execute(update_fame_rating_query + update_viewers_query);
        }

        // Update current account view history
        const view_history = (await this.db.execute(
            this.db.select('users_private', ['view_history'], `id = '${session.account}'`)
        ))[0].view_history;
        const updated_view_history = [...view_history, target_account];
        if (updated_view_history.length > 20) {
            updated_view_history.shift();
        }
        await this.db.execute(
            this.db.update('users_private', { view_history: updated_view_history }, `id = '${session.account}'`)
        );

        cb(null, target_public_data);
        console.log(`${session_token}:${socket.id} - view_profile '${target_account}'`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`${session_token}:${socket.id} - view_profile_error: ${err.client || err}`);
    }
}

module.exports = handle_client_view_profile;
