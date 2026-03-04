const express = require("express");
const googleAuthController = require("../controllers/googleAuth.controller");
const { parseFormData } = require("../utils/formDataParser");

const router = express.Router();

router.post(
  "/auth/google",
  parseFormData.none(),
  googleAuthController.postGoogleAuth,
);

router.get("/auth/google", googleAuthController.getGoogleAuth);

router.get("/helloWorld", googleAuthController.helloWorld);

router.get("/auth/google/callback", googleAuthController.googleAuthCallback);

// Protected Route Example
router.get(
  "/inside",
  googleAuthController.checkAuthenticated,
  googleAuthController.inside,
);

module.exports = router;
