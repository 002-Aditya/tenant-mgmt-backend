const passport = require("passport");
const logger = require("../../middlewares/logger");

exports.postGoogleAuth = (req, res, next) => {
  req.session.oauthMetadata = {};

  const stateString = req.query.redirectUrl ? Buffer.from(req.query.redirectUrl).toString("base64") : undefined;

  passport.authenticate("google", {
    scope: ["email", "profile", "openid"],
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
    scope: ["email", "profile", "openid"],
    state: stateString,
  })(req, res, next);
};

// Update the callback to decode the JSON state object
exports.googleAuthCallback = (req, res, next) => {
  passport.authenticate("google", {
    failureRedirect: process.env.APP_URL,
  })(req, res, () => {
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
        logger.error("Failed to parse state", e);
      }
    }

    const separator = redirectBase.includes("?") ? "&" : "?";
    const redirectUrl = `${redirectBase}${separator}success=true`;
    res.redirect(redirectUrl);
  });
};