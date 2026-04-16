const mongoose = require('mongoose');

const bibleBookSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, unique: true, trim: true },
    abbreviation: { type: String, required: true, uppercase: true, trim: true },
    testament:    { type: String, enum: ['old', 'new'], required: true },
    order:        { type: Number, required: true },
    chapters:     { type: Number, required: true, min: 1 },
  },
  { timestamps: false }
);

bibleBookSchema.index({ order: 1 });
bibleBookSchema.index({ testament: 1 });

module.exports = mongoose.model('BibleBook', bibleBookSchema);
