const DbCrudService = require("../utils/db-crud");
const User = require("../models/auth/UserMaster");

class AuthService {
  /**
   * Handles the persistence of a Google SSO User Profile.
   * Extracts necessary fields and performs a findOrCreate operation on the UserMaster model.
   *
   * @param {Object} profile - The Google OAuth profile object
   * @param {Object} [metadata] - Optional Device and Geolocation Form Data Payload
   * @returns {Promise<Object>} Formatted response with success status and user data
   */
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

      // If user persistence was successful, and we have form-data metadata, write that too
      if (response.success && metadata && metadata.updateMap) {
        const userId = response.data.user_id;

        let parsedMetadata = {};
        try {
          parsedMetadata = JSON.parse(metadata.updateMap);
        } catch (error) {
          console.error("Failed to parse updateMap JSON:", error.message);
        }

        // Persist Device Details asynchronously
        if (
          parsedMetadata.os ||
          parsedMetadata.osVersion ||
          parsedMetadata.browser
        ) {
          const DeviceDetails = require("../models/auth/DeviceDetails");
          DbCrudService.create(DeviceDetails, {
            userId,
            os: parsedMetadata.os || "Unknown",
            osVersion: parsedMetadata.osVersion || "Unknown",
            browser: parsedMetadata.browser || "Unknown",
          }).catch((err) =>
            console.error(
              "Failed to persist Google SSO device metadata:",
              err.error || err.message,
            ),
          );
        }

        // Persist Geospatial Details asynchronously
        const { country, region, timezone, city, latitude, longitude, area } =
          parsedMetadata;
        if (country && city && latitude && longitude) {
          const GeolocationDetails = require("../models/auth/GeolocationDetails");
          DbCrudService.create(GeolocationDetails, {
            userId,
            country,
            region: region || "Unknown",
            timezone: timezone || "Unknown",
            city,
            latitudeLongitude: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            area: area ? parseInt(area, 10) : null,
          }).catch((err) =>
            console.error(
              "Failed to persist Google SSO geolocation metadata:",
              err.error || err.message,
            ),
          );
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
