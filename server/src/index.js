const Server = require('./server');
const ClientSimulator = require('./client.simulator');
const e = require('express');

// Disable console.log and console.error in production
if (process.env.NODE_ENV !== 'development') {
    console.log = function () { };
    console.error = function () { };
}

// Start the server
const server = new Server();

// For testing purposes
setTimeout(async () => {

    // Constants
    const clientCount = 5;
    let scores = [0, 0];
    const chunkSize = 5;
    const processInChunks = async (processName, target = 0) => {
        for (let i = 0; i < clientSimulators.length; i += chunkSize) {
            const chunk = clientSimulators.slice(i, i + chunkSize);
            const originalConsoleLog = console.log;
            console.log = function () { };
            await Promise.all(chunk.map(async clientSimulator => {
                const data = target ? Math.floor(Math.random() * clientSimulators.length) + 1 : null;
                (await clientSimulator['simulate' + processName](data)) ? scores[0]++ : scores[1]++;
            }));
            console.log = originalConsoleLog;
            console.log(`ClientSimulator - ${i + chunkSize} clients - ${processName}`);
        }
    }

    // Create the client simulators
    console.log(`ClientSimulator - ${clientCount} clients for testing`);
    const clientSimulators = Array.from({ length: clientCount }, () => new ClientSimulator());

    // Connection simulation
    await processInChunks('Connection');
    // Registration simulation
    await processInChunks('Registration');
    // Login simulation
    await processInChunks('Login');
    // Edit simulation
    await processInChunks('Edit');
    // Browsing simulation
    await processInChunks('Browsing');
    // View simulation
    await processInChunks('View', 1);
    // Viewers simulation
    await processInChunks('Viewers');
    // Like simulation
    for (let i = 0; i < clientCount; i++) await processInChunks('Like', 1);
    // Likers simulation
    await processInChunks('Likers');
    // Chat simulation
    for (let i = 0; i < clientCount; i++) await processInChunks('Chat', 1);
    // Unlike simulation
    for (let i = 0; i < clientCount; i++) await processInChunks('Unlike', 1);
    // Geolocation simulation
    await processInChunks('Geolocation');
    // Unregistration simulation
    await processInChunks('Unregistration');

    // Registration simulation
    await processInChunks('Registration');
    // Login simulation
    await processInChunks('Login');
    // Logout simulation
    await processInChunks('Logout');
    // Password reset simulation
    await processInChunks('PasswordReset');

    // Display the results
    console.log('\r\x1b[K');
    console.log(`ClientSimulator - \x1b[32m${scores[0]} actions passed\x1b[0m : \x1b[31m${scores[1]} actions failed\x1b[0m`);

}, 2000);