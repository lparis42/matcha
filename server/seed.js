const ClientSimulator = require('./src/client.simulator');
const database = require('./src/database');
const dotenv = require('dotenv');
dotenv.config({path: '../.env'});

async function connectDB() {
    const options = {
        user: process.env.DATABASE_USER,
        host: process.env.DATABASE_HOST,
        database: process.env.DATABASE_NAME,
        password: process.env.DATABASE_PASSWORD,
        port: process.env.DATABASE_PORT,
    };
    const db = new database(...Object.values(options));
    await db.connect();
    return db;
}

async function famerate() {
    const db = await connectDB();
    // Fetch all users
    const users = await db.execute('SELECT id FROM users_public');
    // Update each user's fame with a random number between 0 and 100
    for (const user of users) {
        const randomFame = Math.floor(Math.random() * 101); // Random number between 0 and 100
        await db.execute(`UPDATE users_public SET fame_rating = ${randomFame} WHERE id = ${user.id}`);
    }
}

async function seedDatabase() {
    //// Client simulator
    const clientCount = 10;
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
    //console.info(`ClientSimulator - Geolocation simulation`);
    //await process('Geolocation', clientSimulators);
    // Edit simulation
    console.info(`ClientSimulator - Edit simulation`);
    await process('Edit', clientSimulators);

    console.info(`ClientSimulator - Logout simulation`);
    await process('Logout', clientSimulators);

    console.info(`Ready`);
    console.log = originalConsoleLog;
    return;
}

//seedDatabase().catch(err => {
//    console.error('Error seeding database:', err);
//    return;
//}).then(() => { process.exit(1); });

famerate().catch(err => {
    console.error('Error seeding database:', err);
    return;
}).then(() => { process.exit(1); });
