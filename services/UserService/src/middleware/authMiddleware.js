const { verifyToken } = require('../utils/jwtHelper');

/**
 * Verify JWT token middleware
 * Extracts token from Authorization header and attaches user to req.user
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Missing or invalid authorization header'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);

    if (error.message === 'Token has expired') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    if (error.message === 'Invalid token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

/**
 * Admin role check middleware
 * Must be used after authMiddleware
 */
const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required'
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Authorization check failed',
      error: error.message
    });
  }
};

/**
 * Tutor role check middleware
 * Must be used after authMiddleware
 */
const isTutor = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (req.user.role !== 'tutor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Tutor role required'
      });
    }

    next();
  } catch (error) {
    console.error('Tutor check error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Authorization check failed',
      error: error.message
    });
  }
};

/**
 * Student role check middleware
 * Must be used after authMiddleware
 */
const isStudent = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student role required'
      });
    }

    next();
  } catch (error) {
    console.error('Student check error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Authorization check failed',
      error: error.message
    });
  }
};

module.exports = {
  authMiddleware,
  isAdmin,
  isTutor,
  isStudent
};
