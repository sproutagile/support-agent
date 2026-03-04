const express = require('express');
const router = express.Router();
const proxyController = require('../controllers/proxy.controller');

/**
 * Proxy Routes
 * All requests to these endpoints are forwarded to n8n.
 */

// Route for AI Chat and General Investigation
router.post('/investigate', proxyController.forwardToN8n);

// Route for Metrics (Dashboard)
router.post('/metrics', proxyController.forwardToN8n);

// Health check specifically for the proxy layer
router.get('/status', (req, res) => {
    res.json({
        status: 'Proxy Layer Active',
        n8n_configured: !!process.env.N8N_WEBHOOK_URL
    });
});

module.exports = router;
