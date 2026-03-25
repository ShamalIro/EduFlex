import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, ClipboardList } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { getMyCourses, createCourse, deleteCourse, togglePublishCourse } from '../../api/courses';

export function TutorCourseManager() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'Programming',
    level: 'Beginner',
    duration: '',
    price: '0',
    thumbnail: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyCourses();
      setCourses(data);
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFieldChange = (field, value) => {
    setNewCourse((prev) => ({ ...prev, [field]: value }));
  };

  const resetCreateForm = () => {
    setNewCourse({
      title: '',
      description: '',
      category: 'Programming',
      level: 'Beginner',
      duration: '',
      price: '0',
      thumbnail: ''
    });
    setCreateError('');
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();

    if (!newCourse.title.trim() || !newCourse.description.trim() || !newCourse.duration.trim()) {
      setCreateError('Title, description, and duration are required.');
      return;
    }

    const parsedPrice = Number(newCourse.price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setCreateError('Price must be a valid positive number.');
      return;
    }

    try {
      setSubmitting(true);
      setCreateError('');

      const payload = {
        title: newCourse.title.trim(),
        description: newCourse.description.trim(),
        category: newCourse.category,
        level: newCourse.level,
        duration: newCourse.duration.trim(),
        price: parsedPrice,
        thumbnail: newCourse.thumbnail.trim() || null
      };

      const created = await createCourse(payload);
      setCourses((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      resetCreateForm();
    } catch (err) {
      setCreateError(err?.response?.data?.message || 'Failed to create course. Please try again.');
    } finally {
      setSubmitting(false);
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
        <Button onClick={() => setIsCreateModalOpen(true)}>
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

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          if (!submitting) {
            setIsCreateModalOpen(false);
            resetCreateForm();
          }
        }}
        title="Create New Course"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <Input
            label="Title"
            value={newCourse.title}
            onChange={(e) => handleCreateFieldChange('title', e.target.value)}
            placeholder="e.g. React for Beginners"
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={newCourse.description}
              onChange={(e) => handleCreateFieldChange('description', e.target.value)}
              placeholder="Write a short course description"
              className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={newCourse.category}
                onChange={(e) => handleCreateFieldChange('category', e.target.value)}
                className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
              >
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
                <option value="Data Science">Data Science</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
              <select
                value={newCourse.level}
                onChange={(e) => handleCreateFieldChange('level', e.target.value)}
                className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Duration"
              value={newCourse.duration}
              onChange={(e) => handleCreateFieldChange('duration', e.target.value)}
              placeholder="e.g. 8 weeks"
              required
            />
            <Input
              label="Price"
              type="number"
              min="0"
              step="0.01"
              value={newCourse.price}
              onChange={(e) => handleCreateFieldChange('price', e.target.value)}
            />
          </div>

          <Input
            label="Thumbnail URL (optional)"
            value={newCourse.thumbnail}
            onChange={(e) => handleCreateFieldChange('thumbnail', e.target.value)}
            placeholder="https://example.com/image.jpg"
          />

          {createError ? (
            <p className="text-sm text-rose-600">{createError}</p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetCreateForm();
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Create Course
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}