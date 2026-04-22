import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock3, Image as ImageIcon } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { createCourse } from '../../api/courses';

export function CreateCourse() {
  const navigate = useNavigate();

  const categories = ['Programming', 'Design', 'Business', 'Data Science', 'Marketing'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const durations = [
    '1 Week',
    '2 Weeks',
    '4 Weeks',
    '6 Weeks',
    '8 Weeks',
    '3 Months',
    '6 Months',
    '1 Year',
  ];

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [imageError, setImageError] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Programming',
    level: 'Beginner',
    duration: '',
    price: '',
    thumbnail: '',
    is_free: false,
  });

  const [touched, setTouched] = useState({
    title: false,
    description: false,
    category: false,
    level: false,
    duration: false,
    price: false,
    thumbnail: false,
    is_free: false,
  });

  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Course title is required';
        if (value.trim().length < 5) return 'Title must be at least 5 characters';
        return '';

      case 'description':
        if (!value.trim()) return 'Description is required';
        if (value.trim().length < 20) return 'Description must be at least 20 characters';
        return '';

      case 'duration':
        if (!value.trim()) return 'Please select a duration';
        return '';

      case 'price':
        // Price is optional if course is free
        if (value === '') return '';
        if (isNaN(value) || Number(value) < 0) return 'Price must be a valid positive number';
        return '';

      case 'thumbnail':
        if (!value.trim()) return '';
        try {
          new URL(value);
          return '';
        } catch {
          return 'Please enter a valid image URL';
        }

      default:
        return '';
    }
  };

  const errors = useMemo(() => {
    return {
      title: validateField('title', formData.title),
      description: validateField('description', formData.description),
      duration: validateField('duration', formData.duration),
      price: validateField('price', formData.price),
      thumbnail: validateField('thumbnail', formData.thumbnail),
    };
  }, [formData]);

  const isFormValid =
    !errors.title &&
    !errors.description &&
    !errors.duration &&
    !errors.price &&
    !errors.thumbnail &&
    (formData.is_free || (formData.price && !isNaN(formData.price) && Number(formData.price) >= 0));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSubmitError('');
    if (name === 'thumbnail') setImageError(false);

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      title: true,
      description: true,
      category: true,
      level: true,
      duration: true,
      price: true,
      thumbnail: true,
      is_free: true,
    });

    setSubmitError('');

    if (!isFormValid) {
      setSubmitError('Please fix the errors before submitting.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        duration: formData.duration.trim(),
        price: formData.is_free ? 0 : Number(formData.price),
        thumbnail: formData.thumbnail.trim(),
        is_free: formData.is_free,
        currency: 'LKR',
      };

      await createCourse(payload);
      navigate('/tutor/courses');
    } catch (err) {
      console.error('Error creating course:', err);
      setSubmitError(
        err?.response?.data?.message || 'Failed to create course. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/tutor/courses')}
            className="p-2 rounded-xl bg-white shadow-sm border border-slate-200 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">Create New Course</h1>
            <p className="text-slate-500">
              Build a professional course with proper details and validation
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="p-6 bg-white shadow-sm rounded-2xl">
                <div className="flex items-center gap-2 mb-5">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Course Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Advanced React Development"
                      className={`w-full ${touched.title && errors.title ? 'border-red-500' : ''}`}
                    />
                    {touched.title && errors.title && (
                      <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Describe your course, target students, and learning outcomes..."
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[160px] resize-none ${
                        touched.description && errors.description
                          ? 'border-red-500'
                          : 'border-slate-300'
                      }`}
                    />
                    <div className="flex justify-between mt-1">
                      {touched.description && errors.description ? (
                        <p className="text-sm text-red-500">{errors.description}</p>
                      ) : (
                        <p className="text-sm text-slate-400">Minimum 20 characters</p>
                      )}
                      <p className="text-sm text-slate-400">
                        {formData.description.length} characters
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Course Details */}
              <Card className="p-6 bg-white shadow-sm rounded-2xl">
                <h2 className="text-lg font-semibold text-slate-900 mb-5">Course Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
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
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {levels.map((lev) => (
                        <option key={lev} value={lev}>
                          {lev}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Duration <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Clock3 className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          touched.duration && errors.duration
                            ? 'border-red-500'
                            : 'border-slate-300'
                        }`}
                      >
                        <option value="">Select duration</option>
                        {durations.map((duration) => (
                          <option key={duration} value={duration}>
                            {duration}
                          </option>
                        ))}
                      </select>
                    </div>
                    {touched.duration && errors.duration && (
                      <p className="text-sm text-red-500 mt-1">{errors.duration}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Price (LKR) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-sm font-medium text-slate-500">
                        USD
                      </span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="50"
                        min="0"
                        step="0.01"
                        className={`w-full pl-14 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          touched.price && errors.price ? 'border-red-500' : 'border-slate-300'
                        }`}
                      />
                    </div>
                    {touched.price && errors.price && (
                      <p className="text-sm text-red-500 mt-1">{errors.price}</p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Submit Error */}
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/tutor/courses')}
                  disabled={loading}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Course'}
                </Button>
              </div>
            </div>

            {/* Right Side */}
            <div className="space-y-6">
              {/* Thumbnail */}
              <Card className="p-6 bg-white shadow-sm rounded-2xl">
                <div className="flex items-center gap-2 mb-5">
                  <ImageIcon className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Course Thumbnail</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Thumbnail URL
                  </label>
                  <Input
                    type="url"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="https://example.com/course-image.jpg"
                    className={`w-full ${
                      touched.thumbnail && errors.thumbnail ? 'border-red-500' : ''
                    }`}
                  />
                  {touched.thumbnail && errors.thumbnail && (
                    <p className="text-sm text-red-500 mt-1">{errors.thumbnail}</p>
                  )}
                </div>

                <div className="mt-4">
                  {formData.thumbnail && !errors.thumbnail && !imageError ? (
                    <img
                      src={formData.thumbnail}
                      alt="Thumbnail Preview"
                      className="w-full h-52 object-cover rounded-xl border border-slate-200"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-52 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-sm">
                      Thumbnail preview will appear here
                    </div>
                  )}

                  {imageError && (
                    <p className="text-sm text-red-500 mt-2">Image could not be loaded.</p>
                  )}
                </div>
              </Card>

              {/* Tips */}
              <Card className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl">
                <h3 className="font-semibold text-indigo-900 mb-3">Tips for a better course</h3>
                <ul className="space-y-2 text-sm text-indigo-800 list-disc pl-5">
                  <li>Use a clear and attractive title</li>
                  <li>Write a meaningful description</li>
                  <li>Select the correct duration</li>
                  <li>Set the price in LKR</li>
                  <li>Use a professional thumbnail image</li>
                </ul>
              </Card>

              {/* Pricing Section */}
              <Card className="p-6 bg-white shadow-sm rounded-2xl">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Course Pricing
                  </label>
                  
                  {/* Toggle Buttons */}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, is_free: false }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        !formData.is_free 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      💰 Paid Course
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, is_free: true }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.is_free 
                          ? 'bg-green-600 text-white' 
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      🆓 Free Course
                    </button>
                  </div>

                  {/* Show price input only if PAID */}
                  {!formData.is_free && (
                    <div className="mt-3">
                      <label className="block text-sm text-slate-600 mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        placeholder="e.g. 29.99"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  )}

                  {/* Free badge preview */}
                  {formData.is_free && (
                    <div className="mt-3 flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <span>✅</span>
                      <span className="text-sm">
                        This course will be FREE for all students
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}