const express = require('express');
const router = express.Router();
const { register, login, getMe, updateLanguage, updatePushToken } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/language', protect, updateLanguage);
router.put('/push-token', protect, updatePushToken);

module.exports = router;
