const mongoose = require('mongoose');

const verseSchema = new mongoose.Schema(
  {
    book: {
      type: String,
      required: [true, 'Book name is required'],
      trim: true,
      index: true,
    },
    chapter: {
      type: Number,
      required: [true, 'Chapter number is required'],
      min: [1, 'Chapter must be at least 1'],
      index: true,
    },
    verseNumber: {
      type: Number,
      required: [true, 'Verse number is required'],
      min: [1, 'Verse number must be at least 1'],
    },
    text: {
      en: { type: String, default: '' },
      hi: { type: String, default: '' },
    },
    testament: {
      type: String,
      enum: ['old', 'new'],
      required: [true, 'Testament (old/new) is required'],
      index: true,
    },
  },
  { timestamps: false }
);

// Unique compound index — prevents duplicate verses
verseSchema.index({ book: 1, chapter: 1, verseNumber: 1 }, { unique: true });

// Full-text search on both languages
verseSchema.index({ 'text.en': 'text', 'text.hi': 'text' });

// Virtual: human-readable reference  e.g. "John 3:16"
verseSchema.virtual('reference').get(function () {
  return `${this.book} ${this.chapter}:${this.verseNumber}`;
});

module.exports = mongoose.model('Verse', verseSchema);
