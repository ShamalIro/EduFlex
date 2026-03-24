import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  Calendar,
  Award
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { MOCK_COURSES, MOCK_ASSIGNMENTS, getTimeRemaining, formatDate } from '../../data/mockData';
import { getEnrollments, isAssignmentSubmitted } from '../../services/localStorageService';

export function StudentAssignments() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseIdFromQuery = searchParams.get('course');

  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(courseIdFromQuery || 'all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get enrolled courses
    const enrollments = getEnrollments();
    const enrolledCourseIds = enrollments.map(e => e.courseId);

    // Filter assignments for enrolled courses only
    const enrolledAssignments = MOCK_ASSIGNMENTS
      .filter(a => enrolledCourseIds.includes(a.courseId))
      .map(assignment => {
        const course = MOCK_COURSES.find(c => c.id === assignment.courseId);
        const submitted = isAssignmentSubmitted(assignment.id);
        const timeRemaining = getTimeRemaining(assignment.dueDate);

        return {
          ...assignment,
          courseName: course?.title || 'Unknown Course',
          submitted,
          timeRemaining
        };
      });

    setAssignments(enrolledAssignments);
    setFilteredAssignments(enrolledAssignments);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let result = assignments;

    // Filter by course
    if (selectedCourse !== 'all') {
      result = result.filter(a => a.courseId === selectedCourse);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'submitted') {
        result = result.filter(a => a.submitted);
      } else if (selectedStatus === 'pending') {
        result = result.filter(a => !a.submitted && !a.timeRemaining.expired);
      } else if (selectedStatus === 'overdue') {
        result = result.filter(a => !a.submitted && a.timeRemaining.expired);
      }
    }

    // Filter by search query
    if (searchQuery) {
      result = result.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAssignments(result);
  }, [selectedCourse, selectedStatus, searchQuery, assignments]);

  const getEnrolledCourses = () => {
    const enrollments = getEnrollments();
    return enrollments.map(e => {
      const course = MOCK_COURSES.find(c => c.id === e.courseId);
      return course;
    }).filter(Boolean);
  };

  const getStatusBadge = (assignment) => {
    if (assignment.submitted) {
      return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" /> Submitted</Badge>;
    }
    if (assignment.timeRemaining.expired) {
      return <Badge variant="error"><AlertCircle className="h-3 w-3 mr-1" /> Overdue</Badge>;
    }
    if (assignment.timeRemaining.urgent) {
      return <Badge variant="warning"><Clock className="h-3 w-3 mr-1" /> Due Soon</Badge>;
    }
    return <Badge variant="info"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">My Assignments</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Assignments</h1>
        <p className="text-slate-500 mt-1">
          View and submit assignments from your enrolled courses
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <Input
            placeholder="Search assignments..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Course Filter */}
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">All Courses</option>
          {getEnrolledCourses().map(course => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Assignment List */}
      {filteredAssignments.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            No assignments found
          </h3>
          <p className="text-slate-500 mb-6">
            {assignments.length === 0
              ? "You don't have any assignments yet. Enroll in courses to get started!"
              : "No assignments match your current filters."}
          </p>
          {assignments.length === 0 ? (
            <Button onClick={() => navigate('/student/courses')}>
              Browse Courses
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedCourse('all');
                setSelectedStatus('all');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAssignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/student/courses/${assignment.courseId}`)}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {assignment.title}
                        </h3>
                        {getStatusBadge(assignment)}
                      </div>
                      <p className="text-sm text-slate-500 mb-2">
                        {assignment.courseName}
                      </p>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {assignment.description}
                      </p>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Due: {formatDate(assignment.dueDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-1" />
                      <span>{assignment.totalMarks} marks</span>
                    </div>
                    {!assignment.submitted && !assignment.timeRemaining.expired && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{assignment.timeRemaining.text}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-col gap-2 md:items-end">
                  {assignment.submitted ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to submission details
                      }}
                    >
                      View Submission
                    </Button>
                  ) : assignment.timeRemaining.expired ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                      className="text-red-600"
                    >
                      Past Due
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to submission page
                      }}
                    >
                      Submit Assignment
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {assignments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{assignments.length}</div>
            <div className="text-sm text-slate-500">Total Assignments</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {assignments.filter(a => a.submitted).length}
            </div>
            <div className="text-sm text-slate-500">Submitted</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">
              {assignments.filter(a => !a.submitted && !a.timeRemaining.expired).length}
            </div>
            <div className="text-sm text-slate-500">Pending</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {assignments.filter(a => !a.submitted && a.timeRemaining.expired).length}
            </div>
            <div className="text-sm text-slate-500">Overdue</div>
          </Card>
        </div>
      )}
    </div>
  );
}
