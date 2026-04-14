const NodeCache = require('node-cache');

const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL) || 3600,
  checkperiod: 120,
  useClones: false,
});

const CACHE_KEYS = {
  DAILY_VERSE: (date) => `daily_verse_${date}`,
  BOOKS_LIST: 'books_list',
  BOOK_CHAPTERS: (book) => `chapters_${book}`,
  CHAPTER_VERSES: (book, chapter) => `verses_${book}_${chapter}`,
};

module.exports = { cache, CACHE_KEYS };
