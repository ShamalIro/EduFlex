import React, { useState } from 'react';
import { Calendar, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { FileUpload } from '../ui/FileUpload';
import { Modal } from '../ui/Modal';

/**
 * AssignmentForm Component
 * Form for creating/editing assignments with validation
 */
export function AssignmentForm({
  initialData = null,
  onSubmit,
  onCancel,
  isModal = true,
  isOpen = false,
  courseTitle = ''
}) {
  // Get minimum datetime (current time)
  const getMinDateTime = () => {
    const now = new Date();
    // Format: YYYY-MM-DDTHH:MM
    return now.toISOString().slice(0, 16);
  };

  // Form state
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    instructions: initialData?.instructions || '',
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().slice(0, 16) : '',
    totalMarks: initialData?.totalMarks || '',
    status: initialData?.status || 'draft',
    instructionFile: initialData?.instructionFile || null
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success state
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle input changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle marks input - only allow positive numbers
  const handleMarksChange = (e) => {
    const value = e.target.value;

    // Only allow positive numbers (no -, +, e, E)
    if (value === '' || /^[0-9]+$/.test(value)) {
      setFormData(prev => ({ ...prev, totalMarks: value }));
      if (errors.totalMarks) {
        setErrors(prev => ({ ...prev, totalMarks: '' }));
      }
    }
  };

  // Handle marks keydown - prevent invalid characters
  const handleMarksKeyDown = (e) => {
    // Prevent -, +, e, E, . characters
    if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
      e.preventDefault();
    }
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    setFormData(prev => ({ ...prev, instructionFile: file }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = 'Assignment title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      // Check if due date is in the past
      const dueDateTime = new Date(formData.dueDate);
      const now = new Date();
      if (dueDateTime <= now) {
        newErrors.dueDate = 'Due date must be in the future';
      }
    }

    if (!formData.totalMarks) {
      newErrors.totalMarks = 'Total marks is required';
    } else if (Number(formData.totalMarks) <= 0) {
      newErrors.totalMarks = 'Total marks must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

      const assignmentData = {
        ...formData,
        id: initialData?.id || `asgn-${Date.now()}`,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submissions: initialData?.submissions || 0
      };

      // Show success message
      setShowSuccess(true);

      // Call onSubmit after a brief delay
      setTimeout(() => {
        if (onSubmit) {
          onSubmit(assignmentData);
        }
      }, 1500);
    } catch (error) {
      console.error('Error submitting assignment:', error);
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
            Assignment {initialData ? 'Updated' : 'Created'} Successfully!
          </h3>
          <p className="text-slate-600">
            The assignment has been {initialData ? 'updated' : 'added'} to the course.
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

          {/* Assignment Title */}
          <Input
            name="title"
            label="Assignment Title"
            placeholder="Enter assignment title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            icon={FileText}
          />

          {/* Description */}
          <Textarea
            name="description"
            label="Description"
            placeholder="Describe the assignment objectives and requirements..."
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            rows={3}
          />

          {/* Instructions */}
          <Textarea
            name="instructions"
            label="Instructions (Optional)"
            placeholder="Add detailed instructions for students..."
            value={formData.instructions}
            onChange={handleChange}
            rows={2}
            hint="You can also upload an instruction file below"
          />

          {/* Instruction File Upload */}
          <FileUpload
            label="Instruction File (Optional)"
            onFileSelect={handleFileSelect}
            value={formData.instructionFile}
            acceptedTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
            maxSize={10 * 1024 * 1024}
            hint="PDF or Word document (max 10MB)"
          />

          {/* Due Date and Total Marks Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Due Date & Time
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  min={getMinDateTime()}
                  className={`
                    block w-full rounded-lg border shadow-sm pl-10 pr-3 py-2.5 text-sm
                    focus:outline-none focus:ring-2 focus:ring-offset-0
                    ${errors.dueDate
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
                    }
                  `}
                />
              </div>
              {errors.dueDate && (
                <p className="mt-1 text-sm text-rose-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.dueDate}
                </p>
              )}
            </div>

            {/* Total Marks - Only positive numbers */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Total Marks
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="totalMarks"
                placeholder="e.g., 100"
                value={formData.totalMarks}
                onChange={handleMarksChange}
                onKeyDown={handleMarksKeyDown}
                className={`
                  block w-full rounded-lg border shadow-sm px-3 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-offset-0
                  ${errors.totalMarks
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }
                `}
              />
              {errors.totalMarks && (
                <p className="mt-1 text-sm text-rose-500">{errors.totalMarks}</p>
              )}
            </div>
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

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {initialData ? 'Update Assignment' : 'Create Assignment'}
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
        title={initialData ? 'Edit Assignment' : 'Add New Assignment'}
      >
        {formContent}
      </Modal>
    );
  }

  return formContent;
}

export default AssignmentForm;
