require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./database/config/db');
const logger = require('./middlewares/logger');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Initialize and Connect with database
        await connectDB();

        // Start Express server
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
