const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(express.json());
app.use(cors());

// Custom logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- Routes ---
const healthRoutes = require('./src/routes/health.route');
const metricsRoutes = require('./src/routes/metrics.route');

// Use the routes
app.use('/api/health', healthRoutes);
app.use('/api/metrics', metricsRoutes);

// Catch-all 404 handler (returns JSON instead of HTML)
app.use((req, res) => {
    console.warn(`[404] Route not found: ${req.url}`);
    res.status(404).json({ error: 'Route not found' });
});

// --- Start Server ---
const VERSION = "1.1.0-robust-metrics";
app.listen(PORT, async () => {
    console.log(`🚀 Sprout Support Backend v1.1.0-robust-metrics running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);

    // Diagnostic log to help debug Jira JQL issues
    try {
        console.log('[Diagnostic] Checking Jira configuration...');
        // We can't easily get credentials here without a request, but we can log a reminder
        console.log('[Diagnostic] Will log field/project availability on first metrics request.');
    } catch (e) { }
});
