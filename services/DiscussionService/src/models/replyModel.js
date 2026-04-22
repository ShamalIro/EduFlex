const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  post_id: { type: String, required: true, index: true },
  author_id: { type: String, required: true },
  author_name: { type: String, required: true },
  author_role: { type: String, enum: ['student', 'tutor', 'admin'] },
  content: { type: String, required: true },
  is_best_answer: { type: Boolean, default: false },
  is_deleted: { type: Boolean, default: false },
  upvotes: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Reply', replySchema);