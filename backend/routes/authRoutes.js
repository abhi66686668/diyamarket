const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminProfile, setupAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);
router.get('/profile', protect, getAdminProfile);
router.post('/setup', setupAdmin); // Should ideally be disabled in production

module.exports = router;
