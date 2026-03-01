const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const UserMaster = require("../auth/UserMaster");

const OtpMaster = sequelize.define(
  "OtpMaster",
  {
    otpId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: UserMaster,
        key: "user_id",
      },
      validate: {
        notNull: {
          msg: "userId mapping is required.",
        },
        isUUID: {
          args: 4,
          msg: "userId must be a valid UUID formatting.",
        },
      },
      comment: "FK to UserMaster table",
    },
    otp: {
      type: DataTypes.STRING(4),
      allowNull: false,
      validate: {
        notNull: {
          msg: "OTP string is required.",
        },
        len: {
          args: [4, 4],
          msg: "OTP must be exactly 4 digits long.",
        },
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdOn: {
      type: DataTypes.DATE,
    },
    expiryAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => new Date(Date.now() + 5 * 60000),
      validate: {
        notNull: {
          msg: "Expiry time is required.",
        },
        isDate: {
          msg: "Expiry time must be a valid date/time value.",
        },
      },
    },
    retryCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        max: {
          args: [3],
          msg: "Maximum OTP retry count exceeded (3 max).",
        },
        min: {
          args: [0],
          msg: "Retry count cannot be negative.",
        },
      },
    },
  },
  {
    tableName: "otp_master",
    schema: "notification",
    timestamps: true,
    underscored: true,
    createdAt: "createdOn",
    updatedAt: false,
    comment:
      "Master table for storing and verifying OTPs for users mapped by userId",
  },
);

// Setting up the association explicitely (optional but good practice for includes)
UserMaster.hasMany(OtpMaster, { foreignKey: "user_id" });
OtpMaster.belongsTo(UserMaster, { foreignKey: "user_id" });

module.exports = OtpMaster;
