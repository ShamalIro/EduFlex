import React, { useEffect, useState } from 'react';
import { BookOpen, Clock, ArrowRight, ClipboardList } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { MOCK_COURSES } from '../../data/mockData';
import { getEnrollments } from '../../services/localStorageService';

export function MyCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get enrollments from localStorage
    const enrollments = getEnrollments();

    // Map enrollments to full course data
    const courses = enrollments.map(enrollment => {
      const course = MOCK_COURSES.find(c => c.id === enrollment.courseId);
      return course ? {
        ...course,
        progress: enrollment.progress,
        enrolledAt: enrollment.enrolledAt
      } : null;
    }).filter(Boolean); // Remove null values

    setEnrolledCourses(courses);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
        <p className="text-slate-500 mt-1">Courses you have enrolled in</p>
      </div>

      {enrolledCourses.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            No courses enrolled yet
          </h3>
          <p className="text-slate-500 mb-6">
            Browse our course catalog and enroll in courses to start learning!
          </p>
          <Button onClick={() => navigate('/student/courses')}>
            Browse Courses
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-slate-900">{course.title}</h3>
                <div className="flex items-center text-sm text-slate-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.duration}
                </div>
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{course.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${course.progress || 0}%` }}
                    />
                  </div>
                </div>
                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/student/courses/${course.id}`)}>
                    Continue <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/student/assignments?course=${course.id}`)}>
                    <ClipboardList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}