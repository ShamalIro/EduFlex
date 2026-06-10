import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, HelpCircle, Plus, Pencil, Trash2, CalendarDays, Clock, Award, Eye, Users, Download } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { QuestionBuilder } from '../../components/assessment/QuestionBuilder';
import { FileRequirementsEditor, RubricBuilder } from '../../components/assessment/AssignmentBuilder';
import {
  getCourseAssignments,
  createCourseAssignment,
  updateCourseAssignment,
  deleteCourseAssignment,
  getCourseQuizzes,
  createCourseQuiz,
  updateCourseQuiz,
  deleteCourseQuiz,
  getTutorAssignmentSubmissions,
  downloadAssignmentSubmissionFile,
  getTutorQuizAttempts
} from '../../api/assessments';

// Get minimum datetime (now) for date picker
const getMinDateTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

// Format datetime for display
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Sanitize number input - only allow positive integers
const sanitizePoints = (value) => {
  // Remove any non-digit characters
  const sanitized = value.replace(/[^0-9]/g, '');
  // Remove leading zeros
  return sanitized.replace(/^0+/, '') || '';
};

const defaultAssignment = {
  title: '',
  description: '',
  dueDate: '',
  maxPoints: '100',
  instructions: '',
  fileRequirements: {
    allowedTypes: ['pdf', 'doc', 'docx'],
    maxFileSize: 10,
    maxFiles: 1,
    required: true
  },
  rubric: []
};

const defaultQuiz = {
  title: '',
  description: '',
  timeLimit: '15',
  totalPoints: '50',
  questions: [],
  shuffleQuestions: false,
  showCorrectAnswers: true
};

export function TutorAssessmentsManager() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('assignments');
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  const [isAttemptsOpen, setIsAttemptsOpen] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  const [assignmentForm, setAssignmentForm] = useState(defaultAssignment);
  const [quizForm, setQuizForm] = useState(defaultQuiz);

  const currentItems = useMemo(
    () => (activeTab === 'assignments' ? assignments : quizzes),
    [activeTab, assignments, quizzes]
  );

  useEffect(() => {
    fetchAll();
  }, [courseId]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError('');

      const [assignmentData, quizData] = await Promise.all([
        getCourseAssignments(courseId),
        getCourseQuizzes(courseId)
      ]);

      setAssignments(assignmentData);
      setQuizzes(quizData);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = (item) => {
    if (!user) return false;

    const ownerId = item.owner_id || item.tutor_id || item.created_by || item.createdBy;
    return String(ownerId) === String(user.id) || user.role === 'admin';
  };

  const resetForms = () => {
    setAssignmentForm(defaultAssignment);
    setQuizForm(defaultQuiz);
    setFormError('');
  };

  const openCreate = () => {
    resetForms();
    setIsCreateOpen(true);
  };

  const openView = (item) => {
    setViewingItem(item);
    setIsViewOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormError('');

    if (activeTab === 'assignments') {
      // Convert date to datetime-local format
      let dueDateTime = '';
      if (item.dueDate) {
        const date = new Date(item.dueDate);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        dueDateTime = date.toISOString().slice(0, 16);
      }

      setAssignmentForm({
        title: item.title || '',
        description: item.description || '',
        dueDate: dueDateTime,
        maxPoints: String(item.maxPoints ?? 100),
        instructions: item.instructions || '',
        fileRequirements: item.fileRequirements || defaultAssignment.fileRequirements,
        rubric: item.rubric || []
      });
    } else {
      setQuizForm({
        title: item.title || '',
        description: item.description || '',
        timeLimit: String(item.timeLimit ?? 15),
        totalPoints: String(item.totalPoints ?? 50),
        questions: item.questions || [],
        shuffleQuestions: item.shuffleQuestions || false,
        showCorrectAnswers: item.showCorrectAnswers !== false
      });
    }

    setIsEditOpen(true);
  };

  const validateAndBuildPayload = () => {
    if (activeTab === 'assignments') {
      if (!assignmentForm.title.trim() || !assignmentForm.description.trim() || !assignmentForm.dueDate) {
        throw new Error('Title, description, and due date are required.');
      }

      // Validate due date is not in the past
      const dueDate = new Date(assignmentForm.dueDate);
      if (dueDate < new Date()) {
        throw new Error('Due date cannot be in the past.');
      }

      const maxPoints = Number(assignmentForm.maxPoints);
      if (Number.isNaN(maxPoints) || maxPoints <= 0) {
        throw new Error('Max points must be a positive number.');
      }

      if (maxPoints > 10000) {
        throw new Error('Max points cannot exceed 10,000.');
      }

      // Validate rubric total doesn't exceed max points
      const rubricTotal = assignmentForm.rubric.reduce((sum, c) => sum + (c.maxPoints || 0), 0);
      if (rubricTotal > maxPoints) {
        throw new Error(`Rubric total (${rubricTotal}) cannot exceed max points (${maxPoints}).`);
      }

      return {
        title: assignmentForm.title.trim(),
        description: assignmentForm.description.trim(),
        dueDate: assignmentForm.dueDate,
        maxPoints,
        instructions: assignmentForm.instructions?.trim() || '',
        fileRequirements: assignmentForm.fileRequirements,
        rubric: assignmentForm.rubric
      };
    }

    if (!quizForm.title.trim() || !quizForm.description.trim()) {
      throw new Error('Title and description are required.');
    }

    const timeLimit = Number(quizForm.timeLimit);
    const totalPoints = Number(quizForm.totalPoints);

    if (Number.isNaN(timeLimit) || timeLimit <= 0) {
      throw new Error('Time limit must be a positive number.');
    }

    if (timeLimit > 600) {
      throw new Error('Time limit cannot exceed 600 minutes (10 hours).');
    }

    if (Number.isNaN(totalPoints) || totalPoints <= 0) {
      throw new Error('Total points must be a positive number.');
    }

    if (totalPoints > 10000) {
      throw new Error('Total points cannot exceed 10,000.');
    }

    // Validate questions
    for (let i = 0; i < quizForm.questions.length; i++) {
      const q = quizForm.questions[i];
      if (!q.text?.trim()) {
        throw new Error(`Question ${i + 1}: Text is required.`);
      }
      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        if (!q.options?.some(opt => opt.isCorrect)) {
          throw new Error(`Question ${i + 1}: Please mark a correct answer.`);
        }
      }
      if (q.type === 'fill_in_blank') {
        if (!q.sentenceTemplate?.includes('___')) {
          throw new Error(`Question ${i + 1}: Template must contain ___ for blanks.`);
        }
      }
    }

    return {
      title: quizForm.title.trim(),
      description: quizForm.description.trim(),
      timeLimit,
      totalPoints,
      questions: quizForm.questions,
      shuffleQuestions: quizForm.shuffleQuestions,
      showCorrectAnswers: quizForm.showCorrectAnswers
    };
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setFormError('');
      const payload = validateAndBuildPayload();

      if (activeTab === 'assignments') {
        const created = await createCourseAssignment(courseId, payload);
        setAssignments((prev) => [created, ...prev]);
      } else {
        const created = await createCourseQuiz(courseId, payload);
        setQuizzes((prev) => [created, ...prev]);
      }

      setIsCreateOpen(false);
      resetForms();
    } catch (err) {
      setFormError(err?.message || err?.response?.data?.message || 'Failed to create item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingItem) return;

    try {
      setSubmitting(true);
      setFormError('');
      const payload = validateAndBuildPayload();

      if (activeTab === 'assignments') {
        const updated = await updateCourseAssignment(editingItem.id || editingItem._id, payload);
        setAssignments((prev) => prev.map((item) => (item.id === (updated.id || updated._id) || item._id === (updated.id || updated._id) ? updated : item)));
      } else {
        const updated = await updateCourseQuiz(editingItem.id || editingItem._id, payload);
        setQuizzes((prev) => prev.map((item) => (item.id === (updated.id || updated._id) || item._id === (updated.id || updated._id) ? updated : item)));
      }

      setIsEditOpen(false);
      setEditingItem(null);
      resetForms();
    } catch (err) {
      setFormError(err?.message || err?.response?.data?.message || 'Failed to update item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete this ${activeTab === 'assignments' ? 'assignment' : 'quiz'}?`)) {
      return;
    }

    try {
      const id = item.id || item._id;
      if (activeTab === 'assignments') {
        await deleteCourseAssignment(id);
        setAssignments((prev) => prev.filter((entry) => (entry.id || entry._id) !== id));
      } else {
        await deleteCourseQuiz(id);
        setQuizzes((prev) => prev.filter((entry) => (entry.id || entry._id) !== id));
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleToggleStatus = async (item) => {
    const id = item.id || item._id;
    const nextStatus = item.status === 'published' ? 'draft' : 'published';

    try {
      if (activeTab === 'assignments') {
        const updated = await updateCourseAssignment(id, { status: nextStatus });
        setAssignments((prev) =>
          prev.map((entry) =>
            (entry.id || entry._id) === (updated.id || updated._id)
              ? updated
              : entry
          )
        );
      } else {
        const updated = await updateCourseQuiz(id, { status: nextStatus });
        setQuizzes((prev) =>
          prev.map((entry) =>
            (entry.id || entry._id) === (updated.id || updated._id)
              ? updated
              : entry
          )
        );
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update publish status');
    }
  };

  const openSubmissionsModal = async (item) => {
    setSubmissionsLoading(true);
    try {
      const data = await getTutorAssignmentSubmissions(item.id || item._id);
      setSubmissions(data);
      setViewingItem(item);
      setIsSubmissionsOpen(true);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to load submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const openAttemptsModal = async (item) => {
    setAttemptsLoading(true);
    try {
      const data = await getTutorQuizAttempts(item.id || item._id);
      setAttempts(data);
      setViewingItem(item);
      setIsAttemptsOpen(true);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to load quiz attempts');
    } finally {
      setAttemptsLoading(false);
    }
  };

  const handleSubmissionDownload = async (submission) => {
    try {
      await downloadAssignmentSubmissionFile(submission._id, submission.fileName || 'submission.bin');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to download submission file');
    }
  };

  const renderAssignmentForm = () => (
    <>
      <Input
        label="Assignment Title"
        value={assignmentForm.title}
        onChange={(e) => setAssignmentForm((prev) => ({ ...prev, title: e.target.value }))}
        placeholder="Week 1 Practical"
        required
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={assignmentForm.description}
          onChange={(e) => setAssignmentForm((prev) => ({ ...prev, description: e.target.value }))}
          className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
          rows={3}
          placeholder="Explain the assignment objective"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Due Date & Time <span className="text-rose-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={assignmentForm.dueDate}
            onChange={(e) => setAssignmentForm((prev) => ({ ...prev, dueDate: e.target.value }))}
            min={getMinDateTime()}
            className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
            required
          />
          <p className="mt-1 text-xs text-slate-500">Cannot be in the past</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Max Points <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={assignmentForm.maxPoints}
            onChange={(e) => setAssignmentForm((prev) => ({ ...prev, maxPoints: sanitizePoints(e.target.value) }))}
            placeholder="100"
            className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
            required
          />
          <p className="mt-1 text-xs text-slate-500">Positive numbers only</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Instructions for Students</label>
        <textarea
          value={assignmentForm.instructions}
          onChange={(e) => setAssignmentForm((prev) => ({ ...prev, instructions: e.target.value }))}
          className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
          rows={2}
          placeholder="Submission guidelines, formatting requirements, etc."
        />
      </div>

      <FileRequirementsEditor
        requirements={assignmentForm.fileRequirements}
        onChange={(fileRequirements) => setAssignmentForm((prev) => ({ ...prev, fileRequirements }))}
      />

      <RubricBuilder
        rubric={assignmentForm.rubric}
        maxPoints={Number(assignmentForm.maxPoints) || 100}
        onChange={(rubric) => setAssignmentForm((prev) => ({ ...prev, rubric }))}
      />
    </>
  );

  const renderQuizForm = () => (
    <>
      <Input
        label="Quiz Title"
        value={quizForm.title}
        onChange={(e) => setQuizForm((prev) => ({ ...prev, title: e.target.value }))}
        placeholder="Module 2 Quiz"
        required
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={quizForm.description}
          onChange={(e) => setQuizForm((prev) => ({ ...prev, description: e.target.value }))}
          className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
          rows={2}
          placeholder="Brief description for students"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Time Limit (minutes) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={quizForm.timeLimit}
            onChange={(e) => setQuizForm((prev) => ({ ...prev, timeLimit: sanitizePoints(e.target.value) }))}
            placeholder="15"
            className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
            required
          />
          <p className="mt-1 text-xs text-slate-500">Positive numbers only (max 600)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Total Points <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={quizForm.totalPoints}
            onChange={(e) => setQuizForm((prev) => ({ ...prev, totalPoints: sanitizePoints(e.target.value) }))}
            placeholder="50"
            className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
            required
          />
          <p className="mt-1 text-xs text-slate-500">Positive numbers only</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 py-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={quizForm.shuffleQuestions}
            onChange={(e) => setQuizForm((prev) => ({ ...prev, shuffleQuestions: e.target.checked }))}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-slate-700">Shuffle questions</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={quizForm.showCorrectAnswers}
            onChange={(e) => setQuizForm((prev) => ({ ...prev, showCorrectAnswers: e.target.checked }))}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-slate-700">Show correct answers after submission</span>
        </label>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <QuestionBuilder
          questions={quizForm.questions}
          onChange={(questions) => setQuizForm((prev) => ({ ...prev, questions }))}
        />
      </div>
    </>
  );

  const renderFormFields = () => {
    if (activeTab === 'assignments') {
      return renderAssignmentForm();
    }
    return renderQuizForm();
  };

  // Render view modal content for assignment
  const renderAssignmentView = () => {
    if (!viewingItem) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <h3 className="text-xl font-bold text-slate-900">{viewingItem.title}</h3>
          <p className="mt-2 text-slate-600">{viewingItem.description}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <CalendarDays className="h-4 w-4" />
              <span className="text-sm font-medium">Due Date</span>
            </div>
            <p className="text-lg font-semibold text-slate-900">
              {formatDateTime(viewingItem.dueDate)}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Award className="h-4 w-4" />
              <span className="text-sm font-medium">Max Points</span>
            </div>
            <p className="text-lg font-semibold text-slate-900">{viewingItem.maxPoints} pts</p>
          </div>
        </div>

        {/* Instructions */}
        {viewingItem.instructions && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Instructions</h4>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{viewingItem.instructions}</p>
            </div>
          </div>
        )}

        {/* File Requirements */}
        {viewingItem.fileRequirements && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">File Requirements</h4>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-slate-600">Allowed types:</span>
                {viewingItem.fileRequirements.allowedTypes?.map((type) => (
                  <Badge key={type} variant="secondary">.{type}</Badge>
                ))}
              </div>
              <p className="text-sm text-slate-600">
                Max file size: <strong>{viewingItem.fileRequirements.maxFileSize} MB</strong>
              </p>
              <p className="text-sm text-slate-600">
                Max files: <strong>{viewingItem.fileRequirements.maxFiles}</strong>
              </p>
              <p className="text-sm text-slate-600">
                Required: <strong>{viewingItem.fileRequirements.required ? 'Yes' : 'No'}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Rubric */}
        {viewingItem.rubric?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Grading Rubric</h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Criterion</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Points</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {viewingItem.rubric.map((criterion, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{criterion.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{criterion.description || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-900 text-right font-semibold">{criterion.maxPoints}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50">
                    <td colSpan="2" className="px-4 py-3 text-sm font-semibold text-slate-900">Total</td>
                    <td className="px-4 py-3 text-sm font-bold text-indigo-600 text-right">
                      {viewingItem.rubric.reduce((sum, c) => sum + (c.maxPoints || 0), 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="text-sm text-slate-500 pt-4 border-t border-slate-200">
          <p>Created by: {viewingItem.owner_name || 'Unknown'}</p>
          <p>Created: {formatDateTime(viewingItem.createdAt)}</p>
        </div>
      </div>
    );
  };

  // Render view modal content for quiz
  const renderQuizView = () => {
    if (!viewingItem) return null;

    const QUESTION_TYPE_LABELS = {
      multiple_choice: 'Multiple Choice',
      true_false: 'True/False',
      short_answer: 'Short Answer',
      fill_in_blank: 'Fill in the Blank'
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <h3 className="text-xl font-bold text-slate-900">{viewingItem.title}</h3>
          <p className="mt-2 text-slate-600">{viewingItem.description}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Time Limit</span>
            </div>
            <p className="text-lg font-semibold text-slate-900">{viewingItem.timeLimit} mins</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Award className="h-4 w-4" />
              <span className="text-sm font-medium">Total Points</span>
            </div>
            <p className="text-lg font-semibold text-slate-900">{viewingItem.totalPoints} pts</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <HelpCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Questions</span>
            </div>
            <p className="text-lg font-semibold text-slate-900">{viewingItem.questions?.length || 0}</p>
          </div>
        </div>

        {/* Settings */}
        <div className="flex flex-wrap gap-3">
          <Badge variant={viewingItem.shuffleQuestions ? 'success' : 'secondary'}>
            {viewingItem.shuffleQuestions ? 'Shuffle: ON' : 'Shuffle: OFF'}
          </Badge>
          <Badge variant={viewingItem.showCorrectAnswers ? 'success' : 'secondary'}>
            {viewingItem.showCorrectAnswers ? 'Show Answers: ON' : 'Show Answers: OFF'}
          </Badge>
        </div>

        {/* Questions */}
        {viewingItem.questions?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Questions</h4>
            <div className="space-y-4">
              {viewingItem.questions.map((question, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                        {idx + 1}
                      </span>
                      <Badge variant="secondary">{QUESTION_TYPE_LABELS[question.type]}</Badge>
                      <Badge variant="primary">{question.points} pts</Badge>
                    </div>
                  </div>
                  <p className="text-slate-900 font-medium mb-3">{question.text}</p>

                  {/* Multiple Choice / True-False Options */}
                  {(question.type === 'multiple_choice' || question.type === 'true_false') && question.options && (
                    <div className="space-y-2 pl-4">
                      {question.options.map((option, optIdx) => (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2 p-2 rounded ${
                            option.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-slate-50'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            option.isCorrect ? 'border-green-500 bg-green-500' : 'border-slate-300'
                          }`}>
                            {option.isCorrect && <span className="text-white text-xs">✓</span>}
                          </span>
                          <span className={option.isCorrect ? 'text-green-700 font-medium' : 'text-slate-600'}>
                            {option.text}
                          </span>
                          {option.isCorrect && <Badge variant="success" className="ml-auto">Correct</Badge>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Short Answer */}
                  {question.type === 'short_answer' && question.referenceAnswer && (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded">
                      <p className="text-xs font-medium text-amber-700 mb-1">Reference Answer:</p>
                      <p className="text-sm text-amber-900">{question.referenceAnswer}</p>
                    </div>
                  )}

                  {/* Fill in Blank */}
                  {question.type === 'fill_in_blank' && (
                    <div className="mt-2 space-y-2">
                      <div className="p-3 bg-slate-50 rounded">
                        <p className="text-sm text-slate-600 font-mono">{question.sentenceTemplate}</p>
                      </div>
                      {question.blanks?.map((blank, blankIdx) => (
                        <div key={blankIdx} className="p-2 bg-green-50 border border-green-100 rounded">
                          <p className="text-xs font-medium text-green-700">Blank #{blankIdx + 1} answers:</p>
                          <p className="text-sm text-green-900">{blank.correctAnswers?.join(', ')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="text-sm text-slate-500 pt-4 border-t border-slate-200">
          <p>Created by: {viewingItem.owner_name || 'Unknown'}</p>
          <p>Created: {formatDateTime(viewingItem.createdAt)}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <button
              type="button"
              onClick={() => navigate('/tutor/courses')}
              className="inline-flex items-center hover:text-slate-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Courses
            </button>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Assessment Management</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New {activeTab === 'assignments' ? 'Assignment' : 'Quiz'}
        </Button>
      </div>

      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            activeTab === 'assignments' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Assignments
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('quizzes')}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            activeTab === 'quizzes' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="h-4 w-4 inline mr-2" />
          Quizzes
        </button>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-slate-500">Loading assessments...</Card>
      ) : null}

      {error ? (
        <Card className="p-5 border border-rose-200 bg-rose-50">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-rose-700">{error}</p>
            <Button size="sm" variant="secondary" onClick={fetchAll}>
              Retry
            </Button>
          </div>
        </Card>
      ) : null}

      {!loading && currentItems.length === 0 ? (
        <Card className="p-12 text-center text-slate-500">
          No {activeTab} yet for this course.
        </Card>
      ) : null}

      {!loading && currentItems.length > 0 ? (
        <div className="grid gap-4">
          {currentItems.map((item) => {
            const itemId = item.id || item._id;
            const ownerAllowed = isOwner(item);

            return (
              <Card key={itemId} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                      <Badge variant={item.status === 'published' ? 'success' : 'secondary'}>
                        {item.status === 'published' ? 'Published' : 'Draft'}
                      </Badge>
                      <Badge variant={ownerAllowed ? 'success' : 'secondary'}>
                        {ownerAllowed ? 'Owner' : 'Read Only'}
                      </Badge>
                      {activeTab === 'quizzes' && item.questions?.length > 0 && (
                        <Badge variant="primary">
                          {item.questions.length} question{item.questions.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                      {activeTab === 'assignments' ? (
                        <>
                          <span className="inline-flex items-center">
                            <CalendarDays className="h-4 w-4 mr-1" />
                            Due: {formatDateTime(item.dueDate)}
                          </span>
                          <span className="inline-flex items-center">
                            <Award className="h-4 w-4 mr-1" />
                            {item.maxPoints ?? 100} pts
                          </span>
                          {item.rubric?.length > 0 && (
                            <span>{item.rubric.length} rubric criteria</span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="inline-flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {item.timeLimit ?? 0} mins
                          </span>
                          <span className="inline-flex items-center">
                            <Award className="h-4 w-4 mr-1" />
                            {item.totalPoints ?? 0} pts
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleToggleStatus(item)}
                      disabled={!ownerAllowed}
                      title={ownerAllowed ? 'Toggle publish status' : 'Only creator can publish'}
                    >
                      {item.status === 'published' ? 'Unpublish' : 'Publish'}
                    </Button>
                    {activeTab === 'assignments' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openSubmissionsModal(item)}
                        title="View student submissions"
                      >
                        <Users className="h-3.5 w-3.5 mr-1" />
                        Submissions
                      </Button>
                    )}
                    {activeTab === 'quizzes' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openAttemptsModal(item)}
                        title="View student quiz attempts"
                      >
                        <Users className="h-3.5 w-3.5 mr-1" />
                        Attempts
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openView(item)}
                      title="View details"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEdit(item)}
                      disabled={!ownerAllowed}
                      title={ownerAllowed ? 'Edit item' : 'Only creator can edit'}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item)}
                      disabled={!ownerAllowed}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      title={ownerAllowed ? 'Delete item' : 'Only creator can delete'}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          if (!submitting) {
            setIsCreateOpen(false);
            resetForms();
          }
        }}
        title={`Create ${activeTab === 'assignments' ? 'Assignment' : 'Quiz'}`}
        size="xl"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {renderFormFields()}

          {formError ? <p className="text-sm text-rose-600">{formError}</p> : null}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Create {activeTab === 'assignments' ? 'Assignment' : 'Quiz'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          if (!submitting) {
            setIsEditOpen(false);
            setEditingItem(null);
            resetForms();
          }
        }}
        title={`Update ${activeTab === 'assignments' ? 'Assignment' : 'Quiz'}`}
        size="xl"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          {renderFormFields()}

          {formError ? <p className="text-sm text-rose-600">{formError}</p> : null}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setViewingItem(null);
        }}
        title={`${activeTab === 'assignments' ? 'Assignment' : 'Quiz'} Details`}
        size="xl"
      >
        {activeTab === 'assignments' ? renderAssignmentView() : renderQuizView()}

        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setIsViewOpen(false);
              setViewingItem(null);
            }}
          >
            Close
          </Button>
          {isOwner(viewingItem || {}) && (
            <Button
              type="button"
              onClick={() => {
                setIsViewOpen(false);
                openEdit(viewingItem);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </Modal>

      {/* Submissions Modal */}
      <Modal
        isOpen={isSubmissionsOpen}
        onClose={() => {
          setIsSubmissionsOpen(false);
          setSubmissions([]);
          setViewingItem(null);
        }}
        title={`Submissions for "${viewingItem?.title}"`}
        size="xl"
      >
        {submissionsLoading ? (
          <div className="text-center p-8">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center p-8 text-slate-500">
            <p>No submissions yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission._id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{submission.student_name}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Submitted: {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                    {submission.submissionText && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">{submission.submissionText}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">File: {submission.fileName}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant={submission.status === 'graded' ? 'success' : 'secondary'}>
                      {submission.status === 'graded' ? `Graded: ${submission.grade}` : 'Submitted'}
                    </Badge>
                    {submission.fileUrl && (
                      <button
                        type="button"
                        onClick={() => handleSubmissionDownload(submission)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setIsSubmissionsOpen(false);
              setSubmissions([]);
              setViewingItem(null);
            }}
          >
            Close
          </Button>
        </div>
      </Modal>

      {/* Quiz Attempts Modal */}
      <Modal
        isOpen={isAttemptsOpen}
        onClose={() => {
          setIsAttemptsOpen(false);
          setAttempts([]);
          setViewingItem(null);
        }}
        title={`Quiz Attempts for "${viewingItem?.title}"`}
        size="xl"
      >
        {attemptsLoading ? (
          <div className="text-center p-8">Loading quiz attempts...</div>
        ) : attempts.length === 0 ? (
          <div className="text-center p-8 text-slate-500">
            <p>No quiz attempts yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <Card key={attempt._id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{attempt.student_name}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Submitted: {new Date(attempt.submittedAt).toLocaleString()}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="text-sm">
                        Score: <strong className="text-indigo-600">{attempt.score}</strong> / {attempt.totalPoints}
                      </span>
                      <span className="text-sm">
                        Percentage: <strong className="text-indigo-600">{Math.round(attempt.percentage)}%</strong>
                      </span>
                      <span className="text-sm text-slate-500">
                        Time spent: {Math.round(attempt.timeSpent / 60)} min
                      </span>
                    </div>
                  </div>
                  <Badge variant={attempt.percentage >= 70 ? 'success' : attempt.percentage >= 50 ? 'info' : 'error'}>
                    {attempt.percentage >= 70 ? 'Pass' : attempt.percentage >= 50 ? 'Fair' : 'Fail'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setIsAttemptsOpen(false);
              setAttempts([]);
              setViewingItem(null);
            }}
          >
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}
