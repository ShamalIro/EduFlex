import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Users,
  Star,
  BookOpen,
  CheckCircle,
  Lock,
  PlayCircle,
  Award,
  FileText,
  HelpCircle,
  Upload,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { getCourseById, getCourseLessons } from '../../api/courses';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { FileUpload } from '../../components/ui/FileUpload';
import { Textarea } from '../../components/ui/Textarea';
import { CountdownTimer } from '../../components/ui/CountdownTimer';
import {
  getAssignmentsByCourse,
  getQuizzesByCourse,
  getTimeRemaining,
  formatDate,
  MOCK_QUIZ_RESULTS
} from '../../data/mockData';

/**
 * StudentCourseDetail Page
 * Enhanced course detail page for students with assignments and quizzes
 */
export function StudentCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [course, setCourse] = useState(undefined);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEnrolled, setIsEnrolled] = useState(true); // Mock as enrolled

  // Assignment submission modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Assignment detail modal
  const [showAssignmentDetail, setShowAssignmentDetail] = useState(false);
  const [detailAssignment, setDetailAssignment] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const courseData = await getCourseById(id);
        const lessonsData = await getCourseLessons(id);
        setCourse(courseData);
        setLessons(lessonsData);

        // Get assignments and quizzes (only published ones for students)
        const courseAssignments = getAssignmentsByCourse(id).filter(a => a.status === 'published');
        const courseQuizzes = getQuizzesByCourse(id).filter(q => q.status === 'published');
        setAssignments(courseAssignments);
        setQuizzes(courseQuizzes);

        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Handlers
  // Check if we're in test mode (URL starts with /test)
  const isTestMode = window.location.pathname.startsWith('/test');
  const basePath = isTestMode ? '/test/student' : '/student';

  const handleViewAssignment = (assignment) => {
    setDetailAssignment(assignment);
    setShowAssignmentDetail(true);
  };

  const handleSubmitAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionFile(null);
    setSubmissionNotes('');
    setSubmissionSuccess(false);
    setShowSubmitModal(true);
  };

  const handleSubmissionSubmit = async () => {
    if (!submissionFile) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmissionSuccess(true);
  };

  const handleStartQuiz = (quiz) => {
    navigate(`${basePath}/quiz/${quiz.id}?courseId=${id}`);
  };

  const handleViewQuizResults = (quiz) => {
    navigate(`${basePath}/results?quizId=${quiz.id}`);
  };

  // Get quiz result if exists
  const getQuizResult = (quizId) => {
    return MOCK_QUIZ_RESULTS.find(r => r.quizId === quizId && r.studentId === 'student-1');
  };

  if (isLoading)
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-slate-500 mt-4">Loading course...</p>
      </div>
    );

  if (!course)
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Course not found</h2>
        <Button onClick={() => navigate('/student/courses')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </div>
    );

  // Tabs
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'lessons', label: 'Lessons' },
    { id: 'assignments', label: `Assignments (${assignments.length})` },
    { id: 'quizzes', label: `Quizzes (${quizzes.length})` }
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="relative h-64 md:h-80">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
            <div className="p-8 text-white w-full">
              <Badge variant="info" className="mb-4 bg-indigo-500 text-white border-none">
                {course.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
                <div className="flex items-center">
                  <Avatar name={course.tutor} size="sm" className="mr-2 border-2 border-white" />
                  <span>{course.tutor}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-amber-400 mr-1 fill-current" />
                  <span>{course.rating} (420 reviews)</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 opacity-80" />
                  <span>{course.enrolledCount.toLocaleString()} students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 opacity-80" />
                  <span>{course.duration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="flex-1 w-full">
            {isEnrolled ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-700">Your Progress</span>
                  <span className="text-indigo-600">35%</span>
                </div>
                <ProgressBar value={35} />
              </div>
            ) : (
              <p className="text-slate-600">
                Join over {course.enrolledCount} students and master this skill today.
              </p>
            )}
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            {isEnrolled ? (
              <Button size="lg" className="w-full md:w-auto" onClick={() => navigate(`/student/lessons/${lessons[0]?.id}`)}>
                Continue Learning
              </Button>
            ) : (
              <Button size="lg" className="w-full md:w-auto" onClick={() => setIsEnrolled(true)}>
                Enroll Now
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="min-h-[400px]">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">About this course</h3>
                  <p className="text-slate-600 leading-relaxed">{course.description}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">What you'll learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600">Master core concepts and advanced techniques</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Lessons Tab */}
            {activeTab === 'lessons' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {lessons.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    className={`
                      flex items-center p-4 rounded-lg border transition-colors
                      ${isEnrolled
                        ? 'bg-white border-slate-200 hover:border-indigo-300 cursor-pointer'
                        : 'bg-slate-50 border-slate-200 opacity-75'
                      }
                    `}
                    onClick={() => isEnrolled && navigate(`/student/lessons/${lesson.id}`)}
                  >
                    <div className="flex-shrink-0 mr-4">
                      {lesson.completed ? (
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      ) : isEnrolled ? (
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <PlayCircle className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                          <Lock className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-900">{idx + 1}. {lesson.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{lesson.duration}</p>
                    </div>
                    {isEnrolled && <Button variant="ghost" size="sm">Start</Button>}
                  </div>
                ))}
              </div>
            )}

            {/* Assignments Tab */}
            {activeTab === 'assignments' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {assignments.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-1">No assignments yet</h3>
                    <p className="text-slate-500">Assignments will appear here once posted by your instructor.</p>
                  </div>
                ) : (
                  assignments.map(assignment => {
                    const timeRemaining = getTimeRemaining(assignment.dueDate);
                    return (
                      <Card key={assignment.id} className="p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className={`
                            flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center
                            ${timeRemaining.expired ? 'bg-rose-100' : 'bg-indigo-100'}
                          `}>
                            <FileText className={`h-6 w-6 ${
                              timeRemaining.expired ? 'text-rose-500' : 'text-indigo-600'
                            }`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {timeRemaining.expired ? (
                                <Badge variant="error">Past Due</Badge>
                              ) : timeRemaining.urgent ? (
                                <Badge variant="warning">Due Soon</Badge>
                              ) : (
                                <Badge variant="success">Active</Badge>
                              )}
                              <span className="text-xs text-slate-500">{assignment.totalMarks} marks</span>
                            </div>

                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                              {assignment.title}
                            </h3>

                            <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                              {assignment.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span>Due: {formatDate(assignment.dueDate)}</span>
                              </div>
                            </div>

                            {/* Countdown Timer */}
                            {!timeRemaining.expired && (
                              <div className="mb-4">
                                <CountdownTimer
                                  targetDate={assignment.dueDate}
                                  size="sm"
                                  variant="compact"
                                />
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button variant="secondary" size="sm" onClick={() => handleViewAssignment(assignment)}>
                                View Details
                              </Button>
                              {!timeRemaining.expired && (
                                <Button size="sm" onClick={() => handleSubmitAssignment(assignment)}>
                                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                                  Submit
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            )}

            {/* Quizzes Tab */}
            {activeTab === 'quizzes' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {quizzes.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <HelpCircle className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-1">No quizzes yet</h3>
                    <p className="text-slate-500">Quizzes will appear here once posted by your instructor.</p>
                  </div>
                ) : (
                  quizzes.map(quiz => {
                    const result = getQuizResult(quiz.id);
                    return (
                      <Card key={quiz.id} className="p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                            <HelpCircle className="h-6 w-6 text-purple-600" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="success">Available</Badge>
                              <span className="text-xs text-slate-500">
                                {quiz.totalPoints || quiz.questions?.reduce((sum, q) => sum + q.points, 0)} points
                              </span>
                            </div>

                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                              {quiz.title}
                            </h3>

                            {quiz.description && (
                              <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                                {quiz.description}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>{quiz.timerDuration} minutes</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <HelpCircle className="h-4 w-4" />
                                <span>{quiz.questions?.length || 0} questions</span>
                              </div>
                            </div>

                            {/* Previous Result */}
                            {result && (
                              <div className={`
                                flex items-center gap-3 p-3 rounded-lg mb-4
                                ${result.percentage >= 70 ? 'bg-emerald-50' : 'bg-amber-50'}
                              `}>
                                <CheckCircle className={`h-5 w-5 ${
                                  result.percentage >= 70 ? 'text-emerald-600' : 'text-amber-600'
                                }`} />
                                <div>
                                  <p className="text-sm font-medium text-slate-900">
                                    Previous Score: {result.score}/{result.totalPoints} ({result.percentage}%)
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Completed {formatDate(result.completedAt)}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleStartQuiz(quiz)}>
                                <PlayCircle className="h-3.5 w-3.5 mr-1.5" />
                                {result ? 'Retake Quiz' : 'Start Quiz'}
                              </Button>
                              {result && (
                                <Button variant="secondary" size="sm" onClick={() => handleViewQuizResults(quiz)}>
                                  View Results
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Course Features</h3>
            <ul className="space-y-4">
              <li className="flex items-center text-sm text-slate-600">
                <BookOpen className="h-5 w-5 text-slate-400 mr-3" />
                {course.lessonsCount} Lessons
              </li>
              <li className="flex items-center text-sm text-slate-600">
                <FileText className="h-5 w-5 text-slate-400 mr-3" />
                {assignments.length} Assignments
              </li>
              <li className="flex items-center text-sm text-slate-600">
                <HelpCircle className="h-5 w-5 text-slate-400 mr-3" />
                {quizzes.length} Quizzes
              </li>
              <li className="flex items-center text-sm text-slate-600">
                <Clock className="h-5 w-5 text-slate-400 mr-3" />
                {course.duration} of content
              </li>
              <li className="flex items-center text-sm text-slate-600">
                <Award className="h-5 w-5 text-slate-400 mr-3" />
                Certificate of completion
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Assignment Detail Modal */}
      <Modal
        isOpen={showAssignmentDetail}
        onClose={() => setShowAssignmentDetail(false)}
        title="Assignment Details"
      >
        {detailAssignment && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-slate-900 mb-2">
                {detailAssignment.title}
              </h3>
              <div className="flex items-center gap-3">
                <Badge variant="info">{detailAssignment.totalMarks} marks</Badge>
                <span className="text-sm text-slate-500">Due: {formatDate(detailAssignment.dueDate)}</span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-1">Description</h4>
              <p className="text-slate-600 text-sm">{detailAssignment.description}</p>
            </div>

            {detailAssignment.instructions && (
              <div>
                <h4 className="font-medium text-slate-900 mb-1">Instructions</h4>
                <p className="text-slate-600 text-sm whitespace-pre-wrap">{detailAssignment.instructions}</p>
              </div>
            )}

            {detailAssignment.instructionFile && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Attached File:</p>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  <span className="text-sm font-medium text-slate-900">
                    {detailAssignment.instructionFile.name}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowAssignmentDetail(false)}>
                Close
              </Button>
              {!getTimeRemaining(detailAssignment.dueDate).expired && (
                <Button onClick={() => {
                  setShowAssignmentDetail(false);
                  handleSubmitAssignment(detailAssignment);
                }}>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Assignment
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Submit Assignment Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => !isSubmitting && setShowSubmitModal(false)}
        title="Submit Assignment"
      >
        {submissionSuccess ? (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Submitted Successfully!</h3>
            <p className="text-slate-600 mb-4">Your assignment has been submitted for review.</p>
            <Button onClick={() => setShowSubmitModal(false)}>Close</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedAssignment && (
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Submitting for</p>
                <p className="text-sm font-medium text-slate-900">{selectedAssignment.title}</p>
              </div>
            )}

            <FileUpload
              label="Upload Your Work"
              onFileSelect={setSubmissionFile}
              value={submissionFile}
              acceptedTypes={['application/pdf', 'application/zip', 'application/x-zip-compressed']}
              maxSize={50 * 1024 * 1024}
              hint="PDF or ZIP file (max 50MB)"
            />

            <Textarea
              label="Notes (Optional)"
              placeholder="Add any notes for your instructor..."
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              rows={3}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowSubmitModal(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmissionSubmit} isLoading={isSubmitting} disabled={!submissionFile}>
                <Upload className="h-4 w-4 mr-2" />
                Submit Assignment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default StudentCourseDetail;
