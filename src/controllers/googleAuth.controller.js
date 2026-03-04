const passport = require("passport");

exports.postGoogleAuth = (req, res, next) => {
  // Safely stash the mapped multipart/form-data body into the session
  // This allows it to persist across the google OAuth bounds natively.
  req.session.oauthMetadata = req.body || {};

  const stateString = req.query.redirectUrl
    ? Buffer.from(req.query.redirectUrl).toString("base64")
    : undefined;

  passport.authenticate("google", {
    scope: ["email", "profile"],
    state: stateString,
  })(req, res, next);
};

exports.getGoogleAuth = (req, res, next) => {
  // Ensure we flush any old lingering session data
  req.session.oauthMetadata = null;

  const stateString = req.query.redirectUrl
    ? Buffer.from(req.query.redirectUrl).toString("base64")
    : undefined;

  passport.authenticate("google", {
    scope: ["email", "profile"],
    state: stateString,
  })(req, res, next);
};

exports.helloWorld = (req, res) => {
  res.send(
    `<h1>Google Authentication Required</h1><a href="/auth/google">Login Here</a>`,
  );
};

exports.googleAuthCallback = (req, res, next) => {
  passport.authenticate("google", {
    failureRedirect: "/helloWorld",
  })(req, res, () => {
    const user = req.user;

    let redirectBase = process.env.APP_URL;
    if (req.query.state) {
      try {
        redirectBase = Buffer.from(req.query.state, "base64").toString("ascii");
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
  });
};

// Middleware to check if user is authenticated
exports.checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/helloWorld");
};

exports.inside = (req, res) => {
  const userName = req.user.displayName;
  res.send(`<h1>Successfully logged in! Welcome ${userName}</h1>`);
};
