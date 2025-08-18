const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { initializeSocket } = require('./socket');
const { setIo } = require('./services/gameService');
const { initializeDatabase } = require('./models');
const walletRoutes = require('./routes/walletRoutes');
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"]
  }
});

// Middleware
app.use(cors({
    origin: "*", // Accept any origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"]

}));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/game', gameRoutes);
app.use('/auth', userRoutes);
app.use('/api/wallet', walletRoutes);

// Initialize socket.io
initializeSocket(io);
setIo(io);

// Start server with database initialization
const startServer = async () => {
    try {
        // Initialize database first
        await initializeDatabase();
        console.log('Database initialized successfully');

        const PORT = process.env.PORT || 3001;
        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();


module.exports = { app, httpServer, io };