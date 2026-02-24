import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get return url from location state or default to authenticated home
  const from = location.state?.from?.pathname || '/home';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      // Redirect to the authenticated home page instead of dashboard
      navigate(from, {
        replace: true
      });
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = (role) => {
    setEmail(`${role}@edu.com`);
    setPassword('password');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 text-2xl font-bold">
            <GraduationCap className="h-10 w-10" />
            <span>EduFlex</span>
          </div>
          <div className="mt-20 max-w-md">
            <h2 className="text-4xl font-bold mb-6">
              Master new skills with the best tutors.
            </h2>
            <p className="text-indigo-100 text-lg leading-relaxed">
              Join thousands of students learning cutting-edge technologies,
              design, and business skills on our platform.
            </p>
          </div>
        </div>
        <div className="relative z-10 text-sm text-indigo-200">
          © 2024 EduFlex LMS. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-24 bg-white">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-slate-600">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required />


            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                required />

              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500">

                  Forgot password?
                </a>
              </div>
            </div>

            {error &&
            <div className="p-3 rounded-lg bg-rose-50 text-rose-600 text-sm font-medium">
                {error}
              </div>
            }

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSubmitting}>

              Sign in
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">
                Don't have an account?
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <Link
              to="/register"
              className="text-indigo-600 font-medium hover:text-indigo-500 flex items-center">

              Create an account <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {/* Demo Helpers */}
          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Demo Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => fillDemo('student')}
                className="text-xs py-1 px-2 bg-white border border-slate-200 rounded hover:border-indigo-300 text-slate-600">

                Student
              </button>
              <button
                onClick={() => fillDemo('tutor')}
                className="text-xs py-1 px-2 bg-white border border-slate-200 rounded hover:border-indigo-300 text-slate-600">

                Tutor
              </button>
              <button
                onClick={() => fillDemo('admin')}
                className="text-xs py-1 px-2 bg-white border border-slate-200 rounded hover:border-indigo-300 text-slate-600">

                Admin
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              Password: "password"
            </p>
          </div>
        </div>
      </div>
    </div>);

}
