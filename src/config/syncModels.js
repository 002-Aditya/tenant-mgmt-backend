/**
 * Centralized file for fine-grained model synchronization.
 * Add any new models to the `modelsToSync` array to have them synchronized during database connection.
 */
const syncAllModels = async () => {
  const modelsToSync = [
    require("../models/auth/UserMaster"),
    require("../models/notification/OtpMaster"),
  ];

  const shouldAlter = process.env.SYNC_ALTER === "true";

  for (const model of modelsToSync) {
    await model.sync({ alter: shouldAlter });

    console.log(
      `Model "${model.name}" synchronized in schema "${model.options.schema || "public"}" ` +
        `(Alter: ${shouldAlter}).`,
    );
  }

  console.log("Database synchronization complete.");
};

module.exports = syncAllModels;
