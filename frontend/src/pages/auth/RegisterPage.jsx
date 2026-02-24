import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await register(name, email, password, role);
      // Redirect to login instead of dashboard to fix user flow
      navigate('/login');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 text-2xl font-bold">
            <GraduationCap className="h-10 w-10 text-indigo-500" />
            <span>EduFlex</span>
          </div>
          <div className="mt-20 max-w-md">
            <h2 className="text-4xl font-bold mb-6">
              Start your learning journey today.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Create an account to access unlimited courses, track your
              progress, and earn certificates.
            </p>
          </div>
        </div>
        <div className="relative z-10 text-sm text-slate-500">
          © 2024 EduFlex LMS. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-24 bg-white">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900">
              Create an account
            </h2>
            <p className="mt-2 text-slate-600">
              Join EduFlex as a student or tutor.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={User}
              required />


            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required />


            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required />


            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                I want to join as a
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`
                    flex items-center justify-center px-4 py-3 border rounded-lg text-sm font-medium transition-all
                    ${role === 'student' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
                  `}>

                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('tutor')}
                  className={`
                    flex items-center justify-center px-4 py-3 border rounded-lg text-sm font-medium transition-all
                    ${role === 'tutor' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
                  `}>

                  Tutor
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isSubmitting}>

              Create Account
            </Button>
          </form>

          <div className="text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-600 font-medium hover:text-indigo-500">

              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>);

}
