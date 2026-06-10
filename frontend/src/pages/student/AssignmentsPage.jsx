import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarClock, ClipboardList, BookOpen } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { getMyAssignments, submitAssignment } from '../../api/assessments';

export function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submitFile, setSubmitFile] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  const courseId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('course') || undefined;
  }, [location.search]);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setError('');
        const data = await getMyAssignments(courseId);
        setAssignments(data);
      } catch (error) {
        console.error(error);
        setError(
          error?.response?.data?.message ||
            'Failed to load assignments. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadAssignments();
  }, [courseId]);

  const openSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmitFile(null);
    setSubmissionText(assignment?.mySubmission?.submissionText || '');
    setSubmitError('');
    setSubmitSuccess('');
    setIsSubmitOpen(true);
  };

  const closeSubmitModal = () => {
    if (isSubmitting) return;
    setIsSubmitOpen(false);
    setSelectedAssignment(null);
    setSubmitFile(null);
    setSubmissionText('');
    setSubmitError('');
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    if (!submitFile) {
      setSubmitError('Please choose a file to submit.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');
      const result = await submitAssignment(selectedAssignment._id || selectedAssignment.id, {
        file: submitFile,
        submissionText
      });

      const submission = result?.submission;

      setAssignments((prev) =>
        prev.map((assignment) => {
          const id = assignment._id || assignment.id;
          const selectedId = selectedAssignment._id || selectedAssignment.id;
          if (String(id) !== String(selectedId)) return assignment;
          return {
            ...assignment,
            isSubmitted: true,
            mySubmission: submission
          };
        })
      );

      setSubmitSuccess(
        result?.notification?.message ||
          'Assignment submitted successfully. A confirmation email will be sent if your account email is available.'
      );

      closeSubmitModal();
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message || 'Failed to submit assignment. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading assignments...</div>;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
          <p className="text-slate-500 mt-1">
            Assignments from your enrolled courses
          </p>
        </div>
        <Card className="p-10 text-center">
          <ClipboardList className="h-12 w-12 text-rose-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Could not load assignments
          </h2>
          <p className="text-slate-500 mb-5">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
        <p className="text-slate-500 mt-1">
          Assignments from your enrolled courses
        </p>
      </div>

      {submitSuccess ? (
        <Card className="p-4 border border-emerald-200 bg-emerald-50">
          <p className="text-sm text-emerald-800">{submitSuccess}</p>
        </Card>
      ) : null}

      {assignments.length === 0 ? (
        <Card className="p-10 text-center">
          <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            No assignments available
          </h2>
          <p className="text-slate-500 mb-5">
            Enroll in a course and wait for tutors to publish assignments.
          </p>
          <Link to="/student/courses">
            <Button>Browse Courses</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((assignment) => {
            const dueDate = assignment?.dueDate
              ? new Date(assignment.dueDate)
              : null;
            const isOverdue = dueDate ? dueDate.getTime() < Date.now() : false;

            return (
              <Card key={assignment._id || assignment.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {assignment.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Course ID: {assignment.course_id}
                    </p>
                  </div>
                  <Badge variant={isOverdue ? 'error' : 'info'}>
                    {isOverdue ? 'Overdue' : 'Open'}
                  </Badge>
                </div>

                <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                  {assignment.description}
                </p>

                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    <span>
                      {dueDate ? dueDate.toLocaleDateString() : 'No due date'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{assignment.maxPoints || 0} pts</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {assignment.isSubmitted ? (
                      <span>
                        Submitted on{' '}
                        {assignment.mySubmission?.submittedAt
                          ? new Date(assignment.mySubmission.submittedAt).toLocaleString()
                          : 'N/A'}
                      </span>
                    ) : (
                      <span>Not submitted yet</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => openSubmitModal(assignment)}
                  >
                    {assignment.isSubmitted ? 'Resubmit' : 'Submit'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isSubmitOpen}
        onClose={closeSubmitModal}
        title={selectedAssignment?.isSubmitted ? 'Resubmit Assignment' : 'Submit Assignment'}
        size="md"
      >
        <form onSubmit={handleSubmitAssignment} className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-800">
              {selectedAssignment?.title || 'Assignment'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Upload your file. You can resubmit later before the due date.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              File
            </label>
            <input
              type="file"
              onChange={(e) => setSubmitFile(e.target.files?.[0] || null)}
              className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              rows={3}
              placeholder="Add a note for your tutor"
              className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
            />
          </div>

          {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={closeSubmitModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {selectedAssignment?.isSubmitted ? 'Resubmit' : 'Submit'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
