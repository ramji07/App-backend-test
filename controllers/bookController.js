const BibleBook = require('../models/BibleBook');
const Verse = require('../models/Verse');
const { cache, CACHE_KEYS } = require('../utils/cache');
const { successResponse, errorResponse } = require('../utils/response');

// @desc    Get all Bible books
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  try {
    const cached = cache.get(CACHE_KEYS.BOOKS_LIST);
    if (cached) {
      return successResponse(res, cached, 'Books fetched from cache.');
    }

    const books = await BibleBook.find().sort({ order: 1 }).lean();

    const oldTestament = books.filter((b) => b.testament === 'old');
    const newTestament = books.filter((b) => b.testament === 'new');

    const responseData = {
      total: books.length,
      oldTestament: { count: oldTestament.length, books: oldTestament },
      newTestament: { count: newTestament.length, books: newTestament },
    };

    cache.set(CACHE_KEYS.BOOKS_LIST, responseData, 86400); // cache 24h

    return successResponse(res, responseData, 'Books fetched successfully.');
  } catch (error) {
    console.error('getBooks error:', error);
    return errorResponse(res, 'Failed to fetch books.', 500);
  }
};

// @desc    Get chapters list for a book
// @route   GET /api/books/:book/chapters
// @access  Public
const getChaptersByBook = async (req, res) => {
  try {
    const { book } = req.params;
    const decodedBook = decodeURIComponent(book);
    const cacheKey = CACHE_KEYS.BOOK_CHAPTERS(decodedBook);

    const cached = cache.get(cacheKey);
    if (cached) {
      return successResponse(res, cached, 'Chapters fetched from cache.');
    }

    const bookDoc = await BibleBook.findOne({ name: decodedBook }).lean();
    if (!bookDoc) {
      return errorResponse(res, `Book "${decodedBook}" not found.`, 404);
    }

    // Get verse counts per chapter
    const chapterStats = await Verse.aggregate([
      { $match: { book: decodedBook } },
      { $group: { _id: '$chapter', verseCount: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const chapters = Array.from({ length: bookDoc.chapters }, (_, i) => {
      const stat = chapterStats.find((s) => s._id === i + 1);
      return {
        chapter: i + 1,
        verseCount: stat?.verseCount || 0,
      };
    });

    const responseData = {
      book: decodedBook,
      testament: bookDoc.testament,
      abbreviation: bookDoc.abbreviation,
      totalChapters: bookDoc.chapters,
      chapters,
    };

    cache.set(cacheKey, responseData, 86400);

    return successResponse(res, responseData, 'Chapters fetched successfully.');
  } catch (error) {
    console.error('getChaptersByBook error:', error);
    return errorResponse(res, 'Failed to fetch chapters.', 500);
  }
};

module.exports = { getBooks, getChaptersByBook };
