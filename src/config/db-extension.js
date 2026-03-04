const createExtensionsIfNotExist = async (sequelize) => {
  try {
    await sequelize.query("CREATE EXTENSION IF NOT EXISTS postgis;");
    console.log("Extensions ensured to exist.");
  } catch (error) {
    console.error("Error creating extensions:", error.message);
    throw error;
  }
};

module.exports = { createExtensionsIfNotExist };
