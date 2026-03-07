const logger = require('../../middlewares/logger');

const createExtensionsIfNotExist = async (sequelize) => {
  try {
    await sequelize.query("CREATE EXTENSION IF NOT EXISTS postgis;");
    logger.info("Extensions ensured to exist.");
  } catch (error) {
    logger.error("Error creating extensions:", error.message);
    throw error;
  }
};

module.exports = { createExtensionsIfNotExist };
