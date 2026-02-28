const express = require('express');
const dynamicController = require('../controllers/dynamic.controller');
const authenticateToken = require('../middlewares/auth');

const router = express.Router();

// All routes here should be authenticated
router.use(authenticateToken);

// Get single record by ID
router.get('/:model/:id', dynamicController.getOne);

module.exports = router;
