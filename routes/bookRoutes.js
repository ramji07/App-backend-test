const express = require('express');
const router = express.Router();
const { getBooks, getChaptersByBook } = require('../controllers/bookController');

router.get('/books', getBooks);
router.get('/books/:book/chapters', getChaptersByBook);

module.exports = router;
