const passport = require("passport");

exports.postGoogleAuth = (req, res, next) => {
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
  // Combine redirectUrl and updateMap into a single state object
  const stateObj = {
    redirectUrl: req.query.redirectUrl || null,
    updateMap: req.query.updateMap ? JSON.parse(req.query.updateMap) : null
  };

  // Convert the object to a Base64 string for safe transport
  const stateString = Buffer.from(JSON.stringify(stateObj)).toString("base64");

  passport.authenticate("google", {
    scope: ["email", "profile"],
    state: stateString,
  })(req, res, next);
};

// Update the callback to decode the JSON state object
exports.googleAuthCallback = (req, res, next) => {
  passport.authenticate("google", {
    failureRedirect: "/helloWorld",
  })(req, res, () => {
    const user = req.user;

    let redirectBase = process.env.APP_URL;
    
    // Decode the state to get the redirectUrl back
    if (req.query.state) {
      try {
        const decodedState = Buffer.from(req.query.state, "base64").toString("ascii");
        const stateObj = JSON.parse(decodedState);
        if (stateObj.redirectUrl) {
           redirectBase = stateObj.redirectUrl;
        }
      } catch (e) {
        console.error("Failed to parse state", e);
      }
    }

    const separator = redirectBase.includes("?") ? "&" : "?";
    const userId = user.userId || user.id || user.sub;
    const redirectUrl = `${redirectBase}${separator}success=true&userId=${userId}`;
    res.redirect(redirectUrl);
  });
};

exports.helloWorld = (req, res) => {
  res.send(
    `<h1>Google Authentication Required</h1><a href="/auth/google">Login Here</a>`,
  );
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
