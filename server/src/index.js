const Server = require('./server');
const ClientSimulator = require('./client.simulator');

// Disable console.log and console.error in production
if (process.env.NODE_ENV !== 'development') {
    console.log = function () { };
    console.error = function () { };
}

// Start the server
const server = new Server();

// Start the client simulator
const clientSimulators = [new ClientSimulator(), new ClientSimulator()];

return;
setTimeout(async () => {
    let scores = [0, 0];

    // Registration simulation
    await clientSimulators[0].simulateRegistration() ? scores[0]++ : scores[1]++;

    // Login simulation
    await clientSimulators[0].simulateLogin() ? scores[0]++ : scores[1]++;

    // Logout simulation
    await clientSimulators[0].simulateLogout() ? scores[0]++ : scores[1]++;

    await clientSimulators[0].simulateLogin() // Re-login for the next tests
    await clientSimulators[1].simulateRegistration(); // Register a second account for the next tests
    await clientSimulators[1].simulateLogin(); // Login with the second account for the next tests

    // Edit simulation
    await clientSimulators[0].simulateEdit() ? scores[0]++ : scores[1]++;
    await clientSimulators[1].simulateEdit() ? scores[0]++ : scores[1]++;

    // View simulation
    await clientSimulators[0].simulateViewers() ? scores[0]++ : scores[1]++;

    // Like simulation
    await clientSimulators[0].simulateLike(2) ? scores[0]++ : scores[1]++;
    await clientSimulators[1].simulateLike(1) ? scores[0]++ : scores[1]++;

    // Chat simulation
    await clientSimulators[0].simulateChat(2) ? scores[0]++ : scores[1]++;
    await clientSimulators[1].simulateChat(1) ? scores[0]++ : scores[1]++;

    // Unlike simulation
    await clientSimulators[0].simulateUnlike(2) ? scores[0]++ : scores[1]++;
    await clientSimulators[1].simulateUnlike(1) ? scores[0]++ : scores[1]++;

    await clientSimulators[0].simulateLogout(); // Logout for the next tests

    // Password reset simulation
    await clientSimulators[0].simulatePasswordReset() ? scores[0]++ : scores[1]++;

    // Unregistration simulation
    await clientSimulators[1].simulateUnregistration() ? scores[0]++ : scores[1]++;

    console.log(`ClientSimulator: ${scores[0]} tests passed, ${scores[1]} tests failed`);
}, 500);