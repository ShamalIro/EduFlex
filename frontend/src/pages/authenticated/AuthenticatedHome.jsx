import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Navbar } from '../../components/shared/Navbar';
import { Footer } from '../../components/shared/Footer';
import { CourseCard } from '../../components/shared/CourseCard';
import { getEnrolledCourses, getCourses } from '../../api/courses';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';

export function AuthenticatedHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const enrolled = await getEnrolledCourses();
      const all = await getCourses();
      setEnrolledCourses(enrolled);
      // Filter out enrolled courses for recommendations
      const enrolledIds = new Set(enrolled.map((c) => c.id));
      setRecommendedCourses(
        all.filter((c) => !enrolledIds.has(c.id)).slice(0, 3)
      );
    };
    fetchData();
  }, []);

  const fadeInUp = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const staggerContainer = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        {/* Personalized Hero */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative">

          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-slate-50 to-slate-50 rounded-3xl"></div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-center py-12 lg:py-16 px-4 lg:px-12 rounded-3xl">
            <div className="lg:col-span-2 space-y-6">
              <motion.div variants={fadeInUp}>
                <h1 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-4">
                  Welcome back, {user.name.split(' ')[0]}! 👋
                </h1>
                <p className="text-lg text-slate-600 max-w-xl">
                  Ready to continue your learning journey? Pick up where you
                  left off or explore new skills to advance your career.
                </p>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap gap-4 pt-2">

                <Button
                  size="lg"
                  onClick={() =>
                  document.
                  getElementById('continue-learning')?.
                  scrollIntoView({
                    behavior: 'smooth'
                  })
                  }>

                  Continue Learning
                </Button>
                <Link to="/student/courses">
                  <Button variant="secondary" size="lg">
                    Browse Courses
                  </Button>
                </Link>
              </motion.div>
            </div>

            <motion.div variants={fadeInUp} className="lg:col-span-1">
              <Card className="p-6 shadow-lg border-indigo-100 bg-white/80 backdrop-blur-sm">
                <h3 className="font-semibold text-slate-900 mb-6 flex items-center">
                  <BarChart3 className="h-5 w-5 text-indigo-600 mr-2" />
                  Your Progress
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900">
                          {enrolledCourses.length}
                        </div>
                        <div className="text-xs text-slate-500 font-medium uppercase">
                          Enrolled
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="p-2 bg-emerald-50 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900">
                          12
                        </div>
                        <div className="text-xs text-slate-500 font-medium uppercase">
                          Completed
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600 font-medium">
                        Average Score
                      </span>
                      <span className="text-indigo-600 font-bold">85%</span>
                    </div>
                    <ProgressBar value={85} size="sm" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        {/* Continue Learning Section */}
        {enrolledCourses.length > 0 &&
        <motion.section
          id="continue-learning"
          initial={{
            opacity: 0,
            y: 20
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true
          }}
          transition={{
            duration: 0.5
          }}>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Pick Up Where You Left Off
                </h2>
                <p className="text-slate-500 mt-1">
                  Jump back into your active courses
                </p>
              </div>
              <Link to="/student/my-courses">
                <Button
                variant="ghost"
                className="text-indigo-600 hover:text-indigo-700">

                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) =>
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled
              progress={45} // Mock progress
              onContinue={() => navigate(`/student/courses/${course.id}`)} />

            )}
            </div>
          </motion.section>
        }

        {/* Recommended Courses */}
        <motion.section
          initial={{
            opacity: 0,
            y: 20
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true
          }}
          transition={{
            duration: 0.5,
            delay: 0.2
          }}>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Recommended For You
              </h2>
              <p className="text-slate-500 mt-1">
                Explore new topics based on your interests
              </p>
            </div>
            <Link to="/student/courses">
              <Button
                variant="ghost"
                className="text-indigo-600 hover:text-indigo-700">

                Browse Catalog <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCourses.map((course) =>
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={() => navigate(`/student/courses/${course.id}`)} />

            )}
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>);

}
