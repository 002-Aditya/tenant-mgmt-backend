const express = require('express');
const dynamicController = require('../controllers/dynamic.controller');
const authenticateToken = require('../middlewares/auth');

const router = express.Router();

// All routes here should be authenticated
router.use(authenticateToken);

// Create or update a record
// Send POST body with 'id' to update, or without 'id' to create
router.post('/:model', dynamicController.createOrUpdate);

// Get List of Values (LOV) for a model (user requested LOV with POST routes)
// Note: Usually GET, but we'll include it here
router.get('/:model/lov', dynamicController.getLOV);

module.exports = router;
