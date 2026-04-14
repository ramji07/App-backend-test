const express = require('express');
const router = express.Router();
const { getDailyVerse, getVersesByChapter, searchVerses } = require('../controllers/verseController');

router.get('/daily-verse', getDailyVerse);
router.get('/verses', getVersesByChapter);
router.get('/verses/search', searchVerses);

module.exports = router;
