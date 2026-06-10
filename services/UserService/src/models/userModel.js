const pool = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Find user by email
 * @param {string} email User email
 * @returns {Promise<object|null>} User object or null if not found
 */
const findByEmail = async (email) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, first_name, last_name, email, role, is_active FROM users WHERE email = ?',
      [email]
    );
    connection.release();
    return rows.length > 0 ? rows[0] : null;
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
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, first_name, last_name, email, role, is_active, is_verified, created_at FROM users WHERE id = ?',
      [userId]
    );
    connection.release();
    return rows.length > 0 ? rows[0] : null;
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

    const connection = await pool.getConnection();
    const query = `
INSERT INTO users (first_name, last_name, email, password, role, is_active, is_verified, created_at)
VALUES (?, ?, ?, ?, ?, 1, 0, NOW())
    `;
    const [result] = await connection.query(query, [
first_name, last_name, email, hashedPassword, role
    ]);
    connection.release();

    // Return created user (without password)
    return {
      id: result.insertId, first_name, last_name, email, role, is_active: 1
    };
  } catch (error) {
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
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, first_name, last_name, email, password, role, is_active, is_verified FROM users WHERE email = ?',
      [email]
    );
    connection.release();
    return rows.length > 0 ? rows[0] : null;
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
    const connection = await pool.getConnection();

    // Build dynamic update query
    const allowedFields = ['first_name', 'last_name', 'bio', 'role', 'is_active', 'is_verified'];
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(updateData[field]);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(userId);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await connection.query(query, values);
    connection.release();

    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }

    // Return updated user
    return await findById(userId);
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
    const limit = options.limit || 10;
    const offset = options.offset || 0;

    const connection = await pool.getConnection();

    // Build where clause
    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    if (options.role) {
      whereClause += ' AND role = ?';
      queryParams.push(options.role);
    }

    if (options.status) {
      whereClause += ' AND is_active = ?';
      queryParams.push(options.status);
    }

    // Get total count
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      queryParams
    );
    const total = countResult[0].total;

    // Get users
    const [rows] = await connection.query(
      `SELECT id, first_name, last_name, email, role, is_active, is_verified, created_at FROM users 
       ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );
    connection.release();

    return {
      users: rows,
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
 * Get all pending tutors (not yet verified)
 * @returns {Promise<array>} List of pending tutor users
 */
const getAllPendingTutors = async () => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT id, first_name, last_name, email, role, 
       is_active, is_verified, created_at 
       FROM users 
       WHERE role = 'tutor' AND is_verified = 0 AND is_active = 1
       ORDER BY created_at DESC`
    );
    connection.release();
    return rows;
  } catch (error) {
    console.error('Database error in getAllPendingTutors:', error.message);
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
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM users WHERE id = ?', [userId]);
    connection.release();

    return result.affectedRows > 0;
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
  getAllPendingTutors,
  deleteUser
};