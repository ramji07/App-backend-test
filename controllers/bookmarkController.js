const User = require('../models/User');
const Verse = require('../models/Verse');
const { successResponse, errorResponse } = require('../utils/response');

// @desc    Add a bookmark
// @route   POST /api/bookmarks
// @access  Private
const addBookmark = async (req, res) => {
  try {
    const { verseId, book, chapter, verseNumber, text } = req.body;

    if (!verseId) return errorResponse(res, 'Verse ID is required.', 400);

    const user = await User.findById(req.user._id);

    // Check if already bookmarked
    const alreadyBookmarked = user.bookmarks.some(
      (b) => b.verseId?.toString() === verseId
    );

    if (alreadyBookmarked) {
      return errorResponse(res, 'Verse is already bookmarked.', 409);
    }

    user.bookmarks.push({
      verseId,
      book,
      chapter,
      verseNumber,
      text,
      addedAt: new Date(),
    });

    await user.save({ validateBeforeSave: false });

    return successResponse(res, { bookmarks: user.bookmarks }, 'Verse bookmarked successfully.', 201);
  } catch (error) {
    console.error('addBookmark error:', error);
    return errorResponse(res, 'Failed to add bookmark.', 500);
  }
};

// @desc    Get user bookmarks
// @route   GET /api/bookmarks/:userId
// @access  Private
const getBookmarks = async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure user can only access their own bookmarks
    if (userId !== req.user._id.toString()) {
      return errorResponse(res, 'Unauthorized access to bookmarks.', 403);
    }

    const user = await User.findById(userId).select('bookmarks');
    const sorted = [...user.bookmarks].sort(
      (a, b) => new Date(b.addedAt) - new Date(a.addedAt)
    );

    return successResponse(res, { bookmarks: sorted, count: sorted.length }, 'Bookmarks fetched.');
  } catch (error) {
    console.error('getBookmarks error:', error);
    return errorResponse(res, 'Failed to fetch bookmarks.', 500);
  }
};

// @desc    Remove a bookmark
// @route   DELETE /api/bookmarks/:verseId
// @access  Private
const removeBookmark = async (req, res) => {
  try {
    const { verseId } = req.params;

    const user = await User.findById(req.user._id);
    const initialLength = user.bookmarks.length;

    user.bookmarks = user.bookmarks.filter(
      (b) => b.verseId?.toString() !== verseId
    );

    if (user.bookmarks.length === initialLength) {
      return errorResponse(res, 'Bookmark not found.', 404);
    }

    await user.save({ validateBeforeSave: false });

    return successResponse(res, { count: user.bookmarks.length }, 'Bookmark removed.');
  } catch (error) {
    console.error('removeBookmark error:', error);
    return errorResponse(res, 'Failed to remove bookmark.', 500);
  }
};

module.exports = { addBookmark, getBookmarks, removeBookmark };
