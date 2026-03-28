const mongoose = require('mongoose');

const QUESTION_TYPES = ['multiple_choice', 'true_false', 'short_answer', 'fill_in_blank'];

// Option schema for multiple choice and true/false questions
const optionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  isCorrect: { type: Boolean, default: false }
}, { _id: true });

// Blank schema for fill-in-the-blank questions
const blankSchema = new mongoose.Schema({
  position: { type: Number, required: true },
  correctAnswers: [{ type: String, trim: true }]
}, { _id: true });

// Question schema (polymorphic by type)
const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: QUESTION_TYPES
  },
  text: { type: String, required: true, trim: true },
  points: { type: Number, required: true, default: 1, min: 0 },
  order: { type: Number, required: true },

  // Multiple Choice and True/False fields
  options: [optionSchema],

  // Short Answer fields
  referenceAnswer: { type: String, trim: true },
  caseSensitive: { type: Boolean, default: false },

  // Fill-in-the-blank fields
  sentenceTemplate: { type: String, trim: true },
  blanks: [blankSchema]
}, { _id: true });

const quizSchema = new mongoose.Schema(
  {
    course_id: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    timeLimit: { type: Number, required: true, default: 15, min: 1 },
    totalPoints: { type: Number, required: true, default: 50, min: 1 },
    owner_id: { type: String, required: true, index: true },
    owner_name: { type: String, default: 'Tutor' },

    // Questions array
    questions: {
      type: [questionSchema],
      default: []
    },

    // Settings
    shuffleQuestions: { type: Boolean, default: false },
    showCorrectAnswers: { type: Boolean, default: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' }
  },
  {
    timestamps: true
  }
);

// Virtual to calculate total points from questions
quizSchema.virtual('calculatedPoints').get(function() {
  return this.questions.reduce((sum, q) => sum + q.points, 0);
});

module.exports = mongoose.model('Quiz', quizSchema);
