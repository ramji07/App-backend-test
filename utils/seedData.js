/**
 * seedData.js
 * Seeds essential Bible books and famous sample verses (EN + HI).
 * For the full Bible, use: npm run seed:bible
 */

require('dotenv').config();
const mongoose = require('mongoose');
const BibleBook = require('../models/BibleBook');
const Verse = require('../models/Verse');
const DailyVerse = require('../models/DailyVerse');

const BOOKS = [
  { name: 'Genesis',        abbreviation: 'GEN', testament: 'old', order: 1,  chapters: 50 },
  { name: 'Exodus',         abbreviation: 'EXO', testament: 'old', order: 2,  chapters: 40 },
  { name: 'Psalms',         abbreviation: 'PSA', testament: 'old', order: 19, chapters: 150 },
  { name: 'Proverbs',       abbreviation: 'PRO', testament: 'old', order: 20, chapters: 31 },
  { name: 'Isaiah',         abbreviation: 'ISA', testament: 'old', order: 23, chapters: 66 },
  { name: 'Jeremiah',       abbreviation: 'JER', testament: 'old', order: 24, chapters: 52 },
  { name: 'Matthew',        abbreviation: 'MAT', testament: 'new', order: 40, chapters: 28 },
  { name: 'Mark',           abbreviation: 'MRK', testament: 'new', order: 41, chapters: 16 },
  { name: 'Luke',           abbreviation: 'LUK', testament: 'new', order: 42, chapters: 24 },
  { name: 'John',           abbreviation: 'JHN', testament: 'new', order: 43, chapters: 21 },
  { name: 'Acts',           abbreviation: 'ACT', testament: 'new', order: 44, chapters: 28 },
  { name: 'Romans',         abbreviation: 'ROM', testament: 'new', order: 45, chapters: 16 },
  { name: 'Ephesians',      abbreviation: 'EPH', testament: 'new', order: 49, chapters: 6  },
  { name: 'Philippians',    abbreviation: 'PHP', testament: 'new', order: 50, chapters: 4  },
  { name: '1 John',         abbreviation: '1JN', testament: 'new', order: 62, chapters: 5  },
  { name: 'Revelation',     abbreviation: 'REV', testament: 'new', order: 66, chapters: 22 },
];

const SAMPLE_VERSES = [
  {
    book: 'John', chapter: 3, verseNumber: 16, testament: 'new',
    text: {
      en: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
      hi: 'क्योंकि परमेश्वर ने जगत से ऐसा प्रेम रखा कि उसने अपना एकलौता पुत्र दे दिया, ताकि जो कोई उस पर विश्वास करे, वह नाश न हो, परन्तु अनन्त जीवन पाए।',
    },
  },
  {
    book: 'Psalms', chapter: 23, verseNumber: 1, testament: 'old',
    text: {
      en: 'The Lord is my shepherd; I shall not want.',
      hi: 'यहोवा मेरा चरवाहा है; मुझे किसी वस्तु की घटी न होगी।',
    },
  },
  {
    book: 'Psalms', chapter: 23, verseNumber: 4, testament: 'old',
    text: {
      en: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me.',
      hi: 'चाहे मैं मृत्यु की छाया की तराई में से होकर चलूँ, तौभी बुराई से न डरूँगा, क्योंकि तू मेरे साथ है।',
    },
  },
  {
    book: 'Philippians', chapter: 4, verseNumber: 13, testament: 'new',
    text: {
      en: 'I can do all things through Christ who strengthens me.',
      hi: 'मैं उस मसीह के द्वारा जो मुझे सामर्थ देता है सब कुछ कर सकता हूँ।',
    },
  },
  {
    book: 'Romans', chapter: 8, verseNumber: 28, testament: 'new',
    text: {
      en: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
      hi: 'और हम जानते हैं, कि जो लोग परमेश्वर से प्रेम रखते हैं, उनके लिये सब बातें मिलकर भलाई ही को उत्पन्न करती हैं।',
    },
  },
  {
    book: 'Proverbs', chapter: 3, verseNumber: 5, testament: 'old',
    text: {
      en: 'Trust in the Lord with all your heart and lean not on your own understanding.',
      hi: 'अपने सारे मन से यहोवा पर भरोसा रखना, और अपनी समझ का सहारा न लेना।',
    },
  },
  {
    book: 'Isaiah', chapter: 40, verseNumber: 31, testament: 'old',
    text: {
      en: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
      hi: 'परन्तु जो यहोवा की बाट जोहते हैं, वे नया बल प्राप्त करते जाएंगे; वे उकाबों की नाईं उड़ेंगे, वे दौड़ेंगे और श्रमित न होंगे।',
    },
  },
  {
    book: 'Jeremiah', chapter: 29, verseNumber: 11, testament: 'old',
    text: {
      en: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
      hi: 'यहोवा की यह वाणी है: मैं जानता हूँ कि मेरे मन में तुम्हारे लिये क्या विचार हैं, वे शान्ति के विचार हैं विपत्ति के नहीं।',
    },
  },
  {
    book: 'Matthew', chapter: 5, verseNumber: 3, testament: 'new',
    text: {
      en: 'Blessed are the poor in spirit, for theirs is the kingdom of heaven.',
      hi: 'धन्य हैं वे जो मन के दीन हैं, क्योंकि स्वर्ग का राज्य उन्हीं का है।',
    },
  },
  {
    book: 'Genesis', chapter: 1, verseNumber: 1, testament: 'old',
    text: {
      en: 'In the beginning God created the heavens and the earth.',
      hi: 'आदि में परमेश्वर ने आकाश और पृथ्वी की सृष्टि की।',
    },
  },
  {
    book: 'John', chapter: 1, verseNumber: 1, testament: 'new',
    text: {
      en: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
      hi: 'आदि में वचन था, वचन परमेश्वर के साथ था, और वचन परमेश्वर था।',
    },
  },
  {
    book: 'Romans', chapter: 3, verseNumber: 23, testament: 'new',
    text: {
      en: 'For all have sinned and fall short of the glory of God.',
      hi: 'इसलिये कि सब ने पाप किया है और परमेश्वर की महिमा से रहित हैं।',
    },
  },
  {
    book: 'Ephesians', chapter: 2, verseNumber: 8, testament: 'new',
    text: {
      en: 'For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God.',
      hi: 'क्योंकि विश्वास के द्वारा अनुग्रह ही से तुम्हारा उद्धार हुआ है, और यह तुम्हारी ओर से नहीं, वरन् परमेश्वर का दान है।',
    },
  },
  {
    book: '1 John', chapter: 4, verseNumber: 8, testament: 'new',
    text: {
      en: 'Whoever does not love does not know God, because God is love.',
      hi: 'जो प्रेम नहीं रखता, वह परमेश्वर को नहीं जानता, क्योंकि परमेश्वर प्रेम है।',
    },
  },
  {
    book: 'Philippians', chapter: 4, verseNumber: 6, testament: 'new',
    text: {
      en: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
      hi: 'किसी भी बात की चिन्ता मत करो, परन्तु हर बात में प्रार्थना और विनती के द्वारा अपनी अभिलाषाएं परमेश्वर के सामने उपस्थित करो।',
    },
  },
];

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { maxPoolSize: 5 });
  console.log('✅ MongoDB connected');
};

const seed = async () => {
  try {
    await connectDB();

    // Seed books
    console.log('\n📚 Seeding Bible books...');
    for (const book of BOOKS) {
      await BibleBook.findOneAndUpdate(
        { name: book.name },
        book,
        { upsert: true, new: true }
      );
    }
    console.log(`✅ ${BOOKS.length} books seeded`);

    // Seed sample verses
    console.log('\n📝 Seeding sample verses...');
    for (const v of SAMPLE_VERSES) {
      await Verse.findOneAndUpdate(
        { book: v.book, chapter: v.chapter, verseNumber: v.verseNumber },
        v,
        { upsert: true, new: true }
      );
    }
    console.log(`✅ ${SAMPLE_VERSES.length} verses seeded`);

    // Create today's daily verse
    console.log('\n☀️  Seeding today\'s daily verse...');
    const today = new Date().toISOString().split('T')[0];
    const featuredVerse = await Verse.findOne({ book: 'John', chapter: 3, verseNumber: 16 });
    if (featuredVerse) {
      await DailyVerse.findOneAndUpdate(
        { date: today },
        {
          date: today,
          verse: featuredVerse._id,
          theme: "God's Love",
          devotional: {
            en: "Today, reflect on the infinite love of God. No matter what you face, remember that you are loved unconditionally by your Creator.",
            hi: "आज, परमेश्वर के अनंत प्रेम पर विचार करें। चाहे आप कुछ भी सामना करें, याद रखें कि आप अपने सृष्टिकर्ता द्वारा बिना शर्त प्यार किए जाते हैं।",
          },
        },
        { upsert: true, new: true }
      );
      console.log('✅ Daily verse set: John 3:16');
    }

    const total = await Verse.countDocuments();
    console.log(`\n📊 Total verses in DB: ${total}`);
    console.log('\n🎉 Seed complete! Run "npm run seed:bible" to import the full Bible.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
