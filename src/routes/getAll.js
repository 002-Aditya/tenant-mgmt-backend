const express = require('express');
const authenticateToken = require('../middlewares/auth');

const router = express.Router();

// All routes here should be authenticated
router.use(authenticateToken);

module.exports = router;
