const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers
} = require('../controllers/userController');
const {
  authMiddleware,
  isAdmin
} = require('../middleware/authMiddleware');

/**
 * Public Routes (no authentication required)
 */

// Register new user (student or tutor)
// POST /api/users/register
// Body: { name, email, password, role: 'student' | 'tutor' }
router.post('/register', register);

// Login user
// POST /api/users/login
// Body: { email, password }
router.post('/login', login);

/**
 * Protected Routes (authentication required)
 */

// Get logged-in user profile
// GET /api/users/profile
// Header: Authorization: Bearer <token>
router.get('/profile', authMiddleware, getProfile);

// Update logged-in user profile
// PUT /api/users/profile
// Header: Authorization: Bearer <token>
// Body: { name, status }
router.put('/profile', authMiddleware, updateProfile);

/**
 * Admin Routes (authentication + admin role required)
 */

// Get all users (admin only)
// GET /api/users/all
// Header: Authorization: Bearer <token>
// Query: ?limit=10&offset=0&role=student&status=active
router.get('/all', authMiddleware, isAdmin, getAllUsers);

// Delete user by ID (admin only)
// DELETE /api/users/:id
// Header: Authorization: Bearer <token>
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { deleteUser } = require('../models/userModel');
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const deleted = await deleteUser(userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// Activate/Deactivate user (admin only)
// PUT /api/users/:id/status
router.put('/:id/status', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { updateUser } = require('../models/userModel');
    const userId = req.params.id;
    const { is_active } = req.body;

    const updatedUser = await updateUser(userId, { is_active });

    res.json({
      success: true,
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`,
      data: { user: updatedUser }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
});

// Change user role (admin only)
// PUT /api/users/:id/role
router.put('/:id/role', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { updateUser } = require('../models/userModel');
    const userId = req.params.id;
    const { role } = req.body;

    if (!['student', 'tutor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const updatedUser = await updateUser(userId, { role });

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
});

/**
 * Health check route
 */
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'User Service routes working'
  });
});

module.exports = router;
