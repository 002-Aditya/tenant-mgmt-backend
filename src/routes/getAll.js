const express = require('express');
const dynamicController = require('../controllers/dynamic.controller');
const authenticateToken = require('../middlewares/auth');

const router = express.Router();

// All routes here should be authenticated
router.use(authenticateToken);

// Get all records for a model
router.get('/:model', dynamicController.getAll);

module.exports = router;
