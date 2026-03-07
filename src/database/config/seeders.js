const DbCrudService = require("../../services/db-crud");
const logger = require('../../middlewares/logger');

/**
 * Generic function to seed initial bulk data if the model's table is entirely empty.
 * @param {Object} model - Sequelize Model class
 * @param {Array} data - Array of objects to bulk insert
 */
const seedInitialData = async (model, data) => {
  try {
    const count = await model.count();
    if (count === 0) {
      const response = await DbCrudService.bulkCreate(model, data);

      if (response.success) {
        logger.info(`Successfully seeded initial data for model "${model.name}".`);
      } else {
        logger.error(`Failed to seed data for model "${model.name}":`, response.error);
      }
    } else {
      logger.info(`Model "${model.name}" already contains data, skipping seed.`,);
    }
  } catch (error) {
    logger.error(`Error executing seed check for model "${model.name}":`, error.message,);
  }
};

module.exports = { seedInitialData };
