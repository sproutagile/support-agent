const axios = require('axios');

/**
 * Proxy Controller
 * Forwards requests from the frontend to the n8n webhook and returns the response.
 */
const forwardToN8n = async (req, res) => {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
        console.error('[ProxyController] N8N_WEBHOOK_URL is not defined in environment variables.');
        return res.status(500).json({ error: 'Backend configuration error: Webhook URL missing.' });
    }

    try {
        console.log(`[ProxyController] Forwarding ${req.method} request to n8n...`);

        // Forward the request body and include headers if necessary
        // n8n expects the payload in the body for POST requests
        const response = await axios({
            method: req.method,
            url: webhookUrl,
            data: req.body,
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        console.log(`[ProxyController] n8n responded with status ${response.status}`);

        // Log raw data for debugging (helpful for the user to see in terminal)
        const responseData = response.data;
        console.log('[ProxyController] Raw data from n8n:', JSON.stringify(responseData).substring(0, 500) + (JSON.stringify(responseData).length > 500 ? '...' : ''));

        // Always return the raw data received from n8n to the frontend.
        // The frontend will handle parsing arrays vs objects.
        return res.status(response.status).json(responseData);

    } catch (error) {
        if (error.response) {
            // n8n responded with an error status (4xx, 5xx)
            console.error(`[ProxyController] n8n Error (${error.response.status}):`, error.response.data);
            return res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            // Request was made but no response received
            console.error('[ProxyController] No response received from n8n:', error.message);
            return res.status(504).json({ error: 'Gateway Timeout: n8n workflow did not respond in time.' });
        } else {
            // Something else went wrong
            console.error('[ProxyController] Unexpected Error:', error.message);
            return res.status(500).json({ error: 'Internal Server Error while communicating with investigation service.' });
        }
    }
};

/**
 * Get Dashboard Metrics
 * Proxies dashboard metrics requests to n8n with priority label mapping.
 */
const getDashboardMetrics = async (req, res) => {
    const webhookUrl = process.env.N8N_DASHBOARD_METRICS_WEBHOOK;

    if (!webhookUrl) {
        console.error('[ProxyController] N8N_DASHBOARD_METRICS_WEBHOOK is not defined.');
        return res.status(500).json({ error: 'Backend configuration error: Dashboard Webhook URL missing.' });
    }

    const { period, priority: rawPriority } = req.query;

    // Mapping new labels back to internal keys for n8n support
    const priorityMap = {
        'P1 (Very Urgent)': 'P1',
        'P2 (Urgent)': 'P2',
        'P3 (Standard)': 'P3',
        'P4 (Low)': 'P4',
        'all': 'all'
    };

    const mappedPriority = priorityMap[rawPriority] || rawPriority || 'all';

    try {
        console.log(`[DashboardProxy] Fetching metrics for period: ${period}, priority: ${mappedPriority}...`);

        const response = await axios({
            method: 'GET',
            url: webhookUrl,
            params: {
                period: period || '30',
                priority: mappedPriority
            },
            timeout: 30000
        });

        // Normalize response
        const responseData = response.data;
        console.log('[DashboardProxy] Payload from n8n:', JSON.stringify(responseData));

        // n8n returns an array [ { ... } ], unwrap it
        const data = Array.isArray(responseData) && responseData.length > 0
            ? responseData[0]
            : responseData;

        const normalizedData = {
            priority: rawPriority || 'All Priorities',
            period: period || '30',
            velocity: typeof data.velocity !== 'undefined' ? Number(data.velocity) : 0,
            leadTime: typeof data.leadTime !== 'undefined' ? Number(data.leadTime) : 0,
            cycleTime: typeof data.cycleTime !== 'undefined' ? Number(data.cycleTime) : 0,
            resolved: typeof data.resolved !== 'undefined' ? Number(data.resolved) : 0,
            // If n8n provides trend data, use it. Otherwise, we simulate for the UI
            resolvedTrend: data.resolvedTrend || generateMockTrend(Number(data.resolved) || 0, Number(period) || 30),
            lastUpdated: new Date().toISOString()
        };

        console.log('[DashboardProxy] Normalized Sending:', JSON.stringify(normalizedData));
        return res.json(normalizedData);
    } catch (error) {
        console.error('[DashboardProxy] Error:', error.message);
        return res.status(500).json({
            error: 'Failed to fetch dashboard metrics from investigation service.',
            details: error.message
        });
    }
};

/**
 * Helper to generate simple simulated trend data if n8n doesn't provide it yet.
 */
function generateMockTrend(total, days) {
    const points = days > 30 ? 12 : (days > 7 ? 10 : 7);
    const trend = [];
    let remaining = total;

    const now = new Date();

    for (let i = 0; i < points; i++) {
        let val;
        if (i === points - 1) {
            // Last point gets the remainder to ensure sum === total
            val = Math.max(0, remaining);
        } else {
            // Calculate a random value that isn't more than what we have left
            const avg = remaining / (points - i);
            val = Math.max(0, Math.round(avg * (0.5 + Math.random())));
            remaining -= val;
        }

        // Generate a date for this point
        const date = new Date(now);
        date.setDate(now.getDate() - (points - 1 - i) * Math.ceil(days / points));

        const label = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });

        trend.push({
            label: label,
            value: val
        });
    }
    return trend;
}

module.exports = {
    forwardToN8n,
    getDashboardMetrics
};
