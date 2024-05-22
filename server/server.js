const express = require('express'); // Is used to create an Express app
const http = require('http'); // Is used to create an HTTP server
const socketIo = require('socket.io'); // Is used to create a WebSocket server
const jwt = require('jsonwebtoken'); // Is used to sign and verify tokens
const bcrypt = require('bcrypt'); // Is used to hash passwords
const bodyParser = require('body-parser'); // Is used to parse JSON bodies

const app = express(); // Create an Express app
const server = http.createServer(app); // Create an HTTP server
const io = socketIo(server); // Attach Socket.io to the server

app.use(bodyParser.json()); // Parse JSON bodies

const users = []; // This should be stored in a database
const secretKey = 'yourSecretKey'; // Change this to a more secure key

// Add the following routes to the server.js file
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization']; // Get the Authorization header
    const token = authHeader && authHeader.split(' ')[1]; // Get the token from the header

    if (!token) {
        return res.sendStatus(401); // Return 401 if no token is found, this means the user is not authenticated
    }

    jwt.verify(token, secretKey, (err, user) => { // Verify the token
        if (err) {
            return res.sendStatus(403); // Return 403 if the token is invalid, this means the user is not authorized
        }
        req.user = user; // Set the user object in the request
        next(); // Call the next middleware
    });
};

// Add the following routes to the server.js file
app.post('/register', async (req, res) => { // Create a new user
    const { username, password } = req.body; // Get the username and password from the request body
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    users.push({ username, password: hashedPassword }); // Add the user to the users array
    res.status(201).json({ message: 'User registered successfully' }); // Return a success message
});

// Add the following routes to the server.js file
app.post('/login', async (req, res) => { // Login a user
    const { username, password } = req.body; // Get the username and password from the request body
    const user = users.find(u => u.username === username); // Find the user by username
    if (user && await bcrypt.compare(password, user.password)) { // Check if the user exists and the password is correct
        const token = jwt.sign({ userId: user.username }, secretKey, { expiresIn: '1h' }); // Sign a new token
        res.json({ token }); // Return the token
    } else {
        res.status(401).json({ message: 'Invalid credentials' }); // Return an error message
    }
});

// Add the following routes to the server.js file
app.get('/profile', authMiddleware, (req, res) => { // Get the user profile
    res.json({ message: `Hello, user ${req.user.userId}` }); // Return a message with the user ID
});

// Add the following routes to the server.js file
io.use((socket, next) => { // Middleware to authenticate the user
    const token = socket.handshake.auth.token; // Get the token from the handshake
    if (!token) {
        return next(new Error('Authentication error')); // Return an error if the token is missing
    }

    jwt.verify(token, secretKey, (err, decoded) => { // Verify the token
        if (err) {
            return next(new Error('Authentication error')); // Return an error if the token is invalid
        }
        socket.userId = decoded.userId; // Set the user ID in the socket object
        next(); // Call the next middleware
    });
});

// Add the following routes to the server.js file
io.on('connection', (socket) => { // Handle incoming connections
    console.log('User connected:', socket.userId); // Log the user ID

    socket.on('message', (msg) => { // Handle incoming messages
        io.emit('message', { userId: socket.userId, msg }); // Broadcast the message to all connected users
    });

    socket.on('disconnect', () => { // Handle disconnections
        console.log('User disconnected:', socket.userId); // Log the user ID
    });
});

// Add the following routes to the server.js file
server.listen(1337, () => { // Start the server
    console.log('Server running on port 1337'); // Log a message
});
