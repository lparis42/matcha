const bcrypt = require('bcrypt');

async function handleClientPasswordResetConfirmation(socket, data, cb) {
    const session_token = socket.handshake.auth.token;
    try {
        // Extract data
        const session = this.session_store[session_token];
        if (session.account) {
            throw { client: 'Cannot reset password while logged in', status: 403 };
        }
        const { activation_key } = data;
        if (!activation_key || typeof activation_key !== 'string' || activation_key.length !== 20) {
            throw { client: 'Invalid password reset key', status: 400 };
        }
        const email = (await this.db.execute(
            this.db.select('users_private', ['email'], `password_reset_key = '${activation_key}'`)
        ))[0]?.email;
        if (!email) {
            throw { client: 'Invalid password reset key', status: 400 };
        }
        
        // Send the new password by email
        const new_password = this.generateSecurePassword(20);
        await this.email.post({
            from: 'email@server.com',
            to: email,
            subject: 'New password',
            html: `Here is your new password: ${new_password}`
        });

        // Update the password in the database
        const hash_password = await bcrypt.hash(new_password, 10);
        await this.db.execute(
            this.db.update('users_private', { password: hash_password, password_reset_key: null }, `email = '${email}'`)
        );

        cb(null);
        console.log(`${session_token}:${socket.id} - New password applied for '${email}'`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`${session_token}:${socket.id} - Password reset confirmation error: ${err.client || err}`);
    }
}

module.exports = handleClientPasswordResetConfirmation;