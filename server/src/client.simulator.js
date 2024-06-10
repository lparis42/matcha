const clientIo = require('socket.io-client');
const fs = require('fs');
const path = require('path');
const e = require('express');

class ClientSimulator {
    constructor() {
        console.log('ClientSimulator: Starting');
        // Connexion au serveur Socket.IO
        this.clientSocket = clientIo.connect(`https://localhost:${process.env.PORT}`, {
            secure: true,
            rejectUnauthorized: true,
            withCredentials: true,
            auth: { testing: true },
        });

        this.clientData = {
            username: this.randomData('username'),
            password: this.randomData('password'),
            email: this.randomData('email'),
            first_name: this.randomData('first_name'),
            last_name: this.randomData('last_name'),
        };
    }

    async simulateRegistration() {
        const data = {
            username: this.clientData.username,
            password: this.clientData.password,
            email: this.clientData.email,
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
        const filePath = path.join(__dirname, './image.png');
        const data = await fs.promises.readFile(filePath);
        const base64Image = data.toString('base64');
        return this.emit('client:edit', {
            pictures: [base64Image, null, null, null, null],
        });
    }

    async simulateGeolocation() {
        return this.emit('client:geolocation', null);
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
                    resolve(0);
                    console.error(`ClientSimulator: Event ${event} failed`);
                } else {
                    console.log(`ClientSimulator: Event ${event} successful`, message || '');
                    resolve(1);
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
            case 'username':
                return generateRandomString(6, 20, alphanumeric);
            case 'password':
                return generateRandomString(8, 20, alphanumeric);
            case 'email':
                return `${generateRandomString(6, 30, alphanumeric)}@client.com`;
            case 'first_name':
            case 'last_name':
                return generateRandomString(2, 35, alpha);
            case 'message':
                return generateRandomString(1, 255, allPrintableAscii);
            default:
                throw new Error('Invalid type specified');
        }
    }
}

module.exports = ClientSimulator;