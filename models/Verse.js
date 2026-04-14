const mongoose = require('mongoose');

const multilingualTextSchema = new mongoose.Schema(
  {
    en: { type: String, required: [true, 'English text is required'] },
    hi: { type: String, default: '' },
    fr: { type: String, default: '' },
    es: { type: String, default: '' },
    de: { type: String, default: '' },
    pt: { type: String, default: '' },
  },
  { _id: false }
);

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
      type: multilingualTextSchema,
      required: true,
    },
    testament: {
      type: String,
      enum: ['old', 'new'],
      required: true,
    },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
  }
);

// ─── Compound Indexes ─────────────────────────────────────────────────────────
verseSchema.index({ book: 1, chapter: 1, verseNumber: 1 }, { unique: true });
verseSchema.index({ 'text.en': 'text' });

// ─── Virtual: reference string ────────────────────────────────────────────────
verseSchema.virtual('reference').get(function () {
  return `${this.book} ${this.chapter}:${this.verseNumber}`;
});

module.exports = mongoose.model('Verse', verseSchema);
