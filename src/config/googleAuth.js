const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const logger = require("../middlewares/logger"); // Adjusting to the real logger path

const setupGoogleAuth = (app) => {
  const authUser = (request, accessToken, refreshToken, profile, done) => {
    // Here you would typically find or create the user in your database
    // For now, we simply pass the Google profile through
    return done(null, profile);
  };

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET_ID, // Matches the .env variable GOOGLE_SECRET_ID
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
      const redirectUrl = `${redirectBase}${separator}success=true&userId=${user.id || user.sub}`;
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
