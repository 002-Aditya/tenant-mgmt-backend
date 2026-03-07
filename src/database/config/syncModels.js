const { seedInitialData } = require("./seeders");
const logger = require('../../middlewares/logger');

/**
 * Centralized function for fine-grained model synchronization.
 * Add any new models to the `modelsToSync` array to have them synchronized during database connection.
 */
const syncAllModels = async () => {
  const modelsToSync = [
    require("../../models/lov/Gender"),
    require("../../models/auth/UserMaster"),
    require("../../models/notification/OtpMaster"),
    require("../../models/auth/DeviceDetails"),
    require("../../models/auth/GeolocationDetails"),
  ];

  const shouldAlter = process.env.SYNC_ALTER === true;

  for (const model of modelsToSync) {
    await model.sync({ alter: shouldAlter });

    logger.info(`Model "${model.name}" synchronized in schema "${model.options.schema || "public"}" ` + `(Alter: ${shouldAlter}).`,);
  }

  const Gender = require("../../models/lov/Gender");
  const defaultGenders = require("../bulk-data/genders");

  // Seed models after synchronizing schema
  await seedInitialData(Gender, defaultGenders);

  logger.info("Database synchronization complete.");
};

module.exports = syncAllModels;
