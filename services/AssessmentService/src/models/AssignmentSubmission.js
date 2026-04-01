const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignment_id: { type: String, required: true, index: true },
    course_id: { type: String, required: true, index: true },
    student_id: { type: String, required: true, index: true },
    student_name: { type: String, default: 'Student' },
    submissionText: { type: String, trim: true, default: '' },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, default: 'application/octet-stream' },
    fileSize: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' },
    grade: { type: Number, default: null },
    feedback: { type: String, trim: true, default: '' }
  },
  {
    timestamps: true
  }
);

assignmentSubmissionSchema.index(
  { assignment_id: 1, student_id: 1 },
  { unique: true }
);

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
