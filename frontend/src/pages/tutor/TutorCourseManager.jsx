import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, ClipboardList, Eye, MessageCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { getMyCourses, createCourse, deleteCourse, togglePublishCourse } from '../../api/courses';
import { getPosts, createReply, getReplies, markBestAnswer, deletePost } from '../../api/discussions';
import { Trash2 as TrashIcon } from 'lucide-react';

export function TutorCourseManager() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');
  const [discussionModal, setDiscussionModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [coursePosts, setCoursePosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [postReplies, setPostReplies] = useState({});
  const [replyContent, setReplyContent] = useState({});
  const [courseQuestionCounts, setCourseQuestionCounts] = useState({});
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

      // Load question counts for each course
      const counts = {};
      await Promise.all(
        data.map(async (course) => {
          try {
            const posts = await getPosts(course._id);
            counts[course._id] = posts.length;
          } catch {
            counts[course._id] = 0;
          }
        })
      );
      setCourseQuestionCounts(counts);
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

  const openDiscussion = async (course) => {
    setSelectedCourse(course);
    setDiscussionModal(true);
    setLoadingPosts(true);
    try {
      const posts = await getPosts(course._id);
      setCoursePosts(posts);
    } catch {
      setCoursePosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleTutorReply = async (postId) => {
    const content = replyContent[postId];
    if (!content?.trim()) return;
    try {
      await createReply(postId, content);
      const updated = await getReplies(postId);
      setPostReplies(prev => ({ ...prev, [postId]: updated }));
      setReplyContent(prev => ({ ...prev, [postId]: '' }));
      // Update count
      const updatedPosts = await getPosts(selectedCourse._id);
      setCoursePosts(updatedPosts);
    } catch {
      alert('Failed to post reply');
    }
  };

  const handleMarkBest = async (replyId, postId) => {
    try {
      await markBestAnswer(replyId);
      const updated = await getReplies(postId);
      setPostReplies(prev => ({ ...prev, [postId]: updated }));
    } catch {
      alert('Failed to mark best answer');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await deletePost(postId);
      setCoursePosts(prev => prev.filter(p => p._id !== postId));
      // Update count
      setCourseQuestionCounts(prev => ({
        ...prev,
        [selectedCourse._id]: (prev[selectedCourse._id] || 1) - 1
      }));
    } catch {
      alert('Failed to delete post');
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
        <Button onClick={() => navigate('/tutor/create-course')}>
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

                <div className="flex items-center justify-between mt-6">
                  {/* Left side buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/tutor/courses/${course._id}/add-lesson`)}
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-2" />
                      Edit Content
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/tutor/courses/${course._id}/lessons`)}
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    >
                      <Eye className="h-3.5 w-3.5 mr-2" />
                      View
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

                  {/* Right side — Questions button styled like Create Course */}
                  <button
                    onClick={() => openDiscussion(course)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 
                      text-white text-sm font-semibold rounded-lg 
                      hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Questions ({courseQuestionCounts[course._id] || 0})
                  </button>
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

      {/* Discussion Modal */}
      {discussionModal && selectedCourse && (
        <Modal
          isOpen={discussionModal}
          onClose={() => {
            setDiscussionModal(false);
            setSelectedCourse(null);
            setCoursePosts([]);
            setExpandedPost(null);
            setPostReplies({});
          }}
          title={`💬 Questions — ${selectedCourse.title}`}
        >
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {loadingPosts ? (
              <div className="text-center py-8 text-slate-500">
                Loading questions...
              </div>
            ) : coursePosts.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No questions yet for this course</p>
              </div>
            ) : (
              coursePosts.map((post) => (
                <div key={post._id}
                  className="border border-slate-200 rounded-xl p-4 space-y-3">

                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-9 h-9 rounded-full bg-indigo-100
                          flex items-center justify-center text-indigo-700
                          font-bold text-sm flex-shrink-0">
                        {post.author_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-800">
                            {post.author_name}
                          </p>
                          <span className="text-xs text-slate-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 capitalize">
                          {post.author_role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.is_pinned && (
                        <span className="text-xs bg-amber-100 text-amber-700 
                            px-2 py-1 rounded-full font-medium">
                          📌 Pinned
                        </span>
                      )}
                      {/* Delete button for tutor */}
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="text-xs text-rose-500 hover:text-rose-700 
                          hover:bg-rose-50 px-2 py-1 rounded-lg transition"
                        title="Delete question"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Question Content */}
                  <p className="text-sm text-slate-700 leading-relaxed pl-12">
                    {post.content}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 pl-12">
                    <span className="text-xs text-slate-400">
                      👍 {post.upvotes?.length || 0}
                    </span>
                    <button
                      onClick={async () => {
                        if (expandedPost === post._id) {
                          setExpandedPost(null);
                        } else {
                          setExpandedPost(post._id);
                          const r = await getReplies(post._id);
                          setPostReplies(prev => ({
                            ...prev, [post._id]: r
                          }));
                        }
                      }}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      💬 {post.reply_count || 0} Replies
                      {expandedPost === post._id ? ' ▲' : ' ▼'}
                    </button>
                  </div>

                  {/* Replies Section */}
                  {expandedPost === post._id && (
                    <div className="pl-12 space-y-3 border-t border-slate-100 pt-3">
                      {(postReplies[post._id] || []).map((reply) => (
                        <div key={reply._id}
                          className="flex gap-2 border-l-2 border-indigo-100 pl-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-slate-700">
                                {reply.author_name}
                              </p>
                              <span className="text-xs text-slate-400 capitalize">
                                {reply.author_role}
                              </span>
                              {reply.is_best_answer && (
                                <span className="text-xs bg-green-100
                                    text-green-700 px-2 py-0.5 rounded-full">
                                  ✅ Best Answer
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {reply.content}
                            </p>
                            {!reply.is_best_answer && (
                              <button
                                onClick={() => handleMarkBest(reply._id, post._id)}
                                className="text-xs text-green-600 hover:underline mt-1"
                              >
                                Mark as Best Answer
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Tutor Reply Input */}
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Write your answer..."
                          value={replyContent[post._id] || ''}
                          onChange={(e) => setReplyContent(prev => ({
                            ...prev, [post._id]: e.target.value
                          }))}
                          className="flex-1 border border-slate-300 rounded-lg
                            px-3 py-1.5 text-xs focus:outline-none
                            focus:ring-2 focus:ring-indigo-300"
                        />
                        <button
                          onClick={() => handleTutorReply(post._id)}
                          className="px-3 py-1.5 bg-indigo-600 text-white
                            text-xs rounded-lg hover:bg-indigo-700"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}