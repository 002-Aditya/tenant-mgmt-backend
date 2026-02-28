const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
const getSingleRoutes = require('./routes/getSingle');
const getAllRoutes = require('./routes/getAll');
const errorMiddleware = require('./middlewares/error');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Unauthenticated Routes
app.use('/api/auth', authRoutes);

// Authenticated separated routes
// Order matters: postRoutes has /:model/lov so it should go before getSingleRoutes (/model/:id)
app.use('/api', postRoutes);
app.use('/api', getAllRoutes);
app.use('/api', getSingleRoutes);

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
