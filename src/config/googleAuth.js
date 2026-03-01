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
      const response = await AuthService.handleGoogleSSOLogin(profile);

      if (!response.success) {
        throw new Error(response.error);
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

  app.get("/auth/google", (req, res, next) => {
    const stateString = req.query.redirectUrl
      ? Buffer.from(req.query.redirectUrl).toString("base64")
      : undefined;
    passport.authenticate("google", {
      scope: ["email", "profile"],
      state: stateString,
    })(req, res, next);
  });

  app.get("/helloWorld", (req, res) => {
    res.send(
      `<h1>Google Authentication Required</h1><a href="/auth/google">Login Here</a>`,
    );
  });

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/helloWorld",
    }),
    (req, res) => {
      // Successful authentication
      const user = req.user;
      const stringifiedUser = JSON.stringify(user);
      console.log("User: ", stringifiedUser);

      // Determine the redirect URL from the state parameter passed earlier
      let redirectBase = process.env.APP_URL || "http://localhost:8081";
      if (req.query.state) {
        try {
          redirectBase = Buffer.from(req.query.state, "base64").toString(
            "ascii",
          );
        } catch (e) {
          console.error("Failed to parse state", e);
        }
      }

      // Check if redirectBase already has query params
      const separator = redirectBase.includes("?") ? "&" : "?";
      // Since we now save to DB, the PK is userId
      const userId = user.userId || user.id || user.sub;
      const redirectUrl = `${redirectBase}${separator}success=true&userId=${userId}`;
      res.redirect(redirectUrl);
    },
  );

  // Protected Route Example
  app.get("/inside", checkAuthenticated, (req, res) => {
    const userName = req.user.displayName;
    res.send(`<h1>Successfully logged in! Welcome ${userName}</h1>`);
  });
};

module.exports = setupGoogleAuth;
