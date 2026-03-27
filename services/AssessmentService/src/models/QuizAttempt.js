const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz_id: { type: String, required: true, index: true },
    course_id: { type: String, required: true, index: true },
    student_id: { type: String, required: true, index: true },
    student_name: { type: String, default: 'Student' },
    answers: {
      type: Array,
      default: []
    },
    score: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null },
    status: { type: String, enum: ['in_progress', 'submitted'], default: 'in_progress' }
  },
  {
    timestamps: true
  }
);

quizAttemptSchema.index(
  { quiz_id: 1, student_id: 1, submittedAt: -1 }
);

quizAttemptSchema.index(
  { course_id: 1, student_id: 1 }
);

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
