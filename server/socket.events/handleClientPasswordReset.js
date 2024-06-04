// Handler function for client password reset event
async function handleClientPasswordReset(socket, data, cb) {
    const session_token = socket.handshake.auth.token;
    try {
        // Extract data
        const session = this.session_store[session_token];
        if (session.account) {
            throw { client: 'Cannot reset password while logged in', status: 403 };
        }
        const { email } = data;
        const account_data = (await this.db.execute(
            this.db.select('users_private', 'id', `email = '${email}'`)
        ))[0];
        if (!account_data) {
            throw { client: `Email '${email}' not found`, status: 404 };
        }

        // Update the password in the database
        const new_password = this.generateSecurePassword(20);
        await this.db.execute(
            this.db.update('users_private', { password: new_password }, `email = '${email}'`)
        );

        // Send the new password by email
        await this.email.post({
            from: 'email@server.com',
            to: email,
            subject: 'New password',
            html: `Your new password is: ${new_password}`
        });

        console.log(`${session_token}:${socket.id} - New password sent by email to '${email}'`);
        cb(null);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`${session_token}:${socket.id} - Password reset error: ${err.client || err}`);
    }
}

module.exports = handleClientPasswordReset;
