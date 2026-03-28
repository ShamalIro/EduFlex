const mongoose = require('mongoose');

// Rubric criterion schema
const rubricCriterionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  maxPoints: { type: Number, required: true, min: 0 },
  order: { type: Number, required: true }
}, { _id: true });

// File requirements schema
const fileRequirementsSchema = new mongoose.Schema({
  allowedTypes: [{
    type: String,
    enum: ['pdf', 'doc', 'docx', 'txt', 'zip', 'rar', 'jpg', 'jpeg', 'png', 'gif', 'ppt', 'pptx', 'xls', 'xlsx']
  }],
  maxFileSize: { type: Number, default: 10, min: 1, max: 100 },
  maxFiles: { type: Number, default: 1, min: 1, max: 10 },
  required: { type: Boolean, default: true }
}, { _id: false });

const assignmentSchema = new mongoose.Schema(
  {
    course_id: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    maxPoints: { type: Number, required: true, default: 100, min: 1 },
    owner_id: { type: String, required: true, index: true },
    owner_name: { type: String, default: 'Tutor' },

    // Instructions for students
    instructions: { type: String, trim: true },

    // File requirements
    fileRequirements: {
      type: fileRequirementsSchema,
      default: () => ({
        allowedTypes: ['pdf', 'doc', 'docx'],
        maxFileSize: 10,
        maxFiles: 1,
        required: true
      })
    },

    // Rubric
    rubric: {
      type: [rubricCriterionSchema],
      default: []
    },

    status: { type: String, enum: ['draft', 'published'], default: 'draft' }
  },
  {
    timestamps: true
  }
);

// Virtual to get rubric total
assignmentSchema.virtual('rubricTotal').get(function() {
  return this.rubric.reduce((sum, c) => sum + c.maxPoints, 0);
});

module.exports = mongoose.model('Assignment', assignmentSchema);
