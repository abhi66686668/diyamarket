const express = require('express');
const router = express.Router();
const { getDashboardStats, getDashboardCharts, getDashboardAlerts } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/charts', getDashboardCharts);
router.get('/alerts', getDashboardAlerts);

module.exports = router;
