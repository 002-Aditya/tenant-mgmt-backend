const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const logger = require("../middlewares/logger");
const AuthService = require("../services/auth.service");

const setupGoogleAuth = (app) => {
  const authUser = async (
    request,
    accessToken,
    refreshToken,
    profile,
    done,
  ) => {
    try {
      // Pluck the saved location and device object bound onto the session earlier
      const metadata = request.session?.oauthMetadata || null;

      const response = await AuthService.handleGoogleSSOLogin(
        profile,
        metadata,
      );

      if (!response.success) {
        throw new Error(response.error);
      }

      // Cleanup to prevent phantom data
      if (request.session) {
        request.session.oauthMetadata = null;
      }

      return done(null, response.data);
    } catch (error) {
      logger.error("Error in Google Strategy:", error);
      return done(error, null);
    }
  };

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET_ID,
        callbackURL: process.env.BACKEND_URL
          ? `${process.env.BACKEND_URL}/auth/google/callback`
          : `http://localhost:${process.env.PORT || 3000}/auth/google/callback`,
        passReqToCallback: true,
      },
      authUser,
    ),
  );

  passport.serializeUser((user, done) => {
    logger.info(`Serialized user: ${user.displayName}`);
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    logger.info(`Deserialized user: ${user.displayName}`);
    done(null, user);
  });

  // Middleware to check if user is authenticated
  const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect("/helloWorld");
  };

  // Setup passport and session usage
  app.use(passport.initialize());
  app.use(passport.session());
};

module.exports = setupGoogleAuth;
