require('dotenv').config();
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
const proxyRoutes = require('./src/routes/proxy.route');
const dashboardRoutes = require('./src/routes/dashboard.route');

// Use the routes
app.use('/api/health', healthRoutes);
app.use('/api/proxy', proxyRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Catch-all 404 handler (returns JSON instead of HTML)
app.use((req, res) => {
    console.warn(`[404] Route not found: ${req.url}`);
    res.status(404).json({ error: 'Route not found' });
});

// --- Start Server ---
const VERSION = "2.0.0-n8n-proxy";
app.listen(PORT, async () => {
    console.log(`🚀 Sprout Support Backend v${VERSION} running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Proxy status: http://localhost:${PORT}/api/proxy/status`);
});
