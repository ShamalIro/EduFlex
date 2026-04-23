import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Award, Clock, Sparkles } from 'lucide-react';
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEnrolledCourses();
        setCourses(data);

        // Get AI recommendations
        if (data.length > 0) {
          setLoadingRecs(true);
          const recs = await getAIRecommendations(data);
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

  // Fix name display
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

      {/* Continue Learning */}
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
              <div key={i} className="h-64 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
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

      {/* AI Recommendations Section */}
      {(recommendations.length > 0 || loadingRecs) && (
        <motion.div variants={item}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Recommended For You
            </h2>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
              ✨ AI Powered
            </span>
          </div>

          {loadingRecs ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-slate-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  isEnrolled={false}
                  onEnroll={() =>
                    navigate(`/student/courses/${course._id}`)
                  }
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Recent Activity & Upcoming */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Recent Activity
          </h3>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">
              No recent activity yet.
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Start a course to track your progress
            </p>
          </div>
        </div>

        {/* Upcoming Quizzes */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Upcoming Quizzes
          </h3>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Award className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">
              No quizzes scheduled
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Coming soon with AssessmentService
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}