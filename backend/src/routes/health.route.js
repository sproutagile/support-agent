const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');

/**
 * GET /api/health
 * 
 * This route maps to the health controller logic.
 */
router.get('/', healthController.getHealth);

module.exports = router;
