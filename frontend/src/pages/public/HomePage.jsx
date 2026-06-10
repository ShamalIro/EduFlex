import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, UserPlus, ArrowRight, Star, Users, Play } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { CourseCard } from '../../components/shared/CourseCard';
import { Avatar } from '../../components/ui/Avatar';
import { Navbar } from '../../components/shared/Navbar';
import { Footer } from '../../components/shared/Footer';
import { getCourses } from '../../api/courses';

export function HomePage() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      const data = await getCourses();
      setCourses(data.slice(0, 3)); // Show top 3 courses
    };
    fetchCourses();
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  const fadeInUp = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
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
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/50 via-slate-50 to-slate-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-2xl">

              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mb-6 border border-indigo-100">
                  <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2"></span>
                  New courses added weekly
                </span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">

                Master New Skills, <br />
                <span className="text-indigo-600">Advance Your Career</span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">

                Join thousands of learners on EduFlex. Access world-class
                courses from industry experts and take your professional journey
                to the next level.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 mb-10">

                <Link to="/register">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto px-8 h-14 text-base shadow-lg shadow-indigo-200">

                    Start Learning Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto px-8 h-14 text-base">

                    Browse Courses
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex items-center gap-6 text-sm font-medium text-slate-500">

                <div className="flex items-center">
                  <Users className="h-5 w-5 text-indigo-500 mr-2" />
                  12k+ Students
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-indigo-500 mr-2" />
                  150+ Courses
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-amber-400 mr-2 fill-current" />
                  4.8 Rating
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: 50
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              transition={{
                duration: 0.8,
                delay: 0.2
              }}
              className="relative hidden lg:block">

              <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="space-y-4 mt-12">
                  <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 transform hover:-translate-y-1 transition-transform duration-300">
                    <div className="h-32 bg-indigo-100 rounded-xl mb-3 overflow-hidden relative">
                      <img
                        src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                        alt="React"
                        className="w-full h-full object-cover" />

                    </div>
                    <div className="h-4 w-2/3 bg-slate-100 rounded mb-2"></div>
                    <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 transform hover:-translate-y-1 transition-transform duration-300">
                    <div className="h-32 bg-emerald-100 rounded-xl mb-3 overflow-hidden relative">
                      <img
                        src="https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                        alt="Python"
                        className="w-full h-full object-cover" />

                    </div>
                    <div className="h-4 w-3/4 bg-slate-100 rounded mb-2"></div>
                    <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 transform hover:-translate-y-1 transition-transform duration-300">
                    <div className="h-32 bg-amber-100 rounded-xl mb-3 overflow-hidden relative">
                      <img
                        src="data:image/png;base64,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"
                        alt="Design"
                        className="w-full h-full object-cover" />

                    </div>
                    <div className="h-4 w-2/3 bg-slate-100 rounded mb-2"></div>
                    <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 transform hover:-translate-y-1 transition-transform duration-300">
                    <div className="h-32 bg-rose-100 rounded-xl mb-3 overflow-hidden relative">
                      <img
                        src="https://images.unsplash.com/photo-1533750516457-a7f992034fec?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                        alt="Marketing"
                        className="w-full h-full object-cover" />

                    </div>
                    <div className="h-4 w-3/4 bg-slate-100 rounded mb-2"></div>
                    <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/5 blur-3xl rounded-full -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
            {
              label: 'Active Students',
              value: '12,000+'
            },
            {
              label: 'Total Courses',
              value: '150+'
            },
            {
              label: 'Expert Instructors',
              value: '50+'
            },
            {
              label: 'Satisfaction Rate',
              value: '95%'
            }].
            map((stat, idx) =>
            <motion.div
              key={idx}
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
                delay: idx * 0.1
              }}>

                <div className="text-3xl lg:text-4xl font-bold text-indigo-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  {stat.label}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section id="courses" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Explore Our Top Courses
            </h2>
            <p className="text-lg text-slate-600">
              Learn from industry experts with hands-on projects. Choose from a
              wide range of topics to boost your skills.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, idx) =>
            <motion.div
              key={course.id}
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
                delay: idx * 0.1
              }}>

                <CourseCard
                course={course}
                onEnroll={() => navigate('/register')} />

              </motion.div>
            )}
          </div>

          <div className="mt-12 text-center">
            <Link to="/courses">
              <Button variant="secondary" size="lg">
                View All Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 bg-slate-900 text-white relative overflow-hidden">

        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How EduFlex Works</h2>
            <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
              Start your learning journey in three simple steps. We make it easy
              to get started and keep going.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 border-t-2 border-dashed border-slate-700 -z-10"></div>

            {[
            {
              icon: UserPlus,
              title: 'Create Account',
              desc: 'Sign up for free and set up your profile in seconds.'
            },
            {
              icon: BookOpen,
              title: 'Choose Course',
              desc: 'Browse our catalog and enroll in courses that match your goals.'
            },
            {
              icon: Play,
              title: 'Start Learning',
              desc: 'Watch lessons, take quizzes, and earn certificates at your pace.'
            }].
            map((step, idx) =>
            <motion.div
              key={idx}
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
                delay: idx * 0.2
              }}
              className="text-center">

                <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-900 mb-6 relative z-10">
                  <step.icon className="h-10 w-10 text-indigo-400" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Don't just take our word for it. Hear from learners who have
              transformed their careers with EduFlex.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
            {
              name: 'Sarah Johnson',
              role: 'Frontend Developer',
              quote:
              'The React course was a game-changer. I went from knowing nothing to building full-stack apps in weeks.',
              avatar:
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
            },
            {
              name: 'Michael Chen',
              role: 'Data Analyst',
              quote:
              'Excellent content structure. The Python for Data Science track helped me land my dream job at a tech giant.',
              avatar:
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
            },
            {
              name: 'Emily Davis',
              role: 'UX Designer',
              quote:
              "I loved the practical projects. It wasn't just theory; I actually built a portfolio that impressed recruiters.",
              avatar:
              'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
            }].
            map((testimonial, idx) =>
            <motion.div
              key={idx}
              initial={{
                opacity: 0,
                scale: 0.95
              }}
              whileInView={{
                opacity: 1,
                scale: 1
              }}
              viewport={{
                once: true
              }}
              transition={{
                delay: idx * 0.1
              }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">

                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) =>
                <Star
                  key={star}
                  className="h-4 w-4 text-amber-400 fill-current" />

                )}
                </div>
                <p className="text-slate-600 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <Avatar name={testimonial.name} src={testimonial.avatar} />
                  <div className="ml-3">
                    <div className="font-bold text-slate-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of learners today and get unlimited access to all
            courses, projects, and certificates.
          </p>
          <Link to="/register">
            <button
              className="bg-white text-indigo-600 h-14 px-8 text-base font-bold rounded-xl border-none cursor-pointer">
              Get Started Free
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>);

}
