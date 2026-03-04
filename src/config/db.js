const { Sequelize } = require("sequelize");
const { Client } = require("pg");
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
      console.log(`Database "${DB_NAME}" does not exist. Creating...`);
      await client.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`Database "${DB_NAME}" created successfully.`);
    } else {
      console.log(`Database "${DB_NAME}" already exists.`);
    }
  } catch (error) {
    console.error("Error ensuring database exists:", error.message);
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
      console.log(`Schema "${schema}" ensured to exist.`);
    }
  } catch (error) {
    console.error("Error creating schemas:", error.message);
    throw error;
  }
};

/**
 * Test DB connection and sync models
 */
const connectDB = async () => {
  try {
    await createDatabaseIfNotExists();

    // Test the basic connection
    await sequelize.authenticate();
    console.log("PostgreSQL (Sequelize) connected successfully.");

    // Ensure schemas from an array exist
    const defaultSchemas = ["public", "auth", "notification", "lov"];
    await createSchemasIfNotExist(defaultSchemas);

    // Create extensions
    const { createExtensionsIfNotExist } = require("./db-extension");
    await createExtensionsIfNotExist(sequelize);

    // Fine-grained model synchronization
    const syncAllModels = require("./syncModels");
    await syncAllModels();
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB, createSchemasIfNotExist };
