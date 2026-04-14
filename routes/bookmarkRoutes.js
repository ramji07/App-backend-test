const express = require('express');
const router = express.Router();
const { addBookmark, getBookmarks, removeBookmark } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');

router.post('/bookmarks', protect, addBookmark);
router.get('/bookmarks/:userId', protect, getBookmarks);
router.delete('/bookmarks/:verseId', protect, removeBookmark);

module.exports = router;
