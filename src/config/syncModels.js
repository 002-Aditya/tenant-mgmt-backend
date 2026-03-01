/**
 * Centralized file for fine-grained model synchronization.
 * Add any new models to the `modelsToSync` array to have them synchronized during database connection.
 */
const syncAllModels = async () => {
    const modelsToSync = [
        // require('../models/user.model'),
    ];

    for (const model of modelsToSync) {
        await model.sync({ alter: true });
        console.log(`Model "${model.name}" synchronized in schema "${model.options.schema || 'public'}".`);
    }

    console.log('Database synchronization complete.');
};

module.exports = syncAllModels;
