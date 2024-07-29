const Server = require('./server');
const ClientSimulator = require('./client.simulator');
const dotenv = require('dotenv');
dotenv.config();
if (process.env.NODE_ENV !== 'development') { // Disable console.log in production mode (NODE_ENV=production)
    console.log = function () { };
    console.error = function () { };
}
const server = new Server();

////////////////////////////////////////
// Client simulator ////////////////////
////////////////////////////////////////
setTimeout(async () => {

    // Client simulator
    const clientCount = 3;
    if (!clientCount) {
        return console.error('ClientSimulator - Invalid client count');
    }
    let score = 0;
    const clientSimulators = Array.from({ length: clientCount }, () => new ClientSimulator());
    const clientIDs = Array.from({ length: clientCount }, (_, i) => i + 1);
    const process = async (processName, clientSimulators, data = null) => {
        await Promise.all(clientSimulators.map(async clientSimulator => {
            await clientSimulator['simulate' + processName](data);
            score++;
        }));

    }
    const processMultiple = async (processName, clientSimulators, dataList) => {
        await Promise.all(dataList.map(async data => {
            await Promise.all(clientSimulators.map(async clientSimulator => {
                await clientSimulator['simulate' + processName](data);
                score++;
            }));
        }));
    }

    // Display the client simulator
    console.log('\r\x1b[K');
    console.log(`ClientSimulator - ${clientCount} clients for testing`);

    // Disable console.log
    const originalConsoleLog = console.log;
    console.log = function () { };

    // Connection simulation
    console.info(`ClientSimulator - Connection simulation`);
    await process('Connection', clientSimulators);
    // Registration simulation
    console.info(`ClientSimulator - Registration simulation`);
    await process('Registration', clientSimulators);
    // Login simulation
    console.info(`ClientSimulator - Login simulation`);
    await process('Login', clientSimulators);
    // Geolocation simulation
    console.info(`ClientSimulator - Geolocation simulation`);
    await process('Geolocation', clientSimulators, { latitude: 48.8566, longitude: 2.3522 });
    // Edit simulation
    console.info(`ClientSimulator - Edit simulation`);
    await process('Edit', clientSimulators);

    console.log = originalConsoleLog;
    return ;
    
    // Browsing simulation
    console.info(`ClientSimulator - Browsing simulation`);
    await process('Browsing', clientSimulators, { browsing_start: 0, browsing_stop: 10 });
    // Research simulation
    console.info(`ClientSimulator - Research simulation`);
    await process('Research', clientSimulators, { age_min: 18, age_max: 100, dist_min: 0, dist_max: 1000, fame_min: 0, fame_max: 100, tags: [], browsing_start: 0, browsing_stop: 10 });
    // View simulation
    console.info(`ClientSimulator - View simulation`);
    await processMultiple('View', clientSimulators, clientIDs);
    // Viewers simulation
    console.info(`ClientSimulator - Viewers simulation`);
    await process('Viewers', clientSimulators);
    // Like simulation
    console.info(`ClientSimulator - Like simulation`);
    await Promise.all(clientSimulators.map(async (clientSimulator, i) => {
        const FilteredClientIDs = clientIDs.filter((clientID) => clientID !== clientSimulator.data.account);
        await processMultiple('Like', [clientSimulator], FilteredClientIDs);
    }));
    // Report simulation
    console.info(`ClientSimulator - Report simulation`);
    await Promise.all(clientSimulators.map(async (clientSimulator, i) => {
        const FilteredClientIDs = clientIDs.filter((clientID) => clientID !== clientSimulator.data.account);
        await processMultiple('Report', [clientSimulator], FilteredClientIDs);
    }));
    // Likers simulation
    console.info(`ClientSimulator - Likers simulation`);
    await process('Likers', clientSimulators);
    // Match simulation
    console.info(`ClientSimulator - Matchs simulation`);
    await process('Matchs', clientSimulators);
    // Chat simulation
    console.info(`ClientSimulator - Chat simulation`);
    await Promise.all(clientSimulators.map(async (clientSimulator, i) => {
        const FilteredClientIDs = clientIDs.filter((clientID) => clientID !== clientSimulator.data.account);
        for (let i = 0; i < 5; i++) {
            await processMultiple('Chat', [clientSimulator], FilteredClientIDs);
        }
    }));
    // Block simulation
    console.info(`ClientSimulator - Block simulation`);
    await Promise.all(clientSimulators.map(async (clientSimulator, i) => {
        const FilteredClientIDs = clientIDs.filter((clientID) => clientID !== clientSimulator.data.account);
        await processMultiple('Block', [clientSimulator], FilteredClientIDs);
    }));
    // Unblock simulation
    console.info(`ClientSimulator - Unblock simulation`);
    await Promise.all(clientSimulators.map(async (clientSimulator, i) => {
        const FilteredClientIDs = clientIDs.filter((clientID) => clientID !== clientSimulator.data.account);
        await processMultiple('Unblock', [clientSimulator], FilteredClientIDs);
    }));
    // Unlike simulation
    console.info(`ClientSimulator - Unlike simulation`);
    await Promise.all(clientSimulators.map(async (clientSimulator, i) => {
        const FilteredClientIDs = clientIDs.filter((clientID) => clientID !== clientSimulator.data.account);
        await processMultiple('Unlike', [clientSimulator], FilteredClientIDs);
    }));
    // Unregistration simulation
    console.info(`ClientSimulator - Unregistration simulation`);
    await process('Unregistration', [clientSimulators[0]]);
    // Logout simulation
    console.info(`ClientSimulator - Logout simulation`);
    await process('Logout', clientSimulators.slice(1));
    // Password reset simulation
    console.info(`ClientSimulator - Password reset simulation`);
    await process('PasswordReset', clientSimulators.slice(1));

    // Enable console.log
    console.log = originalConsoleLog;

    // Display the results
    console.log(`ClientSimulator - \x1b[32m${score} actions passed\x1b[0m`);

}, 2000);
