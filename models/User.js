const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    language: {
      type: String,
      enum: { values: ['en', 'hi'], message: 'Language must be en or hi' },
      default: 'en',
    },
    bookmarks: [
      {
        verseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Verse' },
        book:        { type: String },
        chapter:     { type: Number },
        verseNumber: { type: Number },
        text: {
          en: { type: String, default: '' },
          hi: { type: String, default: '' },
        },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    pushToken:  { type: String, default: null },
    isActive:   { type: Boolean, default: true },
    lastLoginAt:{ type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare plaintext password to hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
