const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createPost,
  getPostsByCourse,
  deletePost,
  editPost,
  upvotePost,
  pinPost,
  reportPost,
  createReply,
  getRepliesByPost,
  markBestAnswer,
  upvoteReply,
  editReply,
  createAnnouncement
} = require('../controllers/discussionController');

// ─── POST ROUTES ──────────────────────────────────────

// Get all posts for a course
router.get('/course/:courseId/posts', authMiddleware, getPostsByCourse);

// Create a new post
router.post('/course/:courseId/posts', authMiddleware, createPost);

// Delete a post
router.delete('/posts/:postId', authMiddleware, deletePost);

// Edit a post (author only)
router.patch('/posts/:postId/edit', authMiddleware, editPost);

// Upvote / un-upvote a post
router.patch('/posts/:postId/upvote', authMiddleware, upvotePost);

// Pin / unpin a post (tutor/admin only)
router.patch('/posts/:postId/pin', authMiddleware, pinPost);

// Report a post
router.post('/posts/:postId/report', authMiddleware, reportPost);

// ─── REPLY ROUTES ─────────────────────────────────────

// Get all replies for a post
router.get('/posts/:postId/replies', authMiddleware, getRepliesByPost);

// Create a reply
router.post('/posts/:postId/replies', authMiddleware, createReply);

// Mark reply as best answer (tutor/admin only)
router.patch('/replies/:replyId/best', authMiddleware, markBestAnswer);

// Edit a reply (author only)
router.patch('/replies/:replyId/edit', authMiddleware, editReply);

// Upvote / un-upvote a reply
router.patch('/replies/:replyId/upvote', authMiddleware, upvoteReply);

// ─── ANNOUNCEMENT ROUTES ──────────────────────────────

// Create announcement (tutor only)
router.post('/announcements', authMiddleware, createAnnouncement);

module.exports = router;