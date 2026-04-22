const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  course_id: { type: String, required: true, index: true },
  lesson_id: { type: String, default: null },
  author_id: { type: String, required: true },
  author_name: { type: String, required: true },
  author_role: { type: String, enum: ['student', 'tutor', 'admin'] },
  content: { type: String, required: true },
  is_pinned: { type: Boolean, default: false },
  is_flagged: { type: Boolean, default: false },
  is_deleted: { type: Boolean, default: false },
  upvotes: [{ type: String }],
  reply_count: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);