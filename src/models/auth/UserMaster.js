const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/config/db");

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
    photo: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: "Photo must be a valid URL.",
        },
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
    genderId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: {
          tableName: "gender",
          schema: "lov",
        },
        key: "gender_id",
      },
      validate: {
        isUUID: {
          args: 4,
          msg: "Gender must be a valid UUID mapping.",
        },
      },
      comment: "Foreign Key to Gender LOV",
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: true,
      validate: {
        isUUID: {
          args: 4,
          msg: "Role must be a valid UUID mapping.",
        },
      },
      comment: "Foreign Key to Role Master",
    },
    contactNumber: {
      type: DataTypes.STRING(10),
      allowNull: true,
      unique: {
        name: "uq_users_contact_number",
        msg: "This contact number is already registered.",
      },
      validate: {
        isNumeric: {
          msg: "Contact number must contain only numeric digits.",
        },
        len: {
          args: [10, 10],
          msg: "Contact number must be exactly 10 digits.",
        },
      },
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
      defaultValue: false,
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
      // UNIQUE INDEXES
      {
        name: "uq_user_master_email",
        fields: ["email"],
        unique: true,
      },
      {
        name: "uq_user_master_contact_number",
        fields: ["contact_number"],
        unique: true,
      },

      // FOREIGN KEY INDEX
      {
        name: "idx_user_master_role_id",
        fields: ["role_id"],
      },

      // STATUS FILTER INDEXES
      {
        name: "idx_user_master_is_active",
        fields: ["is_active"],
      },
      {
        name: "idx_user_master_is_verified",
        fields: ["is_verified"],
      },

      // COMPOSITE INDEXES (VERY IMPORTANT)
      {
        name: "idx_user_master_email_active_verified",
        fields: ["email", "is_active", "is_verified"],
      },
      {
        name: "idx_user_master_role_active_verified",
        fields: ["role_id", "is_active", "is_verified"],
      },
    ],
  },
);

// We define the association dynamically to prevent circular dependencies at load time
User.associate = (models) => {
  if (models.Gender) {
    User.belongsTo(models.Gender, { foreignKey: "gender_id" });
  }
};

module.exports = User;
