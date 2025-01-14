const bcrypt = require('bcrypt');
const validator = require('validator');

async function handleClientPasswordResetConfirmation(socket, data, cb) {
    
    try {
        // Extract data
        const session_account = await this.getSessionAccount(socket.handshake.sessionID);
        if (session_account) {
            throw { client: 'Cannot reset password while logged in', status: 403 };
        }
        const { activation_key, new_password } = data;
        console.log(activation_key)
        if (!activation_key || typeof activation_key !== 'string' || activation_key.length !== 20) {
            throw { client: 'Invalid password reset key', status: 400 };
        }
        if (!new_password || typeof new_password !== 'string' || !validator.isLength(new_password, { min: 8, max: 20 }) || !validator.isAlphanumeric(new_password)) {
            throw { client: 'Invalid password', status: 400 };
        }
        const email = (await this.db.execute(
            this.db.select('users_private', ['email'], `password_reset_key = '${activation_key}'`)
        ))[0]?.email;
        if (!email) {
            throw { client: 'Invalid password reset key', status: 400 };
        }

        // Update the password in the database
        const hash_password = await bcrypt.hash(new_password, 10);
        await this.db.execute(
            this.db.update('users_private', { password: hash_password, password_reset_key: null }, `email = '${email}'`)
        );

        cb(null);
        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - New password applied for '${email}'`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Password reset confirmation error: ${err.client || err}`);
    }
}

module.exports = handleClientPasswordResetConfirmation;
