const constants = require('../constants');

// Handler function for client registration confirmation event
async function handleClientRegistrationConfirmation(socket, data, cb) {
    try {
        // Extract data
        const { activation_key } = data;
        if (!activation_key || typeof activation_key !== 'string' || activation_key.length !== 20) {
            throw { client: 'Invalid activation key', status: 400 };
        }
        const preview_data = (await this.db.execute(
            this.db.select('users_preview', [...constants.database.users_preview.column_names, 'id'], `activation_key = '${activation_key}'`)
        ))[0];
        if (!preview_data) {
            throw { client: 'Invalid activation key', status: 404 };
        }

        // Extract private and public user fields
        const users_private_fields = Object.fromEntries(Object.entries(preview_data).filter(([key]) => constants.database.users_private.column_names.includes(key)));
        const users_public_fields = Object.fromEntries(Object.entries(preview_data).filter(([key]) => constants.database.users_public.column_names.includes(key)));

        // Insert the user data into the database and delete the preview data 
        await this.db.execute(
            this.db.insert('users_private', users_private_fields) +
            this.db.insert('users_public', users_public_fields) +
            this.db.delete('users_preview', `activation_key = '${activation_key}'`)
        );

        cb(null);
        console.log(`${socket.handshake.auth.token}:${socket.id} - Registration confirmed for preview account '${preview_data.id}'`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`${socket.handshake.auth.token}:${socket.id} - Registration confirmation error: ${err.client || err}`);
    }
}

module.exports = handleClientRegistrationConfirmation;
