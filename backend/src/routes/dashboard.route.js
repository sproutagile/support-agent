const express = require('express');
const router = express.Router();
const proxyController = require('../controllers/proxy.controller');

/**
 * Dashboard Routes
 * Endpoint for fetching aggregated metrics from n8n.
 */
router.get('/metrics', proxyController.getDashboardMetrics);

module.exports = router;
