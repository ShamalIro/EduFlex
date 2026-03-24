import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Star, MessageSquare } from 'lucide-react';
import { StatsCard } from '../../components/shared/StatsCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getMyCourses } from '../../api/courses';

export function TutorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getMyCourses();
        setCourses(data);
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const publishedCourses = courses.filter(c => c.is_published).length;
  const totalStudents = courses.reduce((sum, c) => sum + (c.students_count || 0), 0);
  const avgRating = courses.length > 0
    ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length).toFixed(1)
    : 0;

  const stats = [
    { label: 'Total Students', value: totalStudents, icon: Users },
    { label: 'Active Courses', value: publishedCourses, icon: BookOpen },
    { label: 'Average Rating', value: avgRating, icon: Star },
    { label: 'Unread Questions', value: 0, icon: MessageSquare }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Tutor Dashboard</h1>
        <Button onClick={() => window.location.href = '/tutor/courses'}>
          Create New Course
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} stat={stat} icon={stat.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-4">My Courses</h3>
          {loading ? (
            <div className="text-center py-4 text-slate-500">Loading...</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-4 text-slate-500">No courses yet</div>
          ) : (
            <div className="space-y-4">
              {courses.slice(0, 3).map((course) => (
                <div
                  key={course._id}
                  className="flex items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="h-12 w-12 bg-slate-200 rounded-md mr-4" />
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{course.title}</h4>
                    <p className="text-xs text-slate-500">
                      {course.duration} • {course.students_count} students
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-slate-900">{course.rating || 'N/A'}</span>
                    <span className="text-xs text-slate-500">rating</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full mt-4 text-sm"
            onClick={() => window.location.href = '/tutor/courses'}
          >
            View All Courses
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-4">Recent Student Activity</h3>
          <div className="text-center py-4 text-slate-500 text-sm">
            Activity feed coming soon
          </div>
        </Card>
      </div>
    </div>
  );
}