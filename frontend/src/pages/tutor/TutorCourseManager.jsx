import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, ClipboardList } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getMyCourses, deleteCourse, togglePublishCourse } from '../../api/courses';

export function TutorCourseManager() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getMyCourses();
      setCourses(data);
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourse(id);
      setCourses(courses.filter(c => c._id !== id));
    } catch (err) {
      alert('Failed to delete course');
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const updated = await togglePublishCourse(id);
      setCourses(courses.map(c => c._id === id ? updated : c));
    } catch (err) {
      alert('Failed to update course');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading courses...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Course Management</h1>
          <p className="text-slate-500">Manage your courses, lessons, and assessments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No courses yet. Create your first course!
        </div>
      ) : (
        <div className="grid gap-6">
          {courses.map((course) => (
            <Card key={course._id} className="flex flex-col md:flex-row overflow-hidden">
              <div className="w-full md:w-48 h-32 md:h-auto bg-slate-200 relative">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    className="w-full h-full object-cover"
                    alt={course.title}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={course.is_published ? 'success' : 'secondary'}>
                        {course.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(course.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{course.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{course.category} • {course.level}</p>
                  </div>
                  <button
                    onClick={() => handleTogglePublish(course._id)}
                    className="text-xs px-3 py-1 rounded-full border border-slate-300 hover:bg-slate-50"
                  >
                    {course.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                </div>

                <div className="flex items-center gap-6 mt-4 text-sm text-slate-600">
                  <span>{course.students_count} Students</span>
                  <span>{course.duration}</span>
                  <span>⭐ {course.rating}</span>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="secondary" size="sm">
                    <Edit2 className="h-3.5 w-3.5 mr-2" />
                    Edit Content
                  </Button>

                  {/* Assessment Button - Entry point for AssessmentService */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/tutor/courses/${course._id}/assessments`)}
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  >
                    <ClipboardList className="h-3.5 w-3.5 mr-2" />
                    Assessment
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(course._id)}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete
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