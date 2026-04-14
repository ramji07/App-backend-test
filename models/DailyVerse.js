const mongoose = require('mongoose');

const dailyVerseSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
      index: true,
    },
    verse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Verse',
      required: true,
    },
    theme: {
      type: String,
      default: '',
    },
    devotional: {
      en: { type: String, default: '' },
      hi: { type: String, default: '' },
      fr: { type: String, default: '' },
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DailyVerse', dailyVerseSchema);
