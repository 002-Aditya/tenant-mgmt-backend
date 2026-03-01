const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const User = sequelize.define(
  "User",
  {
    userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: {
        name: "uq_users_email",
        msg: "This email address is already registered.",
      },
      validate: {
        notNull: { msg: "Email address is required." },
        notEmpty: { msg: "Email address cannot be empty." },
        isEmail: { msg: "Please provide a valid email address format." },
      },
    },
    firstName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notNull: { msg: "First name is required." },
        notEmpty: { msg: "First name cannot be empty." },
        len: {
          args: [1, 200],
          msg: "First name must be between 1 and 200 characters.",
        },
      },
    },
    lastName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notNull: { msg: "Last name is required." },
        notEmpty: { msg: "Last name cannot be empty." },
        len: {
          args: [1, 200],
          msg: "Last name must be between 1 and 200 characters.",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("M", "F", "O"),
      allowNull: false,
      validate: {
        notNull: { msg: "Gender is required." },
        isIn: {
          args: [["M", "F", "O"]],
          msg: "Gender must be one of: M, F, O.",
        },
      },
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        notNull: { msg: "Role mapping is required." },
        isUUID: {
          args: 4,
          msg: "Role must be a valid UUID mapping.",
        },
      },
      comment: "Foreign Key to Role Master",
    },
    contactNumber: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: {
        name: "uq_users_contact_number",
        msg: "This contact number is already registered.",
      },
      validate: {
        notNull: { msg: "Contact number is required." },
        notEmpty: { msg: "Contact number cannot be empty." },
        isNumeric: {
          msg: "Contact number must contain only numeric digits.",
        },
        len: {
          args: [10, 10],
          msg: "Contact number must be exactly 10 digits.",
        },
      },
    },
    createdOn: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    modifiedOn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: false,
    tableName: "user_master",
    schema: "auth",
    underscored: true,
    comment:
      "Will be storing user's information on the basis of their role i.e., Admin/Tenant.",
    indexes: [
      {
        name: "idx_users_email",
        fields: ["email"],
        unique: true,
      },
      {
        name: "idx_users_contact_number",
        fields: ["contact_number"],
        unique: true,
      },
      {
        name: "idx_users_role_id",
        fields: ["role_id"],
      },
      {
        name: "idx_users_is_active",
        fields: ["is_active"],
      },
    ],
  },
);

module.exports = User;
