const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true
  },
  student_name: {
    type: String,
    default: 'Student'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

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
  is_free: {
    type: Boolean,
    default: false
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
  },
  reviews: [reviewSchema],
  lessons: [
    {
      lessonNumber: Number,
      lessonTitle: String,
      lessonDescription: String,
      videoUrl: String,
      pdfUrl: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);