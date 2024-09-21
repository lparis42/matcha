const validator = require('validator');
const structure = require('../structure');

// Handler function for client password reset event
async function handleClientPasswordReset(socket, data, cb) {
    
    try {
        // Extract data
        const session_account = await this.getSessionAccount(socket.handshake.sessionID);
        
        if (session_account) {
            throw { client: 'Cannot reset password while logged in', status: 403 };
        }
        const { email } = data;
        if (!email || typeof email !== 'string' || !validator.isEmail(email)) {
            throw { client: 'Invalid email', status: 400 };
        }
        const account_data = (await this.db.execute(
            this.db.select('users_private', ['id'], `email = '${email}'`)
        ))[0];
        if (!account_data) {
            throw { client: `Email '${email}' not found`, status: 404 };
        }

        // Update the password in the database
        const activation_key = this.generateSecurePassword(20);

        // Update the password reset key in the database
        await this.db.execute(
            this.db.update('users_private', { password_reset_key: activation_key }, `email = '${email}'`)
        );

        // Send the new password by email
        const link = `https://localhost:${process.env.HTTPS_PORT}/confirm?activation_key=${activation_key}`;
        await this.email.post({
            from: 'email@server.com',
            to: email,
            subject: 'Password reset',
            html: `Here the link to confirm your new password: <a href="${link}">${link}</a>`
        });

        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - New password sent by email to '${email}'`);

        // Confirm the password reset for testing purposes
        // await new Promise((resolve, reject) => {
        //     this.handleClientPasswordResetConfirmation(socket, { activation_key: activation_key }, (err) => {
        //         if (err) {
        //             reject(err);
        //         }
        //         resolve();
        //     });
        // });     

        cb(null);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Password reset error: ${err.client || err}`);
    }
}

module.exports = handleClientPasswordReset;
