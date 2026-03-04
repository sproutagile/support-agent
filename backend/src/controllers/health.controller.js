/**
 * Health Controller
 * 
 * Logic for checking the backend's status.
 * Keeping logic separate from routing helps with testing and maintenance.
 */
const getHealth = (req, res) => {
    res.json({
        status: "ok",
        message: "backend running",
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    getHealth
};
