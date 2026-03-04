/**
 * Centralized file for fine-grained model synchronization.
 * Add any new models to the `modelsToSync` array to have them synchronized during database connection.
 */

/**
 * Generic function to seed initial bulk data if the model's table is entirely empty.
 * @param {Object} model - Sequelize Model class
 * @param {Array} data - Array of objects to bulk insert
 */
const { seedInitialData } = require("./seeders");

const syncAllModels = async () => {
  const modelsToSync = [
    require("../models/lov/Gender"),
    require("../models/auth/UserMaster"),
    require("../models/notification/OtpMaster"),
    require("../models/auth/DeviceDetails"),
    require("../models/auth/GeolocationDetails"),
  ];

  const shouldAlter = process.env.SYNC_ALTER === "true";

  for (const model of modelsToSync) {
    await model.sync({ alter: shouldAlter });

    console.log(
      `Model "${model.name}" synchronized in schema "${
        model.options.schema || "public"
      }" ` + `(Alter: ${shouldAlter}).`,
    );
  }

  // Define default definitions for Gender
  const Gender = require("../models/lov/Gender");
  const defaultGenders = require("../database/bulk-data/genders");

  // Seed models after synchronizing schema
  await seedInitialData(Gender, defaultGenders);

  console.log("Database synchronization complete.");
};

module.exports = syncAllModels;
