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

        // n8n often returns an array [ { ... } ], unwrap it if it's a single item
        const responseData = response.data;
        const finalData = Array.isArray(responseData) && responseData.length === 1
            ? responseData[0]
            : responseData;

        return res.status(response.status).json(finalData);

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

module.exports = {
    forwardToN8n
};
