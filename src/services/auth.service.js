/**
 * Handles the persistence of a Google SSO User Profile.
 * Extracts the necessary fields and performs a findOrCreate operation on the UserMaster model.
 *
 * @param {Object} profile - The Google OAuth profile object
 * @param {Object} [metadata] - Optional Device and Geolocation Form Data Payload
 * @returns {Promise<Object>} Formatted response with success status and user data
 */

const DbCrudService = require("./db-crud");
const User = require("../models/auth/UserMaster");

class AuthService {
  static async handleGoogleSSOLogin(profile, metadata = null) {
    try {
      const email =
        profile.emails && profile.emails.length > 0
          ? profile.emails[0].value
          : null;

      if (!email) {
        return DbCrudService._error(400, "No email provided by Google.");
      }

      const firstName =
        profile.name?.givenName || profile.displayName || "Unknown";
      const lastName = profile.name?.familyName || "Unknown";
      const photo =
        profile.photos && profile.photos.length > 0
          ? profile.photos[0].value
          : null;

      const response = await DbCrudService.findOrCreate(
        User,
        { email: email },
        {
          email: email,
          firstName: firstName,
          lastName: lastName,
          photo: photo,
        },
      );

      if (metadata.updateMap) {
        const userId = response.data.userId || response.data.id;

        const parsedMetadata = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
        let updateMapObject = parsedMetadata.updateMap;

        if (typeof updateMapObject === "string") {
          updateMapObject = JSON.parse(updateMapObject);
        }

        // --- 1. Device Details ---
        if (
          updateMapObject.os ||
          updateMapObject.osVersion ||
          updateMapObject.deviceModel
        ) {
          const DeviceDetails = require("../models/auth/DeviceDetails");

          const device = await DbCrudService.create(DeviceDetails, {
            userId: userId,
            os: updateMapObject.os || "Unknown",
            osVersion: updateMapObject.osVersion || "Unknown",
            browser: updateMapObject.deviceModel || "Unknown",
          });
        }

        // --- 2. Geolocation Details ---
        const { latitude, longitude } = updateMapObject;

        if (latitude !== undefined && longitude !== undefined) {
          const GeolocationDetails = require("../models/auth/GeolocationDetails");

          await DbCrudService.create(GeolocationDetails, {
            userId: userId,
            country: "Unknown",
            region: "Unknown",
            timezone: "Unknown",
            city: "Unknown",
            latitudeLongitude: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            area: null,
          });
        }
      }

      return response;
    } catch (error) {
      return DbCrudService._error(
        500,
        "Error handling Google SSO login",
        error.message,
      );
    }
  }
}

module.exports = AuthService;
