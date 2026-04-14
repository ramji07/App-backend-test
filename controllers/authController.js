const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, language } = req.body;

    // Validate required fields
    if (!name || !email || !password || !language) {
      return errorResponse(res, 'Name, email, password, and language are all required.', 400);
    }

    if (password.length < 8) {
      return errorResponse(res, 'Password must be at least 8 characters.', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 'An account with this email already exists.', 409);
    }

    // Create user
    const user = await User.create({ name, email, password, language });

    const token = generateToken(user._id);

    return successResponse(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          language: user.language,
          createdAt: user.createdAt,
        },
      },
      'Account created successfully.',
      201
    );
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return errorResponse(res, messages.join(', '), 400);
    }
    if (error.code === 11000) {
      return errorResponse(res, 'An account with this email already exists.', 409);
    }
    console.error('Register error:', error);
    return errorResponse(res, 'Registration failed. Please try again.', 500);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required.', 400);
    }

    // Find user + include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Your account has been deactivated.', 403);
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    return successResponse(res, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        language: user.language,
        lastLoginAt: user.lastLoginAt,
      },
    }, 'Login successful.');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed. Please try again.', 500);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return successResponse(res, { user }, 'Profile fetched successfully.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch profile.', 500);
  }
};

// @desc    Update user language preference
// @route   PUT /api/auth/language
// @access  Private
const updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    if (!language) return errorResponse(res, 'Language code is required.', 400);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { language },
      { new: true, runValidators: true }
    );

    return successResponse(res, { language: user.language }, 'Language updated successfully.');
  } catch (error) {
    return errorResponse(res, 'Failed to update language.', 500);
  }
};

// @desc    Update push notification token
// @route   PUT /api/auth/push-token
// @access  Private
const updatePushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;
    await User.findByIdAndUpdate(req.user._id, { pushToken });
    return successResponse(res, null, 'Push token updated.');
  } catch (error) {
    return errorResponse(res, 'Failed to update push token.', 500);
  }
};

module.exports = { register, login, getMe, updateLanguage, updatePushToken };
