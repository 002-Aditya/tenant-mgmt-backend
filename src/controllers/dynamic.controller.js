const { sequelize } = require('../config/db');

// Helper function to resolve the Sequelize model from the URL parameter dynamically
const getModel = (modelName) => {
    // Try exact match first
    let Model = sequelize.models[modelName];
    if (Model) return Model;

    // Try capitalized match (e.g. 'users' -> 'Users', 'user' -> 'User')
    const capitalized = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    Model = sequelize.models[capitalized];
    if (Model) return Model;

    // Try looking through all models to do a case-insensitive search or singular/plural check
    const modelKeys = Object.keys(sequelize.models);
    for (const key of modelKeys) {
        if (key.toLowerCase() === modelName.toLowerCase() ||
            key.toLowerCase() === modelName.toLowerCase() + 's' ||
            key.toLowerCase() + 's' === modelName.toLowerCase()) {
            return sequelize.models[key];
        }
    }

    const error = new Error(`Model '${modelName}' not found or not registered in Sequelize`);
    error.statusCode = 404;
    throw error;
};

class DynamicController {
    // Fetch all records
    async getAll(req, res, next) {
        try {
            const Model = getModel(req.params.model);
            const records = await Model.findAll();
            res.status(200).json({ success: true, data: records });
        } catch (error) {
            next(error);
        }
    }

    // Fetch List of Values (LOV)
    async getLOV(req, res, next) {
        try {
            const Model = getModel(req.params.model);

            // Default fields: id and name
            // Can be overridden by query parameters (e.g., ?label=title&value=uuid)
            const labelField = req.query.label || 'name';
            const valueField = req.query.value || 'id';

            const records = await Model.findAll({
                attributes: [labelField, valueField]
            });
            res.status(200).json({ success: true, data: records });
        } catch (error) {
            next(error);
        }
    }

    // Fetch single record
    async getOne(req, res, next) {
        try {
            const Model = getModel(req.params.model);
            const record = await Model.findByPk(req.params.id);
            if (!record) {
                return res.status(404).json({ success: false, message: 'Record not found' });
            }
            res.status(200).json({ success: true, data: record });
        } catch (error) {
            next(error);
        }
    }

    // Create or Update
    async createOrUpdate(req, res, next) {
        try {
            const Model = getModel(req.params.model);
            const payload = req.body;

            if (payload.id) {
                // Update existing record since ID is provided
                const [updatedRows] = await Model.update(payload, {
                    where: { id: payload.id }
                });

                if (updatedRows === 0) {
                    return res.status(404).json({ success: false, message: 'Record not found for update' });
                }

                const updatedRecord = await Model.findByPk(payload.id);
                return res.status(200).json({ success: true, data: updatedRecord });
            } else {
                // Create new record
                const newRecord = await Model.create(payload);
                return res.status(201).json({ success: true, data: newRecord });
            }
        } catch (error) {
            next(error);
        }
    }

    // Explicit Update (PUT /:model/:id)
    async updateById(req, res, next) {
        try {
            const Model = getModel(req.params.model);
            const [updatedRows] = await Model.update(req.body, {
                where: { id: req.params.id }
            });

            if (updatedRows === 0) {
                return res.status(404).json({ success: false, message: 'Record not found for update' });
            }

            const updatedRecord = await Model.findByPk(req.params.id);
            return res.status(200).json({ success: true, data: updatedRecord });
        } catch (error) {
            next(error);
        }
    }

    // Delete
    async delete(req, res, next) {
        try {
            const Model = getModel(req.params.model);
            const deletedRows = await Model.destroy({
                where: { id: req.params.id }
            });

            if (deletedRows === 0) {
                return res.status(404).json({ success: false, message: 'Record not found for deletion' });
            }

            res.status(200).json({ success: true, message: 'Record deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DynamicController();
