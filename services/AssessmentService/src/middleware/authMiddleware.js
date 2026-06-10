const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

const isTutor = (req, res, next) => {
  if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only tutors can perform this action'
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  isTutor
};
