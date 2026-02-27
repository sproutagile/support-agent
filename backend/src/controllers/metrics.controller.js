const metricsService = require('../services/metrics.service');

/**
 * GET /api/metrics
 */
const getMetrics = async (req, res) => {
    try {
        const { startDate, endDate, priority, refresh } = req.query;

        // Extract credentials from headers (sent by sidebar)
        const domain = req.headers['x-jira-domain'];
        const email = req.headers['x-jira-email'];
        const token = req.headers['x-jira-token'];

        if (!domain || !email || !token) {
            return res.status(401).json({ error: 'Missing Jira credentials in headers' });
        }

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Missing startDate or endDate parameters' });
        }

        const metrics = await metricsService.getAggregatedMetrics(
            { startDate, endDate, priority, refresh },
            { domain, email, token }
        );

        res.json(metrics);
    } catch (error) {
        console.error('[MetricsController] Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch metrics', details: error.message });
    }
};

module.exports = {
    getMetrics
};
