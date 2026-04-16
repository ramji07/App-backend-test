const Verse = require('../models/Verse');
const DailyVerse = require('../models/DailyVerse');
const { cache, CACHE_KEYS } = require('../utils/cache');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

// @desc    Get today's daily verse
// @route   GET /api/daily-verse
// @access  Public
const getDailyVerse = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = CACHE_KEYS.DAILY_VERSE(today);

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return successResponse(res, cached, 'Daily verse fetched from cache.');
    }

    let verseObj = null;
    let devotional = null;
    let theme = null;

    // Try scheduled daily verse
    const dailyDoc = await DailyVerse.findOne({ date: today }).populate('verse').lean();
    if (dailyDoc && dailyDoc.verse) {
      verseObj = dailyDoc.verse;
      devotional = dailyDoc.devotional || null;
      theme = dailyDoc.theme || null;
    }

    // Fallback: random verse using $sample (efficient at scale)
    if (!verseObj) {
      const [random] = await Verse.aggregate([{ $sample: { size: 1 } }]);
      verseObj = random || null;
    }

    if (!verseObj) {
      return errorResponse(res, 'No verses found in database. Please run the seed script.', 404);
    }

    const responseData = {
      _id: verseObj._id,
      date: today,
      reference: `${verseObj.book} ${verseObj.chapter}:${verseObj.verseNumber}`,
      book: verseObj.book,
      chapter: verseObj.chapter,
      verseNumber: verseObj.verseNumber,
      text: {
        en: verseObj.text?.en || '',
        hi: verseObj.text?.hi || verseObj.text?.en || '',
      },
      testament: verseObj.testament,
      devotional,
      theme,
    };

    cache.set(cacheKey, responseData, 3600);
    return successResponse(res, responseData, 'Daily verse fetched successfully.');
  } catch (error) {
    console.error('getDailyVerse error:', error);
    return errorResponse(res, 'Failed to fetch daily verse.', 500);
  }
};

// @desc    Get verses for a chapter (paginated)
// @route   GET /api/verses?book=Genesis&chapter=1&page=1&limit=50
// @access  Public
const getVersesByChapter = async (req, res) => {
  try {
    const { book, chapter, page = 1, limit = 50 } = req.query;

    if (!book || !chapter) {
      return errorResponse(res, 'Book and chapter are required query parameters.', 400);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit) || 50, 200);
    const skip = (pageNum - 1) * limitNum;
    const chapterNum = parseInt(chapter);

    const cacheKey = CACHE_KEYS.CHAPTER_VERSES(book, chapter);
    const cached = cache.get(cacheKey);

    let verses, total;

    if (cached) {
      verses = cached.verses;
      total = cached.total;
    } else {
      [verses, total] = await Promise.all([
        Verse.find({ book, chapter: chapterNum }).sort({ verseNumber: 1 }).lean(),
        Verse.countDocuments({ book, chapter: chapterNum }),
      ]);
      // Normalize: ensure hi falls back to en when missing
      verses = verses.map((v) => ({
        ...v,
        text: { en: v.text?.en || '', hi: v.text?.hi || v.text?.en || '' },
      }));
      cache.set(cacheKey, { verses, total }, 86400);
    }

    const paginatedVerses = verses.slice(skip, skip + limitNum);

    return paginatedResponse(
      res,
      paginatedVerses,
      {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalVerses: total,
        perPage: limitNum,
        hasNextPage: pageNum * limitNum < total,
        hasPrevPage: pageNum > 1,
      },
      'Verses fetched successfully.'
    );
  } catch (error) {
    console.error('getVersesByChapter error:', error);
    return errorResponse(res, 'Failed to fetch verses.', 500);
  }
};

// @desc    Search verses
// @route   GET /api/verses/search?q=love&lang=en&page=1&limit=20
// @access  Public
const searchVerses = async (req, res) => {
  try {
    const { q, lang = 'en', page = 1, limit = 20, testament } = req.query;

    if (!q || q.trim().length < 2) {
      return errorResponse(res, 'Search query must be at least 2 characters.', 400);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit) || 20, 50);
    const skip = (pageNum - 1) * limitNum;

    const safeLang = ['en', 'hi'].includes(lang) ? lang : 'en';
    const searchField = `text.${safeLang}`;
    const filter = { [searchField]: { $regex: q.trim(), $options: 'i' } };
    if (testament && ['old', 'new'].includes(testament)) filter.testament = testament;

    const [verses, total] = await Promise.all([
      Verse.find(filter).select('book chapter verseNumber text testament').skip(skip).limit(limitNum).lean(),
      Verse.countDocuments(filter),
    ]);

    const formatted = verses.map((v) => ({
      id: v._id,
      reference: `${v.book} ${v.chapter}:${v.verseNumber}`,
      book: v.book,
      chapter: v.chapter,
      verseNumber: v.verseNumber,
      text: { en: v.text?.en || '', hi: v.text?.hi || v.text?.en || '' },
      testament: v.testament,
    }));

    return paginatedResponse(
      res,
      formatted,
      {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalResults: total,
        perPage: limitNum,
        hasNextPage: pageNum * limitNum < total,
        hasPrevPage: pageNum > 1,
        query: q,
      },
      `Found ${total} result(s) for "${q}".`
    );
  } catch (error) {
    console.error('searchVerses error:', error);
    return errorResponse(res, 'Search failed.', 500);
  }
};

module.exports = { getDailyVerse, getVersesByChapter, searchVerses };
