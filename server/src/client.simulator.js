const clientIo = require('socket.io-client');
const path = require('path');
const structure = require('./structure');
const sharp = require('sharp');

const GEO_DATA = [
    { latitude: 48.856614, longitude: 2.3522219 },
    { latitude: 48.8602941, longitude: 2.3345947 },
    { latitude: 48.8529682, longitude: 2.373047 },
    { latitude: 48.873782, longitude: 2.2890119 },
    { latitude: 48.853924, longitude: 2.349014 },
    { latitude: 48.865633, longitude: 2.312373 },
    { latitude: 48.841849, longitude: 2.376198 },
    { latitude: 48.853403, longitude: 2.285174 },
    { latitude: 48.880062, longitude: 2.330628 },
    { latitude: 48.871943, longitude: 2.321786 }
]

class ClientSimulator {
    constructor() {
        // Connexion au serveur Socket.IO
        this.socket = clientIo(`https://localhost:2000`, {
            autoConnect: false,
            rejectUnauthorized: false,
            auth: { simulator: true },
        });

        this.data = {
            username: this.randomData('username'),
            password: this.randomData('password'),
            email: this.randomData('email'),
            first_name: this.randomData('first_name'),
            last_name: this.randomData('last_name'),
            date_of_birth: this.randomData('date_of_birth'),
            gender: this.randomData('gender'),
            sexual_orientation: this.randomData('sexual_orientation'),
            biography: this.randomData('biography'),
            common_tags: this.randomData('common_tags'),
            geolocation: this.randomData('geolocation'),
            location: "17eme arrondissement, Paris",
            pictures: ['image.png', null, null, null, null],
            account: 0,
        };
    }

    async simulateConnection() {
        return new Promise((resolve, reject) => {
            this.socket.on('connect', () => {
                this.socket.io.opts.autoConnect = true;
                this.socket.on('server:account', (data) => {
                    this.data.account = data.account;
                });
                resolve();
                console.log('ClientSimulator: Connected');
            });
            this.socket.on('connect_error', () => {
                reject();
                console.error('ClientSimulator: Connection error');
            });
            this.socket.connect();
        });
    }

    async simulateRegistration() {
        const data = {
            password: this.data.password,
            email: this.data.email,
            username: this.data.username,
            first_name: this.data.first_name,
            last_name: this.data.last_name,
            pictures: this.data.pictures,
        };
        return this.emit('client:registration', data);
    }

    async simulateLogin() {
        const data = {
            email: this.data.email,
            password: this.data.password,
        };
        return this.emit('client:login', data);
    }

    async simulateLogout() {
        return this.emit('client:logout', null);
    }

    async simulatePasswordReset() {
        const data = {
            email: this.data.email,
        };
        return this.emit('client:password_reset', data);
    }

    async simulateUnregistration() {
        return this.emit('client:unregistration', null);
    }

    async simulateView(target_account) {
        const data = {
            target_account: target_account,
        };
        return this.emit('client:view', data);
    }

    async simulateLike(target_account) {
        const data = {
            target_account: target_account,
        };
        return this.emit('client:like', data);
    }

    async simulateUnlike(target_account) {
        const data = {
            target_account: target_account,
        };
        return this.emit('client:unlike', data);
    }

    async simulateChat(target_account) {
        const data = {
            target_account: target_account,
            message: this.randomData('message'),
        };
        return this.emit('client:chat', data);
    }

    async simulateEdit() {
        // Load the image file
        const filePath = path.join(path.resolve('..'), 'image.png');

        // Load the image and get its metadata
        const metadata = await sharp(filePath).metadata();

        // Calculate new dimensions as 50% of the original
        const targetHeight = metadata.height / 2;
        const targetWidth = metadata.width / 2;

        // Resize, convert to JPEG, and get the compressed image as a Buffer
        const compressedImageBuffer = await sharp(filePath)
           .resize({ height: targetHeight, width: targetWidth })
           .webp({ quality: 100 })
           .toBuffer();

        // Compress the image and convert it to base64
        const base64Image = compressedImageBuffer.toString('base64');
        const data = {
            gender: this.data.gender,
            sexual_orientation: this.data.sexual_orientation,
            date_of_birth: this.data.date_of_birth,
            biography: this.data.biography,
            common_tags: this.data.common_tags,
            pictures: [base64Image, null, null, null, null],
            geolocation: this.data.geolocation,
            location: this.data.location,
        };
        return this.emit('client:edit', data);
    }

    async simulateBrowsing(data) {
        return this.emit('client:browsing', data);
    }

    async simulateGeolocation() {
        return this.emit('client:geolocation', this.data.geolocation);
    }

    async simulateLikers() {
        return this.emit('client:likers', null);
    }

    async simulateViewers() {
        return this.emit('client:viewers', null);
    }

    async simulateMatchs() {
        return this.emit('client:matchs', null);
    }

    async simulateResearch(data) {
        return this.emit('client:research', data);
    }

    async simulateBlock(target_account) {
        const data = {
            target_account: target_account,
        };
        return this.emit('client:block', data);
    }

    async simulateUnblock(target_account) {
        const data = {
            target_account: target_account,
        };
        return this.emit('client:unblock', data);
    }

    async simulateReport(target_account) {
        const data = {
            target_account: target_account
        };
        return this.emit('client:report', data);
    }

    // ** Tools **

    emit(event, data) {
        return new Promise((resolve, reject) => {
            const callback = (err, message) => {
                if (err) {
                    reject();
                    console.error(`ClientSimulator: Event ${event} failed`);
                } else {
                    resolve();
                    console.log(`ClientSimulator: Event ${event} successful`, message || '');
                }
            };

            if (data) {
                this.socket.emit(event, data, callback);

            } else {
                this.socket.emit(event, callback);
            }
        });
    }

    randomData(type) {
        const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const allPrintableAscii = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

        const generateRandomString = (min, max, chars) => {
            let result = '';
            const length = Math.floor(Math.random() * (max - min + 1)) + min;
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };

        switch (type) {
            // Private data : email, password
            case 'password':
                return generateRandomString(8, 20, alphanumeric);
            case 'email':
                return `${generateRandomString(6, 39, alphanumeric)}@client.com`;
            // Private data : message
            case 'message':
                return generateRandomString(1, 255 - 20 /*username*/ - 1 /*':'*/, allPrintableAscii);
            // Public data : username, first_name, last_name, gender, sexual_orientation, biography, common_tags, geolocation
            case 'username':
                return generateRandomString(6, 20, alphanumeric);
            case 'first_name':
            case 'last_name':
                return generateRandomString(2, 35, alpha);
            case 'date_of_birth':
                const start = new Date(1990, 0, 1);
                const end = new Date(2005, 0, 1);
                const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
                return randomDate.toISOString().slice(0, 10);
            case 'gender':
                return structure.database.users_public.genders[Math.floor(Math.random() * 2)];
            case 'sexual_orientation':
                return structure.database.users_public.sexual_orientations[Math.floor(Math.random() * 4)];
            case 'biography':
                return generateRandomString(0, 255, allPrintableAscii);
            case 'common_tags':
                return Array.from({ length: 5 }, () => Math.floor(Math.random() * structure.database.users_public.common_tags.length));
            case 'geolocation':
                return GEO_DATA[Math.floor(Math.random() * 10)];
        }
    }
}

module.exports = ClientSimulator;
