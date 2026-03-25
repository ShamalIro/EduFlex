const { mongoose } = require('../config/database');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    bio: { type: String, default: '' },
    role: { type: String, enum: ['student', 'tutor', 'admin'], required: true },
    is_active: { type: Boolean, default: true }
  },
  {
    collection: 'users',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

const toUserResponse = (doc, includePassword = false) => {
  if (!doc) return null;

  const user = doc.toObject ? doc.toObject() : doc;
  const base = {
    id: user._id.toString(),
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    bio: user.bio,
    role: user.role,
    is_active: user.is_active,
    created_at: user.created_at
  };

  if (includePassword) {
    base.password = user.password;
  }

  return base;
};

/**
 * Find user by email
 * @param {string} email User email
 * @returns {Promise<object|null>} User object or null if not found
 */
const findByEmail = async (email) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('first_name last_name email role is_active bio created_at')
      .lean();
    return toUserResponse(user);
  } catch (error) {
    console.error('Database error in findByEmail:', error.message);
    throw error;
  }
};

/**
 * Find user by ID
 * @param {string|number} userId User ID
 * @returns {Promise<object|null>} User object or null if not found
 */
const findById = async (userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    const user = await User.findById(userId)
      .select('first_name last_name email role is_active bio created_at')
      .lean();
    return toUserResponse(user);
  } catch (error) {
    console.error('Database error in findById:', error.message);
    throw error;
  }
};

/**
 * Create new user
 * @param {object} userData { name, email, password, role }
 * @returns {Promise<object>} Created user object
 */
const createUser = async (userData) => {
  const { first_name, last_name, email, password, role } = userData;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      is_active: true
    });

    return toUserResponse(createdUser);
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Email already registered');
    }

    console.error('Database error in createUser:', error.message);
    throw error;
  }
};

/**
 * Verify user password
 * @param {string} plainPassword Plain text password
 * @param {string} hashedPassword Hashed password from DB
 * @returns {Promise<boolean>} True if password matches
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error.message);
    throw error;
  }
};

/**
 * Get user with password hash (for login)
 * @param {string} email User email
 * @returns {Promise<object|null>} User object with password_hash or null
 */
const findByEmailWithPassword = async (email) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('first_name last_name email password role is_active bio created_at')
      .lean();
    return toUserResponse(user, true);
  } catch (error) {
    console.error('Database error in findByEmailWithPassword:', error.message);
    throw error;
  }
};

/**
 * Update user details
 * @param {string|number} userId User ID
 * @param {object} updateData { name, role, status, ... }
 * @returns {Promise<object>} Updated user object
 */
const updateUser = async (userId, updateData) => {
  try {
    const allowedFields = ['first_name', 'last_name', 'bio', 'role', 'is_active'];
    const updates = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new Error('No valid fields to update');
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('User not found');
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .select('first_name last_name email role is_active bio created_at')
      .lean();

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return toUserResponse(updatedUser);
  } catch (error) {
    console.error('Database error in updateUser:', error.message);
    throw error;
  }
};

/**
 * Get all users (for admin)
 * @param {object} options { limit, offset, role, status }
 * @returns {Promise<{users: array, total: number}>}
 */
const getAllUsers = async (options = {}) => {
  try {
    const limit = Number(options.limit) || 10;
    const offset = Number(options.offset) || 0;
    const filters = {};

    if (options.role) {
      filters.role = options.role;
    }

    if (options.status !== undefined) {
      const normalized = String(options.status).toLowerCase();
      if (['1', 'true', 'active'].includes(normalized)) {
        filters.is_active = true;
      } else if (['0', 'false', 'inactive'].includes(normalized)) {
        filters.is_active = false;
      }
    }

    const total = await User.countDocuments(filters);
    const users = await User.find(filters)
      .select('first_name last_name email role is_active bio created_at')
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    return {
      users: users.map((user) => toUserResponse(user)),
      total,
      limit,
      offset
    };
  } catch (error) {
    console.error('Database error in getAllUsers:', error.message);
    throw error;
  }
};

/**
 * Delete user
 * @param {string|number} userId User ID
 * @returns {Promise<boolean>} True if deleted
 */
const deleteUser = async (userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return false;
    }

    const deleted = await User.findByIdAndDelete(userId);
    return !!deleted;
  } catch (error) {
    console.error('Database error in deleteUser:', error.message);
    throw error;
  }
};

module.exports = {
  findByEmail,
  findById,
  createUser,
  verifyPassword,
  findByEmailWithPassword,
  updateUser,
  getAllUsers,
  deleteUser
};
