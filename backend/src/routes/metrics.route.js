const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metrics.controller');

/**
 * GET /api/metrics
 * Returns aggregated EAB metrics for the dashboard.
 */
router.get('/', metricsController.getMetrics);

module.exports = router;
