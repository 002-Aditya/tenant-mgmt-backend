const express = require("express");
const googleAuthController = require("../controllers/auth/google-login");
const { parseFormData } = require("../middlewares/formDataParser");

const router = express.Router();

router.post("/auth/google", parseFormData, googleAuthController.postGoogleAuth);
router.get("/auth/google", googleAuthController.getGoogleAuth);
router.get("/auth/google/callback", googleAuthController.googleAuthCallback);

module.exports = router;