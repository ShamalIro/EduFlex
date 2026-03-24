import React, { useState } from 'react';
import {
  Clock,
  Plus,
  CheckCircle,
  HelpCircle,
  ListOrdered,
  ToggleLeft,
  Type,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { QuestionBuilder, createEmptyQuestion } from './QuestionBuilder';

/**
 * QuizForm Component
 * Form for creating/editing quizzes with dynamic question builder
 */
export function QuizForm({
  initialData = null,
  onSubmit,
  onCancel,
  isModal = true,
  isOpen = false,
  courseTitle = ''
}) {
  // Form state
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    timerDuration: initialData?.timerDuration || '15',
    status: initialData?.status || 'draft',
    questions: initialData?.questions || [createEmptyQuestion('mcq')]
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  const [questionErrors, setQuestionErrors] = useState({});

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success state
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle basic field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle timer duration - only allow positive numbers
  const handleTimerChange = (e) => {
    const value = e.target.value;

    // Only allow positive numbers (no -, +, e, E)
    if (value === '' || /^[0-9]+$/.test(value)) {
      // Limit to max 180 minutes
      const numValue = parseInt(value) || 0;
      if (numValue <= 180) {
        setFormData(prev => ({ ...prev, timerDuration: value }));
        if (errors.timerDuration) {
          setErrors(prev => ({ ...prev, timerDuration: '' }));
        }
      }
    }
  };

  // Handle timer keydown - prevent invalid characters
  const handleTimerKeyDown = (e) => {
    // Prevent -, +, e, E, . characters
    if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
      e.preventDefault();
    }
  };

  // Handle question update
  const handleQuestionChange = (index, updatedQuestion) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = updatedQuestion;
    setFormData(prev => ({ ...prev, questions: newQuestions }));

    // Clear question errors
    if (questionErrors[index]) {
      setQuestionErrors(prev => ({ ...prev, [index]: {} }));
    }
  };

  // Add new question
  const addQuestion = (type = 'mcq') => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, createEmptyQuestion(type)]
    }));
  };

  // Delete question
  const deleteQuestion = (index) => {
    if (formData.questions.length <= 1) {
      setErrors(prev => ({ ...prev, questions: 'Quiz must have at least one question' }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  // Calculate total points
  const totalPoints = formData.questions.reduce((sum, q) => sum + (q.points || 0), 0);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const newQuestionErrors = {};

    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = 'Quiz title is required';
    }

    const timerValue = parseInt(formData.timerDuration) || 0;
    if (!formData.timerDuration || timerValue < 1) {
      newErrors.timerDuration = 'Timer must be at least 1 minute';
    } else if (timerValue > 180) {
      newErrors.timerDuration = 'Timer cannot exceed 180 minutes';
    }

    if (formData.questions.length === 0) {
      newErrors.questions = 'Quiz must have at least one question';
    }

    // Validate each question
    formData.questions.forEach((question, index) => {
      const qErrors = {};

      if (!question.text.trim()) {
        qErrors.text = 'Question text is required';
      }

      if (question.type === 'mcq') {
        // Check options
        const hasEmptyOptions = (question.options || []).some(opt => !opt.trim());
        if (hasEmptyOptions) {
          qErrors.options = 'All options must be filled';
        }
        if (!question.options || question.options.length < 2) {
          qErrors.options = 'At least 2 options required';
        }
      }

      if (question.type === 'shortanswer' && !question.expectedAnswer?.trim()) {
        qErrors.expectedAnswer = 'Expected answer is required';
      }

      if (Object.keys(qErrors).length > 0) {
        newQuestionErrors[index] = qErrors;
      }
    });

    setErrors(newErrors);
    setQuestionErrors(newQuestionErrors);

    return Object.keys(newErrors).length === 0 && Object.keys(newQuestionErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const quizData = {
        ...formData,
        timerDuration: parseInt(formData.timerDuration),
        id: initialData?.id || `quiz-${Date.now()}`,
        totalPoints,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attempts: initialData?.attempts || 0
      };

      // Show success message
      setShowSuccess(true);

      // Call onSubmit after a brief delay
      setTimeout(() => {
        if (onSubmit) {
          onSubmit(quizData);
        }
      }, 1500);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form content
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      {showSuccess ? (
        // Success message
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Quiz {initialData ? 'Updated' : 'Created'} Successfully!
          </h3>
          <p className="text-slate-600">
            The quiz has been {initialData ? 'updated' : 'added'} to the course.
          </p>
        </div>
      ) : (
        <>
          {/* Course info (read-only) */}
          {courseTitle && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Adding to Course</p>
              <p className="text-sm font-medium text-slate-900">{courseTitle}</p>
            </div>
          )}

          {/* Quiz Title */}
          <Input
            name="title"
            label="Quiz Title"
            placeholder="Enter quiz title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            icon={HelpCircle}
          />

          {/* Description */}
          <Textarea
            name="description"
            label="Description (Optional)"
            placeholder="Describe what this quiz covers..."
            value={formData.description}
            onChange={handleChange}
            rows={2}
          />

          {/* Timer and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Timer Duration - Only positive numbers */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Time Limit (minutes)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  name="timerDuration"
                  value={formData.timerDuration}
                  onChange={handleTimerChange}
                  onKeyDown={handleTimerKeyDown}
                  placeholder="e.g., 15"
                  className={`
                    block w-full rounded-lg border shadow-sm pl-10 pr-3 py-2.5 text-sm
                    focus:outline-none focus:ring-2 focus:ring-offset-0
                    ${errors.timerDuration
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
                    }
                  `}
                />
              </div>
              {errors.timerDuration && (
                <p className="mt-1 text-sm text-rose-500">{errors.timerDuration}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">Maximum 180 minutes</p>
            </div>

            {/* Status */}
            <Select
              name="status"
              label="Status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'draft', label: 'Draft - Not visible to students' },
                { value: 'published', label: 'Published - Visible to students' }
              ]}
            />
          </div>

          {/* Quiz Summary */}
          <div className="flex items-center gap-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-2 text-sm">
              <HelpCircle className="h-4 w-4 text-indigo-600" />
              <span className="font-medium text-indigo-900">{formData.questions.length} Questions</span>
            </div>
            <div className="text-sm text-indigo-700">
              Total Points: <span className="font-medium">{totalPoints}</span>
            </div>
            <div className="text-sm text-indigo-700">
              Duration: <span className="font-medium">{formData.timerDuration || 0} min</span>
            </div>
          </div>

          {/* Questions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-900">Questions</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addQuestion('mcq')}
                >
                  <ListOrdered className="h-4 w-4 mr-1" />
                  MCQ
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addQuestion('truefalse')}
                >
                  <ToggleLeft className="h-4 w-4 mr-1" />
                  True/False
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addQuestion('shortanswer')}
                >
                  <Type className="h-4 w-4 mr-1" />
                  Short Answer
                </Button>
              </div>
            </div>

            {errors.questions && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
                <AlertTriangle className="h-4 w-4" />
                {errors.questions}
              </div>
            )}

            {/* Question List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {formData.questions.map((question, index) => (
                <QuestionBuilder
                  key={question.id}
                  question={question}
                  index={index}
                  onChange={handleQuestionChange}
                  onDelete={deleteQuestion}
                  errors={questionErrors[index] || {}}
                />
              ))}
            </div>

            {/* Add Question Button */}
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => addQuestion('mcq')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Question
            </Button>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {initialData ? 'Update Quiz' : 'Create Quiz'}
            </Button>
          </div>
        </>
      )}
    </form>
  );

  // Render as modal or standalone form
  if (isModal) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onCancel}
        title={initialData ? 'Edit Quiz' : 'Add New Quiz'}
        size="lg"
      >
        {formContent}
      </Modal>
    );
  }

  return formContent;
}

export default QuizForm;
