const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const Gender = sequelize.define(
  "Gender",
  {
    genderId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    genderName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        name: "uq_gender_name",
        msg: "Gender name must be unique.",
      },
      validate: {
        notNull: { msg: "Gender name is required." },
        notEmpty: { msg: "Gender name cannot be empty." },
      },
    },
    genderCode: {
      type: DataTypes.STRING(1),
      allowNull: false,
      unique: {
        name: "uq_gender_code",
        msg: "Gender code must be unique.",
      },
      validate: {
        notNull: { msg: "Gender code is required." },
        notEmpty: { msg: "Gender code cannot be empty." },
        len: {
          args: [1, 1],
          msg: "Gender code must be exactly 1 character.",
        },
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "gender",
    schema: "lov",
    underscored: true,
    timestamps: false,
    comment: "List of values for Gender",
  },
);

module.exports = Gender;
