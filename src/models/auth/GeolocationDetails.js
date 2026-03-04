const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const GeolocationDetails = sequelize.define(
  "GeolocationDetails",
  {
    geoLocationId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true,
      unique: true,
    },
    range: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    timezone: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    latitudeLongitude: {
      type: DataTypes.GEOGRAPHY("POINT", 4326),
      allowNull: false,
    },
    area: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    },
    createdOn: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    schema: "auth",
    tableName: "user_geolocation_details",
    timestamps: false,
    comment: "This table will store user geolocation details.",
    underscored: true,
    hasTrigger: true,
    freezeTableName: true,
    indexes: [
      {
        name: "idx_user_geolocation_user_id",
        fields: ["user_id"],
      },
      {
        name: "idx_user_geolocation_location",
        fields: ["latitude_longitude"],
        using: "GIST",
      },
      {
        name: "idx_user_geolocation_country_city",
        fields: ["country", "city"],
      },
    ],
  },
);

module.exports = GeolocationDetails;
