const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-env';

/**
 * Generate JWT token
 * @param {object} payload User data to encode in token
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  try {
    const token = jwt.sign(payload, SECRET_KEY, {
      expiresIn: '7d' // Token expires in 7 days
    });
    return token;
  } catch (error) {
    console.error('Token generation error:', error.message);
    throw new Error('Failed to generate token');
  }
};

/**
 * Verify JWT token
 * @param {string} token JWT token to verify
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
};

module.exports = {
  generateToken,
  verifyToken
};
