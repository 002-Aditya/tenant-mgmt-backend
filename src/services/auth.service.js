const DbCrudService = require("../utils/db-crud");
const User = require("../models/auth/UserMaster");

class AuthService {
  /**
   * Handles the persistence of a Google SSO User Profile.
   * Extracts necessary fields and performs a findOrCreate operation on the UserMaster model.
   *
   * @param {Object} profile - The Google OAuth profile object
   * @returns {Promise<Object>} Formatted response with success status and user data
   */
  static async handleGoogleSSOLogin(profile) {
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
