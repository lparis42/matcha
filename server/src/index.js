const Server = require('./server');
const ClientSimulator = require('./client.simulator');

// Disable console.log and console.error in production
if (process.env.NODE_ENV !== 'development') {
    console.log = function () { };
    console.error = function () { };
}

// Start the server
const server = new Server();

return;
// Start the client simulator
setTimeout(async () => {
    const clientSimulators = [new ClientSimulator(), new ClientSimulator()];
    let scores = [0, 0];

    // Registration simulation
    await clientSimulators[0].simulateRegistration() ? scores[0]++ : scores[1]++;
    await clientSimulators[1].simulateRegistration() ? scores[0]++ : scores[1]++;

    // Login simulation
    await clientSimulators[0].simulateLogin() ? scores[0]++ : scores[1]++;
    await clientSimulators[1].simulateLogin() ? scores[0]++ : scores[1]++;

    // Edit simulation
    await clientSimulators[0].simulateEdit() ? scores[0]++ : scores[1]++;
    await clientSimulators[1].simulateEdit() ? scores[0]++ : scores[1]++;

    // View simulation
    await clientSimulators[0].simulateView(2) ? scores[0]++ : scores[1]++;
    await clientSimulators[1].simulateView(1) ? scores[0]++ : scores[1]++;

    // Like simulation
    await clientSimulators[0].simulateLike(2) ? scores[0]++ : scores[1]++;
    await clientSimulators[1].simulateLike(1) ? scores[0]++ : scores[1]++;

    // Chat simulation
    await clientSimulators[0].simulateChat(2) ? scores[0]++ : scores[1]++;
    await clientSimulators[1].simulateChat(1) ? scores[0]++ : scores[1]++;

    // Unlike simulation
    await clientSimulators[0].simulateUnlike(2) ? scores[0]++ : scores[1]++;
    await clientSimulators[1].simulateUnlike(1) ? scores[0]++ : scores[1]++;

    // Logout simulation
    await clientSimulators[0].simulateLogout() ? scores[0]++ : scores[1]++;

    // Password reset simulation
    //await clientSimulators[0].simulatePasswordReset() ? scores[0]++ : scores[1]++;

    // Unregistration simulation
    await clientSimulators[1].simulateUnregistration() ? scores[0]++ : scores[1]++;
    console.log('\r\x1b[K');
    console.log(`ClientSimulator: \x1b[32m${scores[0]} tests passed\x1b[0m, \x1b[31m${scores[1]} tests failed\x1b[0m`);

}, 1000);

