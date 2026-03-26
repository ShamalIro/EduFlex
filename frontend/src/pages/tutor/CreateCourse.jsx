import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { createCourse } from '../../api/courses';

export function CreateCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Programming',
    level: 'Beginner',
    duration: '',
    price: '',
    thumbnail: '',
  });

  const categories = ['Programming', 'Design', 'Business', 'Data Science', 'Marketing'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error
    setError(null);
    
    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a course title');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a course description');
      return;
    }
    if (!formData.duration.trim()) {
      setError('Please enter course duration');
      return;
    }
    if (!formData.price) {
      setError('Please enter a price');
      return;
    }

    setLoading(true);
    try {
      await createCourse(formData);
      navigate('/tutor/courses');
    } catch (err) {
      console.error('Error creating course:', err);
      setError(err.response?.data?.message || 'Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/tutor/courses')}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create New Course</h1>
          <p className="text-slate-500">Fill in the details to create a new course</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Course Title <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Introduction to React"
              className="w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your course content, goals, and target audience..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical min-h-32"
            />
          </div>

          {/* Category & Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Level
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {levels.map(lev => (
                  <option key={lev} value={lev}>{lev}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duration <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 8 weeks, 40 hours"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Price (USD) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full"
              />
            </div>
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Thumbnail URL
            </label>
            <Input
              type="url"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full"
            />
            {formData.thumbnail && (
              <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                <img
                  src={formData.thumbnail}
                  alt="Thumbnail preview"
                  className="h-32 w-full object-cover rounded"
                  onError={(e) => {
                    e.target.src = '';
                    e.target.alt = 'Invalid image URL';
                  }}
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/tutor/courses')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> After creating the course, you'll be able to add lessons, assessments, and manage enrollment settings.
        </p>
      </Card>
    </div>
  );
}
