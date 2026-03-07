const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/config/db");

const DeviceDetails = sequelize.define(
  "DeviceDetails",
  {
    deviceDetailsId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: {
          tableName: "user_master",
          schema: "auth",
        },
        key: "user_id",
      },
      validate: {
        isUUID: {
          args: 4,
          msg: "User ID must be a valid UUID mapping.",
        },
      },
      comment: "Foreign Key to User Master",
    },
    os: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: "Operating System is required." },
        notEmpty: { msg: "Operating System cannot be empty." },
      },
    },
    osVersion: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notNull: { msg: "Operating System version is required." },
        notEmpty: { msg: "Operating System version cannot be empty." },
      },
    },
    browser: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: "Browser is required." },
        notEmpty: { msg: "Browser cannot be empty." },
      },
    },
    createdOn: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "device_details",
    schema: "auth",
    underscored: true,
    comment:
      "Stores device details information including OS, OS Version, and Browser mapped to users.",
    indexes: [
      {
        name: "idx_device_details_user_id",
        fields: ["user_id"],
      },
      {
        name: "idx_device_details_os",
        fields: ["os"],
      },
      {
        name: "idx_device_details_browser",
        fields: ["browser"],
      },
    ],
  },
);

module.exports = DeviceDetails;
