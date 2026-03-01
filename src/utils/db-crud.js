/**
 * Generic Database CRUD Service
 *
 * This service provides reusable methods for common database operations
 * using Sequelize models, returning standardized objects with HTTP status codes.
 */

class DbCrudService {
  /**
   * Helper to format successful responses
   */
  static _success(statusCode, data) {
    return { success: true, statusCode, data, error: null };
  }

  /**
   * Helper to format error responses
   */
  static _error(statusCode, message, errorDetail = null) {
    return {
      success: false,
      statusCode,
      data: null,
      error: message,
      errorDetail,
    };
  }

  /**
   * Create a single record
   * @param {Object} model - Sequelize model
   * @param {Object} data - Data to insert
   * @param {Object} [transaction=null] - Optional Sequelize transaction
   * @returns {Promise<Object>} Formatted response with statusCode 201
   */
  static async create(model, data, transaction = null) {
    try {
      const record = await model.create(data, { transaction });
      return this._success(201, record);
    } catch (error) {
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        return this._error(
          400,
          "Validation Error: ",
          error.errors ? error.errors.map((e) => e.message) : error.message,
        );
      }
      return this._error(
        500,
        `Error creating record in ${model.name}`,
        error.message,
      );
    }
  }

  /**
   * Find a record or create it if it doesn't exist
   * @param {Object} model - Sequelize model
   * @param {Object} conditions - Where conditions to search for
   * @param {Object} defaults - Default values to use if creating
   * @param {Object} [transaction=null] - Optional Sequelize transaction
   * @returns {Promise<Object>} Formatted response with statusCode 200 (found) or 201 (created)
   */
  static async findOrCreate(model, conditions, defaults, transaction = null) {
    try {
      const [record, created] = await model.findOrCreate({
        where: conditions,
        defaults: defaults,
        transaction,
      });
      return this._success(created ? 201 : 200, record);
    } catch (error) {
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        return this._error(
          400,
          "Validation Error: ",
          error.errors ? error.errors.map((e) => e.message) : error.message,
        );
      }
      return this._error(
        500,
        `Error in findOrCreate for ${model.name}`,
        error.message,
      );
    }
  }

  /**
   * Bulk create multiple records
   * @param {Object} model - Sequelize model
   * @param {Array<Object>} dataArray - Array of data objects to insert
   * @param {Object} [transaction=null] - Optional Sequelize transaction
   * @returns {Promise<Object>} Formatted response with statusCode 201
   */
  static async bulkCreate(model, dataArray, transaction = null) {
    try {
      const records = await model.bulkCreate(dataArray, { transaction });
      return this._success(201, records);
    } catch (error) {
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        return this._error(
          400,
          "Validation Error: ",
          error.errors ? error.errors.map((e) => e.message) : error.message,
        );
      }
      return this._error(
        500,
        `Error bulk creating records in ${model.name}`,
        error.message,
      );
    }
  }

  /**
   * Read all records with optional attributes
   * @param {Object} model - Sequelize model
   * @param {Array<string>} [attributes] - Specific columns to select (optional)
   * @returns {Promise<Object>} Formatted response with statusCode 200
   */
  static async readAll(model, attributes = null) {
    try {
      const queryOptions = {};
      if (attributes && attributes.length > 0) {
        queryOptions.attributes = attributes;
      }
      // Ensure we only get active records if soft delete is implemented
      queryOptions.where = { isActive: true };

      const records = await model.findAll(queryOptions, {
        raw: true,
      });
      return this._success(200, records);
    } catch (error) {
      return this._error(
        500,
        `Error reading all records from ${model.name}`,
        error.message,
      );
    }
  }

  /**
   * Read records matching specific conditions
   * @param {Object} model - Sequelize model
   * @param {Object} conditions - Where clause conditions
   * @param {Array<string>} [attributes] - Specific columns to select (optional)
   * @returns {Promise<Object>} Formatted response with statusCode 200
   */
  static async readWithConditions(model, conditions, attributes = null) {
    try {
      const queryOptions = {
        where: { ...conditions, isActive: true },
      };

      if (attributes && attributes.length > 0) {
        queryOptions.attributes = attributes;
      }

      const records = await model.findAll(queryOptions, {
        raw: true,
      });
      if (!records || records.length === 0) {
        return this._error(
          404,
          `No records found in ${model.name} matching conditions`,
          null,
        );
      }
      return this._success(200, records);
    } catch (error) {
      return this._error(
        500,
        `Error reading records from ${model.name} with conditions`,
        error.message,
      );
    }
  }

  /**
   * Update records matching specific conditions
   * @param {Object} model - Sequelize model
   * @param {Object} data - Data to update
   * @param {Object} conditions - Where clause conditions
   * @param {Object} [transaction=null] - Optional Sequelize transaction
   * @returns {Promise<Object>} Formatted response with statusCode 200
   */
  static async update(model, data, conditions, transaction = null) {
    try {
      const [affectedRows] = await model.update(data, {
        where: conditions,
        transaction,
      });

      if (affectedRows === 0) {
        return this._error(
          404,
          `No matching record found in ${model.name} to update`,
          null,
        );
      }

      return this._success(200, { updatedCount: affectedRows });
    } catch (error) {
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        return this._error(
          400,
          "Validation Error: ",
          error.errors ? error.errors.map((e) => e.message) : error.message,
        );
      }
      return this._error(
        500,
        `Error updating records in ${model.name}`,
        error.message,
      );
    }
  }

  /**
   * Soft delete a record by setting isActive to false
   * @param {Object} model - Sequelize model
   * @param {Object} conditions - Where clause conditions to find the record to "delete"
   * @param {Object} [transaction=null] - Optional Sequelize transaction
   * @returns {Promise<Object>} Formatted response with statusCode 200
   */
  static async softDelete(model, conditions, transaction = null) {
    try {
      const [affectedRows] = await model.update(
        { isActive: false },
        { where: conditions, transaction },
      );

      if (affectedRows === 0) {
        return this._error(
          404,
          `No matching record found in ${model.name} to delete`,
          null,
        );
      }

      return this._success(200, { deletedCount: affectedRows });
    } catch (error) {
      return this._error(
        500,
        `Error soft deleting record in ${model.name}`,
        error.message,
      );
    }
  }
}

module.exports = DbCrudService;
