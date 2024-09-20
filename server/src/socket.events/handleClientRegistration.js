const structure = require('../structure');
const bcrypt = require('bcrypt');
const e = require('express');
const validator = require('validator');

// Handler function for client registration event
async function handleClientRegistration(socket, data, cb) {
    try {
        // Extract data
        const session_account = await this.getSessionAccount(socket.handshake.sessionID);
        if (session_account) {
            throw { client: 'Cannot register while logged in', status: 403 };
        }
        const { first_name, last_name, email, password, username } = data;
        if (!first_name || typeof first_name !== 'string' || !validator.isLength(first_name, { min: 2, max: 35 }) || !validator.isAlpha(first_name)) {
            throw { client: 'Invalid first name', status: 400 };
        }
        if (!last_name || typeof last_name !== 'string' || !validator.isLength(last_name, { min: 2, max: 35 }) || !validator.isAlpha(last_name)) {
            throw { client: 'Invalid last name', status: 400 };
        }
        if (!email || typeof email !== 'string' || !validator.isEmail(email)) {
            throw { client: 'Invalid email', status: 400 };
        }
        if (!password || typeof password !== 'string' || !validator.isLength(password, { min: 8, max: 20 }) || !validator.isAlphanumeric(password)) {
            throw { client: 'Invalid password', status: 400 };
        }
        if (!username || typeof username !== 'string' || !validator.isLength(username, { min: 4, max: 20 }) || !validator.isAlphanumeric(username)) {
            throw { client: 'Invalid username', status: 400 };
        }
        data = { first_name, last_name, email, password, username };

        // Insert the user data into the preview database
        const activation_key = this.generateSecurePassword(20);
        data.password = await bcrypt.hash(password, 10);
        const condition = `
            SELECT email FROM users_preview WHERE email = '${email}'
            UNION
            SELECT email FROM users_private WHERE email = '${email}'
        `;
        const result = await this.db.execute(
            this.db.insert_where_not_exists('users_preview', { ...data, activation_key: activation_key }, condition)
        );
        if (result.length === 0) {
            throw { client: `Email '${email}' already exists`, status: 409 };
        }

        // Send the activation link by email
        if (!email.endsWith('@client.com')) {
            const link = `https://localhost:${process.env.HTTPS_PORT_CLIENT}/confirm?activation_key=${activation_key}`;
            console.log('link:', link);
            await this.email.post({
            to: email,
            subject: 'Account registration',
            html: `Here is the link to confirm your registration: <a href="${link}">${link}</a>`
            });
        }

        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Confirmation email sent to '${email}'`);

        // Confirm registration for testing purposes
        if (email.endsWith('@client.com')) {
            await new Promise((resolve, reject) => {
                this.handleClientRegistrationConfirmation(socket, { activation_key }, (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
            });
        }

        cb(null);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Registration error: ${err.client || err}`);
    }
}

module.exports = handleClientRegistration;
