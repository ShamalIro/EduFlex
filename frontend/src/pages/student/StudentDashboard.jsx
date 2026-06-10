import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Award, Clock, Search, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getEnrolledCourses, getAIRecommendations } from '../../api/courses';
import { StatsCard } from '../../components/shared/StatsCard';
import { CourseCard } from '../../components/shared/CourseCard';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function StudentDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [learningGoal, setLearningGoal] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEnrolledCourses();
        setCourses(data);

        // Auto load 3 default recommendations
        if (data.length > 0) {
          setLoadingRecs(true);
          const recs = await getAIRecommendations(data, '');
          setRecommendations(recs);
          setLoadingRecs(false);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Refresh recommendations
  const handleRefresh = async () => {
    if (courses.length === 0) return;
    setLoadingRecs(true);
    try {
      const recs = await getAIRecommendations(courses, '');
      setRecommendations(recs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingRecs(false);
    }
  };

  // Search by learning goal
  const handleFindCourses = async () => {
    if (!learningGoal.trim()) return;
    setLoadingRecs(true);
    try {
      const recs = await getAIRecommendations(courses, learningGoal);
      setRecommendations(recs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleFindCourses();
  };

  const firstName = user?.first_name || user?.name?.split(' ')[0] || 'Student';

  const stats = [
    {
      label: 'Enrolled Courses',
      value: courses.length,
      icon: BookOpen,
      change: 'My courses',
      trend: 'up'
    },
    {
      label: 'Completed Lessons',
      value: 'Coming Soon',
      icon: CheckCircle,
      change: 'AssessmentService pending',
      trend: 'up'
    },
    {
      label: 'Average Score',
      value: 'Coming Soon',
      icon: Award,
      change: 'AssessmentService pending',
      trend: 'up'
    },
    {
      label: 'Hours Learned',
      value: 'Coming Soon',
      icon: Clock,
      change: 'AssessmentService pending',
      trend: 'up'
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Ready to continue learning today?
          </p>
        </div>
        <Button onClick={() => navigate('/student/courses')}>
          Browse New Courses
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <StatsCard key={index} stat={stat} icon={stat.icon} />
        ))}
      </motion.div>

      {/* Continue Learning — TOP */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Continue Learning
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/student/my-courses')}
          >
            View All
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i}
                className="h-64 bg-slate-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200
              p-12 text-center">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">
              No enrolled courses yet
            </h3>
            <p className="text-slate-500 mb-6">
              Browse our course catalog and enroll to start learning
            </p>
            <Button onClick={() => navigate('/student/courses')}>
              Browse Courses
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isEnrolled
                progress={45}
                onContinue={() => navigate(`/student/courses/${course.id}`)}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Recommended For You + Find Course — Combined */}
      <motion.div variants={item}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Recommended For You
          </h2>
          <button
            onClick={handleRefresh}
            disabled={loadingRecs}
            className="flex items-center gap-2 px-3 py-1.5 text-sm
              text-indigo-600 border border-indigo-200 rounded-lg
              hover:bg-indigo-50 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4
              ${loadingRecs ? 'animate-spin' : ''}`}
            />
            {loadingRecs ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Course Cards */}
        {loadingRecs ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i}
                className="h-64 bg-slate-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                isEnrolled={false}
                onEnroll={() => navigate(`/student/courses/${course._id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200
              p-8 text-center">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              Enroll in courses to get recommendations
            </p>
          </div>
        )}

        {/* Find Your Next Course */}
        <div className="mt-8">
          <div className="bg-white rounded-xl border border-slate-200 
              shadow-sm overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 
                px-6 py-4">
              <h3 className="text-white font-semibold text-base">
                🎯 Find Your Next Course
              </h3>
              <p className="text-indigo-200 text-sm mt-0.5">
                Describe what you want to learn — EduFlex will find matching courses
              </p>
            </div>

            {/* Search Area */}
            <div className="p-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2
                      h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={learningGoal}
                    onChange={(e) => setLearningGoal(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g. I want to learn web development with React..."
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200
                      rounded-xl text-sm focus:outline-none focus:ring-2
                      focus:ring-indigo-400 focus:border-transparent
                      bg-slate-50 placeholder-slate-400"
                  />
                </div>
                <button
                  onClick={handleFindCourses}
                  disabled={loadingRecs || !learningGoal.trim()}
                  className="px-8 py-3.5 bg-indigo-600 text-white text-sm
                    font-semibold rounded-xl hover:bg-indigo-700 
                    active:bg-indigo-800 transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center gap-2 shadow-sm"
                >
                  {loadingRecs ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white
                          border-t-transparent rounded-full animate-spin" />
                      Finding...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Find Courses
                    </>
                  )}
                </button>
              </div>

              {/* Quick Suggestions */}
              <div className="mt-4">
                <p className="text-xs text-slate-400 mb-2">
                  Popular searches:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    '🌐 Web Development',
                    '📊 Data Science',
                    '🎨 UI/UX Design',
                    '🤖 Machine Learning',
                    '📱 Mobile Development',
                    '☁️ Cloud Computing'
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        const clean = suggestion.split(' ').slice(1).join(' ');
                        setLearningGoal(clean);
                      }}
                      className="text-xs text-slate-600 bg-slate-50 border
                        border-slate-200 px-3 py-1.5 rounded-full
                        hover:bg-indigo-50 hover:text-indigo-600
                        hover:border-indigo-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity & Upcoming */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 bg-white rounded-lg
            border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Recent Activity
          </h3>
          <div className="flex flex-col items-center justify-center
              py-8 text-center">
            <CheckCircle className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No recent activity yet.</p>
            <p className="text-slate-400 text-xs mt-1">
              Start a course to track your progress
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Upcoming Quizzes
          </h3>
          <div className="flex flex-col items-center justify-center
              py-8 text-center">
            <Award className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No quizzes scheduled</p>
            <p className="text-slate-400 text-xs mt-1">
              Coming soon with AssessmentService
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}