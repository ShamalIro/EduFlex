import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Heart, Award, Globe, BookOpen } from 'lucide-react';
import { Navbar } from '../../components/shared/Navbar';
import { Footer } from '../../components/shared/Footer';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Link } from 'react-router-dom';

export function AboutPage() {
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

  const team = [
  {
    name: 'Dr. Sarah Mitchell',
    role: 'Founder & CEO',
    image:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    bio: 'Former Education Professor with 15+ years in EdTech.'
  },
  {
    name: 'James Wilson',
    role: 'Head of Content',
    image:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    bio: 'Curriculum expert passionate about accessible learning.'
  },
  {
    name: 'Emily Chen',
    role: 'Lead Instructor',
    image:
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    bio: 'Award-winning developer and technical mentor.'
  },
  {
    name: 'Michael Ross',
    role: 'CTO',
    image:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    bio: 'Building the future of learning infrastructure.'
  }];

  const values = [
  {
    icon: Target,
    title: 'Quality Education',
    description:
    'We believe in providing world-class content from industry experts.'
  },
  {
    icon: Globe,
    title: 'Accessibility',
    description:
    'Learning should be available to everyone, anywhere in the world.'
  },
  {
    icon: Heart,
    title: 'Community',
    description:
    'We foster a supportive environment for learners to grow together.'
  }];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/50 via-slate-50 to-slate-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl mx-auto">

            <motion.h1
              variants={fadeInUp}
              className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">

              Empowering the World to{' '}
              <span className="text-indigo-600">Learn</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-slate-600 mb-8 leading-relaxed">

              At EduFlex, we're on a mission to democratize education. We
              provide high-quality, accessible learning experiences that help
              individuals master new skills and achieve their career goals.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
            {
              label: 'Learners',
              value: '50k+',
              icon: Users
            },
            {
              label: 'Courses',
              value: '200+',
              icon: BookOpen
            },
            {
              label: 'Instructors',
              value: '100+',
              icon: Award
            },
            {
              label: 'Countries',
              value: '120+',
              icon: Globe
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

                <div className="flex justify-center mb-2">
                  <stat.icon className="h-6 w-6 text-indigo-500" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
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

      {/* Values Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              These principles guide everything we do, from course creation to
              student support.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, idx) =>
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
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">

                <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-600">
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
              The passionate educators and technologists behind EduFlex.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, idx) =>
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
              className="bg-slate-800 p-6 rounded-2xl text-center border border-slate-700">

                <div className="mb-6 relative inline-block">
                  <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500" />

                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-indigo-400 text-sm font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-slate-400 text-sm">{member.bio}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Join Our Growing Community
          </h2>
          <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
            Start your learning journey today and unlock your potential with
            EduFlex.
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="bg-white text-indigo-600 hover:bg-indigo-50 border-none h-14 px-8 text-base font-bold">

              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>);

}
