/**
 * convertAndSeed.js
 *
 * Reads English and Hindi Bible JSON files in the format:
 *   { "Book": [ { "Chapter": [ { "Verse": [ { "Verseid": "00010001", "Verse": "text" } ] } ] } ] }
 *
 * Maps book names, merges both languages into one MongoDB document per verse,
 * and upserts into the Verse collection (no duplicates).
 *
 * Usage:
 *   node utils/convertAndSeed.js
 *
 * Place your JSON files at:
 *   backend/data/bible_en.json
 *   backend/data/bible_hi.json
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Verse = require('../models/Verse');
const BibleBook = require('../models/BibleBook');

// ─── Book metadata: name, testament, order, abbreviation ─────────────────────
const BOOK_LIST = [
  { name: 'Genesis',        abbr: 'GEN', testament: 'old', order: 1,  chapters: 50 },
  { name: 'Exodus',         abbr: 'EXO', testament: 'old', order: 2,  chapters: 40 },
  { name: 'Leviticus',      abbr: 'LEV', testament: 'old', order: 3,  chapters: 27 },
  { name: 'Numbers',        abbr: 'NUM', testament: 'old', order: 4,  chapters: 36 },
  { name: 'Deuteronomy',    abbr: 'DEU', testament: 'old', order: 5,  chapters: 34 },
  { name: 'Joshua',         abbr: 'JOS', testament: 'old', order: 6,  chapters: 24 },
  { name: 'Judges',         abbr: 'JDG', testament: 'old', order: 7,  chapters: 21 },
  { name: 'Ruth',           abbr: 'RUT', testament: 'old', order: 8,  chapters: 4  },
  { name: '1 Samuel',       abbr: '1SA', testament: 'old', order: 9,  chapters: 31 },
  { name: '2 Samuel',       abbr: '2SA', testament: 'old', order: 10, chapters: 24 },
  { name: '1 Kings',        abbr: '1KI', testament: 'old', order: 11, chapters: 22 },
  { name: '2 Kings',        abbr: '2KI', testament: 'old', order: 12, chapters: 25 },
  { name: '1 Chronicles',   abbr: '1CH', testament: 'old', order: 13, chapters: 29 },
  { name: '2 Chronicles',   abbr: '2CH', testament: 'old', order: 14, chapters: 36 },
  { name: 'Ezra',           abbr: 'EZR', testament: 'old', order: 15, chapters: 10 },
  { name: 'Nehemiah',       abbr: 'NEH', testament: 'old', order: 16, chapters: 13 },
  { name: 'Esther',         abbr: 'EST', testament: 'old', order: 17, chapters: 10 },
  { name: 'Job',            abbr: 'JOB', testament: 'old', order: 18, chapters: 42 },
  { name: 'Psalms',         abbr: 'PSA', testament: 'old', order: 19, chapters: 150 },
  { name: 'Proverbs',       abbr: 'PRO', testament: 'old', order: 20, chapters: 31 },
  { name: 'Ecclesiastes',   abbr: 'ECC', testament: 'old', order: 21, chapters: 12 },
  { name: 'Song of Solomon',abbr: 'SNG', testament: 'old', order: 22, chapters: 8  },
  { name: 'Isaiah',         abbr: 'ISA', testament: 'old', order: 23, chapters: 66 },
  { name: 'Jeremiah',       abbr: 'JER', testament: 'old', order: 24, chapters: 52 },
  { name: 'Lamentations',   abbr: 'LAM', testament: 'old', order: 25, chapters: 5  },
  { name: 'Ezekiel',        abbr: 'EZK', testament: 'old', order: 26, chapters: 48 },
  { name: 'Daniel',         abbr: 'DAN', testament: 'old', order: 27, chapters: 12 },
  { name: 'Hosea',          abbr: 'HOS', testament: 'old', order: 28, chapters: 14 },
  { name: 'Joel',           abbr: 'JOL', testament: 'old', order: 29, chapters: 3  },
  { name: 'Amos',           abbr: 'AMO', testament: 'old', order: 30, chapters: 9  },
  { name: 'Obadiah',        abbr: 'OBA', testament: 'old', order: 31, chapters: 1  },
  { name: 'Jonah',          abbr: 'JON', testament: 'old', order: 32, chapters: 4  },
  { name: 'Micah',          abbr: 'MIC', testament: 'old', order: 33, chapters: 7  },
  { name: 'Nahum',          abbr: 'NAH', testament: 'old', order: 34, chapters: 3  },
  { name: 'Habakkuk',       abbr: 'HAB', testament: 'old', order: 35, chapters: 3  },
  { name: 'Zephaniah',      abbr: 'ZEP', testament: 'old', order: 36, chapters: 3  },
  { name: 'Haggai',         abbr: 'HAG', testament: 'old', order: 37, chapters: 2  },
  { name: 'Zechariah',      abbr: 'ZEC', testament: 'old', order: 38, chapters: 14 },
  { name: 'Malachi',        abbr: 'MAL', testament: 'old', order: 39, chapters: 4  },
  { name: 'Matthew',        abbr: 'MAT', testament: 'new', order: 40, chapters: 28 },
  { name: 'Mark',           abbr: 'MRK', testament: 'new', order: 41, chapters: 16 },
  { name: 'Luke',           abbr: 'LUK', testament: 'new', order: 42, chapters: 24 },
  { name: 'John',           abbr: 'JHN', testament: 'new', order: 43, chapters: 21 },
  { name: 'Acts',           abbr: 'ACT', testament: 'new', order: 44, chapters: 28 },
  { name: 'Romans',         abbr: 'ROM', testament: 'new', order: 45, chapters: 16 },
  { name: '1 Corinthians',  abbr: '1CO', testament: 'new', order: 46, chapters: 16 },
  { name: '2 Corinthians',  abbr: '2CO', testament: 'new', order: 47, chapters: 13 },
  { name: 'Galatians',      abbr: 'GAL', testament: 'new', order: 48, chapters: 6  },
  { name: 'Ephesians',      abbr: 'EPH', testament: 'new', order: 49, chapters: 6  },
  { name: 'Philippians',    abbr: 'PHP', testament: 'new', order: 50, chapters: 4  },
  { name: 'Colossians',     abbr: 'COL', testament: 'new', order: 51, chapters: 4  },
  { name: '1 Thessalonians',abbr: '1TH', testament: 'new', order: 52, chapters: 5  },
  { name: '2 Thessalonians',abbr: '2TH', testament: 'new', order: 53, chapters: 3  },
  { name: '1 Timothy',      abbr: '1TI', testament: 'new', order: 54, chapters: 6  },
  { name: '2 Timothy',      abbr: '2TI', testament: 'new', order: 55, chapters: 4  },
  { name: 'Titus',          abbr: 'TIT', testament: 'new', order: 56, chapters: 3  },
  { name: 'Philemon',       abbr: 'PHM', testament: 'new', order: 57, chapters: 1  },
  { name: 'Hebrews',        abbr: 'HEB', testament: 'new', order: 58, chapters: 13 },
  { name: 'James',          abbr: 'JAS', testament: 'new', order: 59, chapters: 5  },
  { name: '1 Peter',        abbr: '1PE', testament: 'new', order: 60, chapters: 5  },
  { name: '2 Peter',        abbr: '2PE', testament: 'new', order: 61, chapters: 3  },
  { name: '1 John',         abbr: '1JN', testament: 'new', order: 62, chapters: 5  },
  { name: '2 John',         abbr: '2JN', testament: 'new', order: 63, chapters: 1  },
  { name: '3 John',         abbr: '3JN', testament: 'new', order: 64, chapters: 1  },
  { name: 'Jude',           abbr: 'JUD', testament: 'new', order: 65, chapters: 1  },
  { name: 'Revelation',     abbr: 'REV', testament: 'new', order: 66, chapters: 22 },
];

// Build lookup: bookIndex (0-based) → metadata
const bookByIndex = {};
BOOK_LIST.forEach((b, i) => { bookByIndex[i] = b; });

// ─── Parse the nested JSON format ────────────────────────────────────────────
/**
 * Parses:
 * { "Book": [ { "Chapter": [ { "Verse": [ { "Verseid": "BBCCCVVV", "Verse": "text" } ] } ] } ] }
 *
 * Returns a flat Map: "bookIdx_chapterIdx_verseIdx" → text
 */
function parseJsonBible(jsonData) {
  const map = new Map();

  const books = jsonData.Book || jsonData.book || jsonData.BOOK || [];

  books.forEach((bookNode, bookIdx) => {
    const chapters = bookNode.Chapter || bookNode.chapter || bookNode.CHAPTER || [];

    chapters.forEach((chapterNode, chapterIdx) => {
      const verses = chapterNode.Verse || chapterNode.verse || chapterNode.VERSE || [];

      verses.forEach((verseNode, verseIdx) => {
        const text = verseNode.Verse || verseNode.verse || verseNode.VERSE || verseNode.text || '';
        const key = `${bookIdx}_${chapterIdx}_${verseIdx}`;
        map.set(key, text.trim());
      });
    });
  });

  return map;
}

// ─── Load JSON file safely ────────────────────────────────────────────────────
function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error(`❌ Failed to parse JSON at ${filePath}:`, e.message);
    return null;
  }
}

// ─── Main seed function ───────────────────────────────────────────────────────
async function convertAndSeed() {
  const DATA_DIR = path.join(__dirname, '..', 'data');

  // Attempt common filenames
  const enPath = [
    path.join(DATA_DIR, 'english.json'),
    path.join(DATA_DIR, 'en.json'),
    path.join(DATA_DIR, 'bible-en.json'),
  ].find(fs.existsSync);

  const hiPath = [
    path.join(DATA_DIR, 'hindi.json'),
    path.join(DATA_DIR, 'hi.json'),
    path.join(DATA_DIR, 'bible-hi.json'),
  ].find(fs.existsSync);

  if (!enPath) {
    console.error('❌ English Bible JSON not found in backend/data/. Expected: bible_en.json');
    process.exit(1);
  }

  console.log(`📖 Loading English Bible: ${enPath}`);
  const enJson = loadJson(enPath);
  const enMap = parseJsonBible(enJson);
  console.log(`   → ${enMap.size} English verses parsed`);

  let hiMap = new Map();
  if (hiPath) {
    console.log(`📖 Loading Hindi Bible: ${hiPath}`);
    const hiJson = loadJson(hiPath);
    hiMap = parseJsonBible(hiJson);
    console.log(`   → ${hiMap.size} Hindi verses parsed`);
  } else {
    console.warn('⚠️  Hindi Bible JSON not found. Hindi text will be empty.');
  }

  // ─── Connect DB ─────────────────────────────────────────────────────────────
  await mongoose.connect(process.env.MONGODB_URI, { maxPoolSize: 5 });
  console.log('✅ MongoDB connected');

  // ─── Seed BibleBook collection ───────────────────────────────────────────────
  console.log('\n📚 Upserting Bible books...');
  for (const book of BOOK_LIST) {
    await BibleBook.findOneAndUpdate(
      { name: book.name },
      {
        name: book.name,
        abbreviation: book.abbr,
        testament: book.testament,
        order: book.order,
        chapters: book.chapters,
        nameTranslations: {
          en: book.name,
          hi: book.name, // override if you have translations
        },
      },
      { upsert: true, new: true }
    );
  }
  console.log(`✅ ${BOOK_LIST.length} books upserted`);

  // ─── Build verse documents ───────────────────────────────────────────────────
  console.log('\n📝 Building verse documents...');

  const enBooks = (enJson.Book || enJson.book || enJson.BOOK || []);
  let totalInserted = 0;
  let totalSkipped = 0;
  const BATCH_SIZE = 500;
  let batch = [];

  for (let bookIdx = 0; bookIdx < enBooks.length; bookIdx++) {
    const bookMeta = bookByIndex[bookIdx];
    if (!bookMeta) {
      console.warn(`   ⚠️  No metadata for book index ${bookIdx}, skipping`);
      continue;
    }

    const bookNode = enBooks[bookIdx];
    const chapters = bookNode.Chapter || bookNode.chapter || bookNode.CHAPTER || [];

    for (let chapterIdx = 0; chapterIdx < chapters.length; chapterIdx++) {
      const chapterNum = chapterIdx + 1;
      const chapterNode = chapters[chapterIdx];
      const verses = chapterNode.Verse || chapterNode.verse || chapterNode.VERSE || [];

      for (let verseIdx = 0; verseIdx < verses.length; verseIdx++) {
        const verseNum = verseIdx + 1;
        const key = `${bookIdx}_${chapterIdx}_${verseIdx}`;

        const enText = (enMap.get(key) || '').trim();
        const hiText = (hiMap.get(key) || '').trim();

        if (!enText) continue; // skip empty verses

        batch.push({
          updateOne: {
            filter: {
              book: bookMeta.name,
              chapter: chapterNum,
              verseNumber: verseNum,
            },
            update: {
              $set: {
                book: bookMeta.name,
                chapter: chapterNum,
                verseNumber: verseNum,
                testament: bookMeta.testament,
                'text.en': enText,
                ...(hiText && { 'text.hi': hiText }),
              },
            },
            upsert: true,
          },
        });

        if (batch.length >= BATCH_SIZE) {
          const result = await Verse.bulkWrite(batch, { ordered: false });
          totalInserted += result.upsertedCount + result.modifiedCount;
          totalSkipped += batch.length - result.upsertedCount - result.modifiedCount;
          process.stdout.write(`\r   → Processed ${totalInserted} verses...`);
          batch = [];
        }
      }
    }
  }

  // flush remaining
  if (batch.length > 0) {
    const result = await Verse.bulkWrite(batch, { ordered: false });
    totalInserted += result.upsertedCount + result.modifiedCount;
  }

  console.log(`\n✅ Done! ${totalInserted} verses upserted, ${totalSkipped} unchanged`);

  // ─── Verify ──────────────────────────────────────────────────────────────────
  const total = await Verse.countDocuments();
  console.log(`\n📊 Total verses in DB: ${total}`);
  const sample = await Verse.findOne({ book: 'John', chapter: 3, verseNumber: 16 });
  if (sample) {
    console.log('\n🎉 Sample verse (John 3:16):');
    console.log(`   EN: ${sample.text.en}`);
    if (sample.text.hi) console.log(`   HI: ${sample.text.hi}`);
  }

  await mongoose.connection.close();
  console.log('\n✅ Seeding complete. Connection closed.');
  process.exit(0);
}

convertAndSeed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
