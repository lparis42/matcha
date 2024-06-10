const constants = require('../constants');
const fs = require('fs')
const validator = require('validator');
const sharp = require('sharp');
const path = require('path');

// Handler function for client edit event
async function handleClientEdit(socket, data, cb) {

    try {
        // Extract data
        const session = await this.getSession(socket.handshake.sessionID);
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
        if (gender && (typeof gender !== 'string' || !constants.database.users_public.genders.includes(gender))) {
            throw { client: 'Invalid gender', status: 400 };
        }
        if (sexual_orientation && (typeof sexual_orientation !== 'string' || !constants.database.users_public.sexual_orientations.includes(sexual_orientation))) {
            throw { client: 'Invalid sexual orientation', status: 400 };
        }
        if (biography && (typeof biography !== 'string' || !validator.isLength(biography, { min: 1, max: 255 }))) {
            throw { client: 'Invalid biography', status: 400 };
        }
        if (interests && (!Array.isArray(interests) || !interests.every(interest => constants.interests.includes(interest)))) {
            throw { client: 'Invalid interests', status: 400 };
        }
        if (pictures) {
            if (!Array.isArray(pictures) || pictures.length !== 5) {
                throw { client: 'Invalid pictures A', status: 400 };
            }
            await Promise.all(pictures.map(async (base64Image) => {
                if (!base64Image) {
                    return;
                }
                try {
                    const imageBuffer = Buffer.from(base64Image, 'base64');
                    await sharp(imageBuffer).metadata();
                } catch (err) {
                    throw { client: err.message, status: 400 };
                }
            }));
        }
        const account_public_data = (await this.db.execute(
            this.db.select('users_public', editable_fields.filter(field => field !== 'email'), `id = '${session.account}'`)
        ))[0];
        const account_private_data = (await this.db.execute(
            this.db.select('users_private', ['email'], `id = '${session.account}'`)
        ))[0];

        // Update 
        if (account_public_data) {
            if (pictures) {
                const filenames = new Array(5).fill("");
                await Promise.all(pictures.map(async (image, index) => {
                    if (!image) {
                        return;
                    }
                    filenames[index] = `${Date.now()}_${index}.jpg`;
                    const imagePath = path.join(__dirname, 'images', filenames[index]);
                    // Create the directory if it does not exist
                    const dir = path.dirname(imagePath);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    const imageBuffer = Buffer.from(image, 'base64');
                    // Write the image to the file
                    fs.writeFileSync(imagePath, imageBuffer);
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


        console.log(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Edit profile for account ${session.account}`);
        cb(null);
    } catch (err) {
        cb({ message: err.client || 'Internal server error', status: err.status || 500 });
        console.error(`\x1b[35m${socket.handshake.sessionID}\x1b[0m:\x1b[34m${socket.id}\x1b[0m - Edit profile error: ${err.client || err}`);
    }
}

module.exports = handleClientEdit;
