const clientIo = require('socket.io-client');
const fs = require('fs');
const path = require('path');
const constants = require('./constants');

class ClientSimulator {
    constructor() {
        // Connexion au serveur Socket.IO
        this.clientSocket = clientIo(`https://localhost:443`, {
            autoConnect: false,
            rejectUnauthorized: false,
            auth: { testing: true },
        });

        this.clientData = {
            username: this.randomData('username'),
            password: this.randomData('password'),
            email: this.randomData('email'),
            first_name: this.randomData('first_name'),
            last_name: this.randomData('last_name'),
            gender: this.randomData('gender'),
            sexual_orientation: this.randomData('sexual_orientation'),
            biography: this.randomData('biography'),
            interests: this.randomData('interests'),
            geolocation: this.randomData('geolocation'),
        };
    }

    async simulateConnection() {
        return new Promise((resolve, reject) => {
            this.clientSocket.on('connect', () => {
                this.clientSocket.io.opts.autoConnect = true;
                resolve(1);
                console.log('ClientSimulator: Connected');
            });
            this.clientSocket.on('connect_error', () => {
                resolve(0);
                console.error('ClientSimulator: Connection error');
            });
            this.clientSocket.connect();
        });
    }

    async simulateRegistration() {
        const data = {
            password: this.clientData.password,
            email: this.clientData.email,
            username: this.clientData.username,
            first_name: this.clientData.first_name,
            last_name: this.clientData.last_name,

        };
        return this.emit('client:registration', data);
    }

    async simulateLogin() {
        const data = {
            email: this.clientData.email,
            password: this.clientData.password,
        };
        return this.emit('client:login', data);
    }

    async simulateLogout() {
        return this.emit('client:logout', null);
    }

    async simulatePasswordReset() {
        const data = {
            email: this.clientData.email,
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
        const filePath = path.join(path.resolve('..'), 'image.png');
        const file_data = await fs.promises.readFile(filePath);
        const base64Image = file_data.toString('base64');
        const data = {
            gender: this.clientData.gender,
            sexual_orientation: this.clientData.sexual_orientation,
            biography: this.clientData.biography,
            interests: this.clientData.interests,
            pictures: [base64Image, null, null, null, null],
        };
        return this.emit('client:edit', data);
    }

    async simulateBrowsing() {
        return this.emit('client:browsing', null);
    }

    async simulateGeolocation(latitude, longitude) {
        return this.emit('client:geolocation', { latitude: latitude, longitude: longitude });
    }

    async simulateLikers() {
        return this.emit('client:likers', null);
    }

    async simulateViewers() {
        return this.emit('client:viewers', null);
    }

    // ** Tools **

    emit(event, data) {
        return new Promise((resolve, reject) => {
            const callback = (err, message) => {
                if (err) {
                    //reject(0);
                    resolve(0);
                    //console.error(`ClientSimulator: Event ${event} failed`);
                } else {
                    resolve(1);
                    console.log(`ClientSimulator: Event ${event} successful`, message || '');
                }
            };

            if (data) {
                this.clientSocket.emit(event, data, callback);

            } else {
                this.clientSocket.emit(event, callback);
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
            // Public data : username, first_name, last_name, gender, sexual_orientation, biography, interests, geolocation
            case 'username':
                return generateRandomString(6, 20, alphanumeric);
            case 'first_name':
            case 'last_name':
                return generateRandomString(2, 35, alpha);
            case 'gender':
                return constants.database.users_public.genders[Math.floor(Math.random() * 2)];
            case 'sexual_orientation':
                return constants.database.users_public.sexual_orientations[Math.floor(Math.random() * 4)];
            case 'biography':
                return generateRandomString(0, 255, allPrintableAscii);
            case 'interests':
                return Array.from({ length: 5 }, () => Math.floor(Math.random() * constants.database.users_public.interests.length));
            case 'geolocation':
                return [Math.random() * 180 - 90, Math.random() * 360 - 180];
        }
    }
}

module.exports = ClientSimulator;