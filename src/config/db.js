const { Sequelize } = require("sequelize");
const { Client } = require("pg");
const logger = require('../middlewares/logger');
require("dotenv").config();

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

/**
 * Creates the database if it does not exist
 */
const createDatabaseIfNotExists = async () => {
  const client = new Client({ 
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: "postgres",
  });

  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [DB_NAME],
    );
    if (res.rowCount === 0) {
      logger.info(`Database "${DB_NAME}" does not exist. Creating...`);
      await client.query(`CREATE DATABASE "${DB_NAME}"`);
      logger.info(`Database "${DB_NAME}" created successfully.`);
    } else {
      logger.info(`Database "${DB_NAME}" already exists.`);
    }
  } catch (error) {
    logger.error("Error ensuring database exists:", error.message);
    throw error;
  } finally {
    await client.end();
  }
};

/**
 * Initialize Sequelize with connection pooling
 */
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

/**
 * Creates schemas if they do not exist
 * @param {string[]} schemas - Array of schema names to create
 */
const createSchemasIfNotExist = async (schemas) => {
  if (!Array.isArray(schemas) || schemas.length === 0) return;
  try {
    for (const schema of schemas) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);
      logger.info(`Schema "${schema}" ensured to exist.`);
    }
  } catch (error) {
    logger.error("Error creating schemas:", error.message);
    throw error;
  }
};

/**
 * Test DB connection and sync models
 */
const connectDB = async () => {
  try {
    await createDatabaseIfNotExists();

    // Testing Database Connection
    await sequelize.authenticate();
    console.log("PostgreSQL (Sequelize) connected successfully.");

    // Creating schemas
    const defaultSchemas = ["public", "auth", "notification", "lov"];
    await createSchemasIfNotExist(defaultSchemas);

    // Creating extensions
    const { createExtensionsIfNotExist } = require("./db-extension");
    await createExtensionsIfNotExist(sequelize);

    // Syncing models
    const syncAllModels = require("./syncModels");
    await syncAllModels();
  } catch (error) {
    logger.error("Unable to connect to the database:", error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
