/**
 * Generic function to seed initial bulk data if the model's table is entirely empty.
 * @param {Object} model - Sequelize Model class
 * @param {Array} data - Array of objects to bulk insert
 */
const seedInitialData = async (model, data) => {
  try {
    const count = await model.count();
    if (count === 0) {
      await model.bulkCreate(data);
      console.log(
        `Successfully seeded initial data for model "${model.name}".`,
      );
    } else {
      console.log(
        `Model "${model.name}" already contains data, skipping seed.`,
      );
    }
  } catch (error) {
    console.error(
      `Error seeding data for model "${model.name}":`,
      error.message,
    );
  }
};

module.exports = { seedInitialData };
