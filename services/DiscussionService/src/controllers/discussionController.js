const Post = require('../models/postModel');
const Reply = require('../models/replyModel');
const axios = require('axios');

// Send notification helper
const sendNotification = async ({ user_id, title, message, type, link, icon }) => {
  try {
    await axios.post(
      `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications`,
      { user_id, title, message, type, link, icon }
    );
  } catch (err) {
    console.error('Notification send failed:', err.message);
    // Never crash discussion service because of notification failure
  }
};

// ─── POSTS ───────────────────────────────────────────

// Create a new post/question
const createPost = async (req, res) => {
  try {
    const { course_id, lesson_id, content } = req.body;

    if (!course_id || !content) {
      return res.status(400).json({
        success: false,
        message: 'course_id and content are required'
      });
    }

    const post = await Post.create({
      course_id,
      lesson_id: lesson_id || null,
      author_id: String(req.user.id),
      author_name: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || req.user.email,
      author_role: req.user.role,
      content
    });

    // Notify tutor when student posts question
    if (req.user.role === 'student') {
      try {
        // Get course details to find tutor_id
        const courseRes = await axios.get(
          `${process.env.COURSE_SERVICE_URL}/${course_id}`
        );
        const course = courseRes.data?.data?.course;

        if (course?.tutor_id) {
          await sendNotification({
            user_id: String(course.tutor_id),
            title: '❓ New Question in Your Course',
            message: `${req.user.first_name || 'A student'} asked: "${content.substring(0, 60)}..."`,
            type: 'course',
            link: `/tutor/courses`,
            icon: '❓'
          });
          console.log('Tutor notified about new question');
        }
      } catch (err) {
        console.error('Failed to notify tutor:', err.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
};

// Get all posts for a course
const getPostsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const posts = await Post.find({
      course_id: courseId,
      is_deleted: false
    }).sort({ is_pinned: -1, createdAt: -1 });

    return res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Author, tutor, or admin can delete
    if (
      String(post.author_id) !== String(req.user.id) &&
      req.user.role !== 'admin' &&
      req.user.role !== 'tutor'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    post.is_deleted = true;
    post.content = 'This post was removed';
    await post.save();

    return res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
};

// Upvote a post
const upvotePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const userId = String(req.user.id);
    const index = post.upvotes.indexOf(userId);

    if (index === -1) {
      post.upvotes.push(userId); // add upvote
    } else {
      post.upvotes.splice(index, 1); // remove upvote
    }

    await post.save();

    return res.json({
      success: true,
      message: index === -1 ? 'Upvoted' : 'Upvote removed',
      data: { upvotes: post.upvotes.length }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to upvote post',
      error: error.message
    });
  }
};

// Pin a post (tutor/admin only)
const pinPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only tutors or admins can pin posts'
      });
    }

    post.is_pinned = !post.is_pinned;
    await post.save();

    return res.json({
      success: true,
      message: `Post ${post.is_pinned ? 'pinned' : 'unpinned'}`,
      data: { post }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to pin post',
      error: error.message
    });
  }
};

// Report a post
const reportPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.is_flagged = true;
    await post.save();

    return res.json({
      success: true,
      message: 'Post reported successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to report post',
      error: error.message
    });
  }
};

// ─── REPLIES ─────────────────────────────────────────

// Create a reply
const createReply = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'content is required'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const reply = await Reply.create({
      post_id: postId,
      author_id: String(req.user.id),
      author_name: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || req.user.email,
      author_role: req.user.role,
      content
    });

    // Increment reply count
    post.reply_count += 1;
    await post.save();

    // Notify the question author if tutor/admin replies
    if (req.user.role === 'tutor' || req.user.role === 'admin') {
      await sendNotification({
        user_id: post.author_id,
        title: '💬 New Reply to Your Question',
        message: `${req.user.first_name || 'Tutor'} replied to your question: "${post.content.substring(0, 50)}..."`,
        type: 'course',
        link: `/student/courses/${post.course_id}`,
        icon: '💬'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Reply created successfully',
      data: { reply }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create reply',
      error: error.message
    });
  }
};

// Get all replies for a post
const getRepliesByPost = async (req, res) => {
  try {
    const replies = await Reply.find({
      post_id: req.params.postId,
      is_deleted: false
    }).sort({ is_best_answer: -1, createdAt: 1 });

    return res.json({
      success: true,
      data: { replies }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch replies',
      error: error.message
    });
  }
};

// Mark reply as best answer (tutor only)
const markBestAnswer = async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only tutors can mark best answers'
      });
    }

    reply.is_best_answer = !reply.is_best_answer;
    await reply.save();

    return res.json({
      success: true,
      message: `Marked as ${reply.is_best_answer ? 'best answer' : 'normal reply'}`,
      data: { reply }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark best answer',
      error: error.message
    });
  }
};

// Upvote a reply
const upvoteReply = async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    const userId = String(req.user.id);
    const index = reply.upvotes.indexOf(userId);

    if (index === -1) {
      reply.upvotes.push(userId);
    } else {
      reply.upvotes.splice(index, 1);
    }

    await reply.save();

    return res.json({
      success: true,
      message: index === -1 ? 'Upvoted' : 'Upvote removed',
      data: { upvotes: reply.upvotes.length }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to upvote reply',
      error: error.message
    });
  }
};

// Edit a post (author only)
const editPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'content is required'
      });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Only author can edit their own post
    if (String(post.author_id) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this post'
      });
    }

    post.content = content.trim();
    post.is_edited = true;
    await post.save();

    return res.json({
      success: true,
      message: 'Post updated successfully',
      data: { post }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to edit post',
      error: error.message
    });
  }
};

// Edit a reply (author only)
const editReply = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'content is required'
      });
    }

    const reply = await Reply.findById(req.params.replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    // Only author can edit their own reply
    if (String(reply.author_id) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this reply'
      });
    }

    reply.content = content.trim();
    reply.is_edited = true;
    await reply.save();

    return res.json({
      success: true,
      message: 'Reply updated successfully',
      data: { reply }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to edit reply',
      error: error.message
    });
  }
};

// Create announcement (tutor only)
const createAnnouncement = async (req, res) => {
  try {
    const { course_id, content } = req.body;

    if (!course_id || !content) {
      return res.status(400).json({
        success: false,
        message: 'course_id and content are required'
      });
    }

    if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only tutors can create announcements'
      });
    }

    // Create pinned announcement post
    const post = await Post.create({
      course_id,
      author_id: String(req.user.id),
      author_name: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || req.user.email,
      author_role: req.user.role,
      content,
      is_pinned: true,
      is_announcement: true
    });

    // Get all enrolled students from EnrollmentService
    try {
      const enrollRes = await axios.get(
        `${process.env.ENROLLMENT_SERVICE_URL}/course/${course_id}/students`
      );
      const studentIds = enrollRes.data?.data?.studentIds || [];

      // Notify each enrolled student
      const notifyPromises = studentIds.map(studentId =>
        axios.post(
          `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications`,
          {
            user_id: String(studentId),
            title: '📢 New Announcement',
            message: `${req.user.first_name || 'Tutor'}: "${content.substring(0, 60)}..."`,
            type: 'course',
            link: `/student/courses/${course_id}`,
            icon: '📢'
          }
        ).catch(err => console.error('Notify failed:', err.message))
      );

      await Promise.all(notifyPromises);
      console.log(`Notified ${studentIds.length} students`);
    } catch (err) {
      console.error('Failed to get enrolled students:', err.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: { post }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create announcement',
      error: error.message
    });
  }
};

module.exports = {
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
};