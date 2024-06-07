const constant = require('../constant');
const fs = require('fs')

// Handler function for client edit event
async function handleClientEdit(socket, data, cb) {
    const session_token = socket.handshake.auth.token;
    try {
        // Extract data
        const session = this.session_store[session_token];
        if (!session.account) {
            throw { client: 'Cannot edit profile while not logged in', status: 401 };
        }
        const { first_name, last_name, email, date_of_birth, gender, sexual_orientation, biography, interests, pictures, geolocation } = data;
        const editable_fields = ['first_name', 'last_name', 'email', 'date_of_birth', 'gender', 'sexual_orientation', 'biography', 'interests', 'pictures', 'geolocation'];
        const fields = Object.fromEntries(Object.entries(data).filter(([key]) => editable_fields.includes(key)));
        if (fields.length === 0) {
            throw { client: 'No valid fields to edit', status: 400 };
        }
        if (first_name && (typeof first_name !== 'string' || !validator.isLength(first_name, { min: 1, max: 35 }))) {
            throw { client: 'Invalid first name', status: 400 };
        }
        if (last_name && (typeof last_name !== 'string' || !validator.isLength(last_name, { min: 1, max: 35 }))) {
            throw { client: 'Invalid last name', status: 400 };
        }
        if (email && (typeof email !== 'string' || !validator.isEmail(email))) {
            throw { client: 'Invalid email', status: 400 };
        }
        if (date_of_birth && (typeof date_of_birth !== 'string' || !validator.isDate(date_of_birth))) {
            throw { client: 'Invalid date of birth', status: 400 };
        }
        if (gender && (typeof gender !== 'string' || !constant.genders.includes(gender))) {
            throw { client: 'Invalid gender', status: 400 };
        }
        if (sexual_orientation && (typeof sexual_orientation !== 'string' || !constant.sexual_orientations.includes(sexual_orientation))) {
            throw { client: 'Invalid sexual orientation', status: 400 };
        }
        if (biography && (typeof biography !== 'string' || !validator.isLength(biography, { min: 1, max: 255 }))) {
            throw { client: 'Invalid biography', status: 400 };
        }
        if (interests && (!Array.isArray(interests) || !interests.every(interest => constant.interests.includes(interest)))) {
            throw { client: 'Invalid interests', status: 400 };
        }
        if (pictures) {
            if (!Array.isArray(pictures) || pictures.length !== 5) {
                throw { client: 'Invalid pictures', status: 400 };
            }
            pictures.forEach((image) => {
                const type = fileType(image); // Check the MIME type of the image
                if (image && (!type || !type.mime.startsWith('image/'))) {
                    throw { client: 'Invalid pictures', status: 400 };
                }
            });
        }     
        const account_public_data = await this.db.execute(
            this.db.select('users_public', editable_fields.filter(field => field !== 'email'), `id = '${session.account}'`)
        )[0];
        const account_private_data = await this.db.execute(
            this.db.select('users_private', 'email', `id = '${session.account}'`)
        )[0];

        // Update 
        if (account_public_data) {
            if (pictures) {
                const filenames = 5 * [0];
                await Promise.all(pictures.map(async (image, index) => {
                    if (!image) {
                        return;
                    }
                    filenames[index] = `${Date.now()}_${index}.jpg`;
                    const imagePath = path.join(__dirname, 'images', filenames[index]);
                    await fs.promises.writeFile(imagePath, image, 'binary').catch(error => {
                        throw { client: 'Failed to write image', status: 500 };
                    });
                }));
                account_public_data.pictures = filenames;
            }

            account_public_data.first_name = first_name || account_public_data.first_name;
            account_public_data.last_name = last_name || account_public_data.last_name;
            account_public_data.date_of_birth = date_of_birth || account_public_data.date_of_birth;
            account_public_data.gender = gender || account_public_data.gender;
            account_public_data.sexual_orientation = sexual_orientation || account_public_data.sexual_orientation;
            account_public_data.biography = biography || account_public_data.biography;
            account_public_data.interests = interests || account_public_data.interests;
            account_public_data.geolocation = geolocation || account_public_data.geolocation;

            await this.db.execute(
                this.db.update('users_public', account_public_data, `id = '${session.account}'`)
            );
        }
        
        if (account_private_data) {
            account_private_data.email = email || account_private_data.email;

            await this.db.execute(
                this.db.update('users_private', account_private_data, `id = '${session.account}'`)
            );
        }


        console.log(`${session_token}:${socket.id} - Edit profile for account ${session.account}`);
        cb(null);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`${session_token}:${socket.id} - Edit profile error: ${err.client || err}`);
    }
}

module.exports = handleClientEdit;
