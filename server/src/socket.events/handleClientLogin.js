const bcrypt = require('bcrypt');
const validator = require('validator');

// Handler function for client login event
async function handleClientLogin(socket, data, cb) {
    const session_token = socket.handshake.auth.token;
    try {
        // Extract data
        const session = this.session_store[session_token];
        if (session.account) {
            throw { client: 'Already logged in', status: 403 };
        }
        const { email, password } = data;
        if (!email || typeof email !== 'string' || !validator.isEmail(email)) {
            throw { client: 'Invalid email', status: 400 };
        }
        if (!password || typeof password !== 'string' || !validator.isLength(password, { min: 8, max: 20 })) {
            throw { client: 'Invalid password', status: 400 };
        }
        const account_data = (await this.db.execute(
            this.db.select('users_private', ['id', 'email', 'password'], `email = '${email}'`)
        ))[0];
        if (!account_data) {
            throw { client: `Email '${email}' not found`, status: 404 };
        }

        // Update the session with the account id
        const is_password_valid = await bcrypt.compare(password, account_data.password);
        if (!is_password_valid) {
            throw { client: 'Invalid password', status: 401 };
        }
        session.account = account_data.id;

        // Request geolocation
        socket.emit('server:geolocation');

        cb(null);
        console.log(`${session_token}:${socket.id} - Logged in to account '${account_data.id}'`);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`${session_token}:${socket.id} - Login error: ${err.client || err}`);
    }
}

module.exports = handleClientLogin;
