const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['payment', 'enrollment', 'financial_aid', 'course', 'assignment', 'general'],
    default: 'general'
  },
  is_read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: '🔔'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);