const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Root Endpoint
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the Tenant Management API' });
});

// Handle undefined routes
app.use((req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    next(error);
});

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
