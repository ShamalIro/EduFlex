import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  Users,
  Star,
  BookOpen,
  CheckCircle,
  Lock,
  PlayCircle,
  Award,
  Pencil,
  X,
  Check
} from 'lucide-react';
import {
  getCourseById,
  getCourseLessons,
  enrollFreeCourse,
  getEnrollmentStatus
} from '../../api/courses';
import {
  getPosts,
  createPost,
  createReply,
  getReplies,
  upvotePost,
  editPost,
  editReply
} from '../../api/discussions';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { ProgressBar } from '../../components/ui/ProgressBar';

export function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = String(user?.id || user?._id || '');
  const tabSectionRef = useRef(null);

  const [course, setCourse] = useState(undefined);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPostingQuestion, setIsPostingQuestion] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [replies, setReplies] = useState({});
  const [newReplyContent, setNewReplyContent] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState('');

  const enrolledCount = Number.isFinite(Number(course?.enrolledCount))
    ? Number(course.enrolledCount)
    : 0;

  const lessonsCount = lessons.length;

  useEffect(() => {
    if (activeTab === 'q&a' && id) {
      getPosts(id).then(setPosts).catch(console.error);
    }
  }, [activeTab, id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          setIsLoading(true);

          const courseData = await getCourseById(id);
          const lessonsData = await getCourseLessons(id);
          const enrollmentData = await getEnrollmentStatus(id);

          setCourse(courseData);
          setLessons(lessonsData || []);
          setIsEnrolled(Boolean(enrollmentData?.isEnrolled));
        }
      } catch (error) {
        console.error('Failed to load course details:', error);
        toast.error('Failed to load course details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleEnrollFree = async () => {
    try {
      setIsEnrolling(true);
      await enrollFreeCourse(course._id || course.id);
      setIsEnrolled(true);
      toast.success('Successfully enrolled!');
      navigate('/student/my-courses');
    } catch (error) {
      toast.error('Enrollment failed. Try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleEnroll = async () => {
    if (!id || isEnrolled) return;

    if (course.is_free) {
      await handleEnrollFree();
    } else {
      handlePayment();
    }
  };

  const handlePayment = () => {
    navigate(`/student/payment/${id}`, {
      state: {
        courseTitle: course.title,
        amount: course.price || 49.99,
        thumbnail: course.thumbnail
      }
    });
  };

  const handleEditPost = async (postId) => {
    if (!editPostContent.trim()) return;

    try {
      const updated = await editPost(postId, editPostContent);
      setPosts(prev => prev.map(p =>
        p._id === postId ? { ...p, content: updated.content, is_edited: true } : p
      ));
      setEditingPost(null);
      setEditPostContent('');
      toast.success('Post updated!');
    } catch {
      toast.error('Failed to update post');
    }
  };

  const handleEditReply = async (replyId, postId) => {
    if (!editReplyContent.trim()) return;

    try {
      const updated = await editReply(replyId, editReplyContent);
      setReplies(prev => ({
        ...prev,
        [postId]: prev[postId].map(r =>
          r._id === replyId
            ? { ...r, content: updated.content, is_edited: true }
            : r
        )
      }));
      setEditingReply(null);
      setEditReplyContent('');
      toast.success('Reply updated!');
    } catch {
      toast.error('Failed to update reply');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading course details...</div>;
  }

  if (!course) {
    return <div className="p-8 text-center">Course not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">

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

              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {course.title}
              </h1>

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
                  <span>{enrolledCount.toLocaleString()} students</span>
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
              <div>
                <p className="text-slate-600 mb-1">
                  Join over {enrolledCount.toLocaleString()} students and master this skill today.
                </p>

                {course.is_free ? (
                  <p className="text-2xl font-bold text-emerald-600">FREE</p>
                ) : (
                  <p className="text-2xl font-bold text-indigo-600">
                    ${course.price || '49.99'}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {isEnrolled ? (
              <>
                <Button
                  size="lg"
                  className="w-full md:w-auto"
                  onClick={() =>
                    lessons[0]?.id &&
                    navigate(`/student/courses/${id}/lessons/${lessons[0].id}`)
                  }
                >
                  Continue Learning
                </Button>

                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full md:w-auto border-purple-300 text-purple-700 hover:bg-purple-50"
                  onClick={() => {
                    setActiveTab('q&a');
                    setTimeout(() => {
                      tabSectionRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }, 100);
                  }}
                >
                  💬 Q&A
                </Button>
              </>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={isEnrolling}
                className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                  course.is_free
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isEnrolling ? 'Processing...' : (course.is_free ? '🆓 Enroll for Free' : '💰 Buy Now')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="border-b border-slate-200" ref={tabSectionRef}>
            <nav className="flex space-x-8">
              {['Overview', 'Lessons', 'Reviews', 'Q&A'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.toLowerCase()
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    About this course
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    What you'll learn
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600">
                          Master core concepts and advanced techniques
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lessons' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {lessons.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No lessons available for this course yet.
                  </div>
                ) : (
                  lessons.map((lesson, idx) => (
                    <div
                      key={lesson.id || lesson._id || idx}
                      className={`flex items-center p-4 rounded-lg border transition-colors ${
                        isEnrolled
                          ? 'bg-white border-slate-200 hover:border-indigo-300 cursor-pointer'
                          : 'bg-slate-50 border-slate-200 opacity-75'
                      }`}
                      onClick={() =>
                        isEnrolled &&
                        navigate(`/student/courses/${id}/lessons/${lesson.id}`)
                      }
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
                        <h4 className="text-sm font-medium text-slate-900">
                          {idx + 1}. {lesson.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {lesson.duration}
                        </p>
                      </div>

                      {isEnrolled && (
                        <Button variant="ghost" size="sm">
                          Start
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-12 text-slate-500">
                Reviews coming soon...
              </div>
            )}

            {activeTab === 'q&a' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {isEnrolled ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-800 mb-3">
                      Ask a Question
                    </h4>

                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="What would you like to ask about this course?"
                      rows={3}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />

                    <div className="flex justify-end mt-2">
                      <button
                        disabled={isPostingQuestion || !newPostContent.trim()}
                        onClick={async () => {
                          if (!newPostContent.trim()) return;
                          setIsPostingQuestion(true);

                          try {
                            const post = await createPost(id, newPostContent);
                            setPosts(prev => [post, ...prev]);
                            setNewPostContent('');
                            toast.success('Question posted!');
                          } catch {
                            toast.error('Failed to post question');
                          } finally {
                            setIsPostingQuestion(false);
                          }
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isPostingQuestion ? 'Posting...' : 'Post Question'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center text-amber-700 text-sm">
                    Enroll in this course to join the discussion
                  </div>
                )}

                {posts.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <p className="text-lg font-medium">No questions yet</p>
                    <p className="text-sm mt-1">
                      Be the first to ask a question!
                    </p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post._id}
                      className="bg-white border border-slate-200 rounded-xl p-5 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                            {post.author_name?.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {post.author_name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {post.author_role} · {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {post.is_announcement && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                              📢 Announcement
                            </span>
                          )}

                          {post.is_pinned && !post.is_announcement && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                              📌 Pinned
                            </span>
                          )}
                        </div>
                      </div>

                      {editingPost === post._id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editPostContent}
                            onChange={(e) => setEditPostContent(e.target.value)}
                            rows={3}
                            className="w-full border border-indigo-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />

                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setEditingPost(null);
                                setEditPostContent('');
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                            >
                              <X className="h-3 w-3" /> Cancel
                            </button>

                            <button
                              onClick={() => handleEditPost(post._id)}
                              disabled={!editPostContent.trim()}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                              <Check className="h-3 w-3" /> Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-slate-700 text-sm leading-relaxed">
                            {post.content}
                          </p>

                          {post.is_edited && (
                            <span className="text-xs text-slate-400 italic">
                              (edited)
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-1">
                        <button
                          onClick={async () => {
                            await upvotePost(post._id);
                            const updated = await getPosts(id);
                            setPosts(updated);
                          }}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition"
                        >
                          👍 {post.upvotes?.length || 0}
                        </button>

                        <button
                          onClick={() => {
                            setEditingPost(post._id);
                            setEditPostContent(post.content);
                          }}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>

                        <button
                          onClick={async () => {
                            if (expandedPost === post._id) {
                              setExpandedPost(null);
                            } else {
                              setExpandedPost(post._id);
                              const r = await getReplies(post._id);
                              setReplies(prev => ({ ...prev, [post._id]: r }));
                            }
                          }}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition"
                        >
                          💬 {post.reply_count || 0} Replies
                        </button>
                      </div>

                      {expandedPost === post._id && (
                        <div className="border-t border-slate-100 pt-3 space-y-3">
                          {(replies[post._id] || []).map((reply) => (
                            <div
                              key={reply._id}
                              className="flex gap-3 pl-4 border-l-2 border-indigo-100"
                            >
                              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs flex-shrink-0">
                                {reply.author_name?.charAt(0).toUpperCase()}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-semibold text-slate-800">
                                    {reply.author_name}
                                  </p>

                                  {reply.is_best_answer && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                      ✅ Best Answer
                                    </span>
                                  )}
                                </div>

                                {editingReply === reply._id ? (
                                  <div className="space-y-1 mt-1">
                                    <input
                                      type="text"
                                      value={editReplyContent}
                                      onChange={(e) => setEditReplyContent(e.target.value)}
                                      className="w-full border border-indigo-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"
                                    />

                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => {
                                          setEditingReply(null);
                                          setEditReplyContent('');
                                        }}
                                        className="px-2 py-1 text-xs text-slate-500 border border-slate-200 rounded hover:bg-slate-50"
                                      >
                                        Cancel
                                      </button>

                                      <button
                                        onClick={() => handleEditReply(reply._id, post._id)}
                                        className="px-2 py-1 text-xs text-white bg-indigo-600 rounded hover:bg-indigo-700"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="text-xs text-slate-600 mt-0.5">
                                      {reply.content}
                                    </p>

                                    {reply.is_edited && (
                                      <span className="text-xs text-slate-400 italic">
                                        (edited)
                                      </span>
                                    )}

                                    {String(reply.author_id) === currentUserId && (
                                      <button
                                        onClick={() => {
                                          setEditingReply(reply._id);
                                          setEditReplyContent(reply.content);
                                        }}
                                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 mt-1"
                                      >
                                        <Pencil className="h-3 w-3" /> Edit
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}

                          {isEnrolled && (
                            <div className="flex gap-2 pt-2">
                              <input
                                type="text"
                                placeholder="Write a reply..."
                                value={newReplyContent[post._id] || ''}
                                onChange={(e) => setNewReplyContent(prev => ({
                                  ...prev,
                                  [post._id]: e.target.value
                                }))}
                                className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
                              />

                              <button
                                onClick={async () => {
                                  const content = newReplyContent[post._id];
                                  if (!content?.trim()) return;

                                  try {
                                    await createReply(post._id, content);
                                    const r = await getReplies(post._id);

                                    setReplies(prev => ({
                                      ...prev,
                                      [post._id]: r
                                    }));

                                    setNewReplyContent(prev => ({
                                      ...prev,
                                      [post._id]: ''
                                    }));

                                    toast.success('Reply posted!');
                                  } catch {
                                    toast.error('Failed to post reply');
                                  }
                                }}
                                className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700"
                              >
                                Reply
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">
              Course Features
            </h3>

            <ul className="space-y-4">
              <li className="flex items-center text-sm text-slate-600">
                <BookOpen className="h-5 w-5 text-slate-400 mr-3" />
                <span>{lessonsCount} Lessons</span>
              </li>

              <li className="flex items-center text-sm text-slate-600">
                <Clock className="h-5 w-5 text-slate-400 mr-3" />
                <span>{course.duration} of content</span>
              </li>

              <li className="flex items-center text-sm text-slate-600">
                <Award className="h-5 w-5 text-slate-400 mr-3" />
                Certificate of completion
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}