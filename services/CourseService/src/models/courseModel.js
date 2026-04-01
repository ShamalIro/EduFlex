const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: null
  },
  category: {
    type: String,
    required: true,
    enum: ['Programming', 'Design', 'Business', 'Data Science', 'Marketing']
  },
  level: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  duration: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    default: 0
  },
  tutor_id: {
    type: String,
    required: true
  },
  tutor_name: {
    type: String,
    required: true
  },
  is_published: {
    type: Boolean,
    default: false
  },
  students_count: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);