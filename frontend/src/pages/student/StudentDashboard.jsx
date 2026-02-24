import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Award, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getEnrolledCourses } from '../../api/courses';
import { StatsCard } from '../../components/shared/StatsCard';
import { CourseCard } from '../../components/shared/CourseCard';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function StudentDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEnrolledCourses();
        setCourses(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    {
      label: 'Enrolled Courses',
      value: courses.length,
      icon: BookOpen,
      change: '+2',
      trend: 'up'
    },
    {
      label: 'Completed Lessons',
      value: 12,
      icon: CheckCircle,
      change: '+5',
      trend: 'up'
    },
    {
      label: 'Average Score',
      value: '85%',
      icon: Award,
      change: '+2%',
      trend: 'up'
    },
    {
      label: 'Hours Learned',
      value: 24,
      icon: Clock,
      change: '1.5h',
      trend: 'up'
    }
  ];

  const container = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: {
      opacity: 0,
      y: 20
    },
    show: {
      opacity: 1,
      y: 0
    }
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
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            You've made great progress this week. Keep it up!
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
              <div
                key={i}
                className="h-64 bg-slate-100 rounded-lg animate-pulse"
              />
            ))}
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

      {/* Recent Activity & Upcoming */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-6">
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Completed lesson "React Hooks In-Depth"
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Introduction to React • 2 hours ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Upcoming Quizzes
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Due Tomorrow
                </span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <h4 className="font-medium text-slate-900">
                React Fundamentals Quiz
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Introduction to React
              </p>
              <Button size="sm" variant="secondary" className="w-full mt-3">
                Start Quiz
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
