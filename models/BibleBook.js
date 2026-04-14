const mongoose = require('mongoose');

const bibleBookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Book name is required'],
      unique: true,
      trim: true,
    },
    abbreviation: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    testament: {
      type: String,
      enum: ['old', 'new'],
      required: [true, 'Testament is required'],
    },
    order: {
      type: Number,
      required: true,
    },
    chapters: {
      type: Number,
      required: [true, 'Number of chapters is required'],
      min: 1,
    },
    nameTranslations: {
      en: String,
      hi: String,
      fr: String,
      es: String,
      de: String,
    },
  },
  {
    timestamps: false,
  }
);

bibleBookSchema.index({ order: 1 });
bibleBookSchema.index({ testament: 1 });

module.exports = mongoose.model('BibleBook', bibleBookSchema);
