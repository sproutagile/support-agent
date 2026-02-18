const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(express.json());
app.use(cors());

// --- Routes ---
const healthRoutes = require('./src/routes/health.route');

// Use the routes
app.use('/api/health', healthRoutes);

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`🚀 Sprout Support Backend running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

