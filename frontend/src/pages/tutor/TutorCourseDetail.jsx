import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Users,
  BookOpen,
  Clock,
  Star,
  FileText,
  HelpCircle,
  Plus,
  Trash2,
  Eye,
  Settings,
  BarChart3
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { AssignmentForm, AssignmentList } from '../../components/assignments';
import { QuizForm, QuizList } from '../../components/quiz';
import {
  MOCK_COURSES,
  getAssignmentsByCourse,
  getQuizzesByCourse,
  formatDate
} from '../../data/mockData';

/**
 * TutorCourseDetail Page
 * Detailed view of a course with assignments and quizzes management
 */
export function TutorCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modal states
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Load course data
  useEffect(() => {
    const loadCourse = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const courseData = MOCK_COURSES.find(c => c.id === id);
      if (courseData) {
        setCourse(courseData);
        setAssignments(getAssignmentsByCourse(id));
        setQuizzes(getQuizzesByCourse(id));
      }
      setIsLoading(false);
    };

    loadCourse();
  }, [id]);

  // Handlers
  const handleAddAssignment = () => {
    setEditingAssignment(null);
    setShowAssignmentModal(true);
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setShowAssignmentModal(true);
  };

  const handleDeleteAssignment = (assignment) => {
    setItemToDelete({ type: 'assignment', item: assignment });
    setShowDeleteConfirm(true);
  };

  const handleViewAssignment = (assignment) => {
    // Navigate to assignment detail/submissions view
    console.log('View assignment submissions:', assignment);
  };

  const handleAssignmentSubmit = (assignmentData) => {
    if (editingAssignment) {
      // Update existing
      setAssignments(prev => prev.map(a =>
        a.id === editingAssignment.id ? { ...assignmentData, courseId: id } : a
      ));
    } else {
      // Add new
      setAssignments(prev => [...prev, { ...assignmentData, courseId: id }]);
    }

    setTimeout(() => {
      setShowAssignmentModal(false);
      setEditingAssignment(null);
    }, 1500);
  };

  const handleAddQuiz = () => {
    setEditingQuiz(null);
    setShowQuizModal(true);
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setShowQuizModal(true);
  };

  const handleDeleteQuiz = (quiz) => {
    setItemToDelete({ type: 'quiz', item: quiz });
    setShowDeleteConfirm(true);
  };

  const handleViewQuiz = (quiz) => {
    // Navigate to quiz results view
    console.log('View quiz results:', quiz);
  };

  const handleQuizSubmit = (quizData) => {
    if (editingQuiz) {
      // Update existing
      setQuizzes(prev => prev.map(q =>
        q.id === editingQuiz.id ? { ...quizData, courseId: id } : q
      ));
    } else {
      // Add new
      setQuizzes(prev => [...prev, { ...quizData, courseId: id }]);
    }

    setTimeout(() => {
      setShowQuizModal(false);
      setEditingQuiz(null);
    }, 1500);
  };

  const confirmDelete = () => {
    if (itemToDelete.type === 'assignment') {
      setAssignments(prev => prev.filter(a => a.id !== itemToDelete.item.id));
    } else {
      setQuizzes(prev => prev.filter(q => q.id !== itemToDelete.item.id));
    }
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  // Check if we're in test mode (URL starts with /test)
  const isTestMode = window.location.pathname.startsWith('/test');
  const basePath = isTestMode ? '/test/lecturer' : '/tutor';

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-slate-500 mt-4">Loading course...</p>
      </div>
    );
  }

  // Not found state
  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Course not found</h2>
        <p className="text-slate-500 mb-4">The course you're looking for doesn't exist.</p>
        <Button onClick={() => navigate(`${basePath}/courses`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </div>
    );
  }

  // Tab content
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'assignments', label: `Assignments (${assignments.length})`, icon: FileText },
    { id: 'quizzes', label: `Quizzes (${quizzes.length})`, icon: HelpCircle }
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(`${basePath}/courses`)}
        className="mb-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Courses
      </Button>

      {/* Course Header */}
      <Card className="overflow-hidden">
        <div className="relative h-48 md:h-64 bg-slate-200">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={course.status === 'published' ? 'success' : 'default'} className="text-white bg-white/20">
                {course.status === 'published' ? 'Published' : 'Draft'}
              </Badge>
              <span className="text-white/80 text-sm">{course.category}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {course.title}
            </h1>
            <p className="text-white/80 line-clamp-2 max-w-3xl">
              {course.description}
            </p>
          </div>
        </div>

        {/* Course Stats */}
        <div className="p-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="h-5 w-5 text-indigo-500" />
              <span><strong>{course.enrolledCount}</strong> Students</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              <span><strong>{course.lessonsCount}</strong> Lessons</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <FileText className="h-5 w-5 text-indigo-500" />
              <span><strong>{assignments.length}</strong> Assignments</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <HelpCircle className="h-5 w-5 text-indigo-500" />
              <span><strong>{quizzes.length}</strong> Quizzes</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="h-5 w-5 text-indigo-500" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Star className="h-5 w-5 text-amber-400 fill-current" />
              <span><strong>{course.rating}</strong></span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Course Settings
            </Button>
            <Button variant="secondary" size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Course
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Assignments */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Recent Assignments</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('assignments')}>
                  View All
                </Button>
              </div>
              {assignments.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No assignments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.slice(0, 3).map(assignment => (
                    <div
                      key={assignment.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <FileText className="h-5 w-5 text-indigo-500" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{assignment.title}</p>
                        <p className="text-xs text-slate-500">{assignment.totalMarks} marks</p>
                      </div>
                      <Badge variant={assignment.status === 'published' ? 'success' : 'default'}>
                        {assignment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="secondary"
                className="w-full mt-4"
                onClick={handleAddAssignment}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Assignment
              </Button>
            </Card>

            {/* Recent Quizzes */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Recent Quizzes</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('quizzes')}>
                  View All
                </Button>
              </div>
              {quizzes.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No quizzes yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quizzes.slice(0, 3).map(quiz => (
                    <div
                      key={quiz.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <HelpCircle className="h-5 w-5 text-purple-500" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{quiz.title}</p>
                        <p className="text-xs text-slate-500">
                          {quiz.questions?.length || 0} questions · {quiz.timerDuration} min
                        </p>
                      </div>
                      <Badge variant={quiz.status === 'published' ? 'success' : 'default'}>
                        {quiz.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="secondary"
                className="w-full mt-4"
                onClick={handleAddQuiz}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Quiz
              </Button>
            </Card>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <AssignmentList
            assignments={assignments}
            variant="tutor"
            showAddButton={true}
            onAdd={handleAddAssignment}
            onView={handleViewAssignment}
            onEdit={handleEditAssignment}
            onDelete={handleDeleteAssignment}
            emptyMessage="No assignments in this course yet"
          />
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <QuizList
            quizzes={quizzes}
            variant="tutor"
            showAddButton={true}
            onAdd={handleAddQuiz}
            onView={handleViewQuiz}
            onEdit={handleEditQuiz}
            onDelete={handleDeleteQuiz}
            emptyMessage="No quizzes in this course yet"
          />
        )}
      </div>

      {/* Assignment Form Modal */}
      <AssignmentForm
        isModal={true}
        isOpen={showAssignmentModal}
        initialData={editingAssignment}
        onCancel={() => {
          setShowAssignmentModal(false);
          setEditingAssignment(null);
        }}
        onSubmit={handleAssignmentSubmit}
        courseTitle={course.title}
      />

      {/* Quiz Form Modal */}
      <QuizForm
        isModal={true}
        isOpen={showQuizModal}
        initialData={editingQuiz}
        onCancel={() => {
          setShowQuizModal(false);
          setEditingQuiz(null);
        }}
        onSubmit={handleQuizSubmit}
        courseTitle={course.title}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={`Delete ${itemToDelete?.type === 'assignment' ? 'Assignment' : 'Quiz'}`}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 mb-4">
            <Trash2 className="h-6 w-6 text-rose-600" />
          </div>
          <p className="text-slate-600 mb-6">
            Are you sure you want to delete <strong>{itemToDelete?.item?.title}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default TutorCourseDetail;
