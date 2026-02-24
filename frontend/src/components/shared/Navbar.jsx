import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  BookOpen,
  User as UserIcon } from
'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  // Scroll effect for background
  const navBackground = useTransform(
    scrollY,
    [0, 50],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.95)']
  );

  const navShadow = useTransform(
    scrollY,
    [0, 50],
    ['none', '0 4px 6px -1px rgba(0, 0, 0, 0.1)']
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
  {
    name: 'Home',
    path: user ? '/home' : '/'
  },
  {
    name: 'Courses',
    path: user ? '/student/courses' : '/courses'
  },
  {
    name: 'About Us',
    path: '/about'
  },
  {
    name: 'Contact Us',
    path: '/contact'
  }];

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <motion.nav
      style={{
        backgroundColor: navBackground,
        boxShadow: navShadow
      }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3 backdrop-blur-sm' : 'py-5'}`}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to={user ? '/home' : '/'} className="flex items-center group">
            <GraduationCap className="h-8 w-8 text-indigo-600 mr-2 transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              EduFlex
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) =>
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium transition-colors ${isActive(link.path) ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}>

                {link.name}
              </Link>
            )}
          </div>

          {/* Desktop Auth/User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ?
            <>
                <Link to="/student/results">
                  <Button variant="ghost" size="sm" className="text-slate-600">
                    <BookOpen className="h-4 w-4 mr-2" />
                    My Learning
                  </Button>
                </Link>

                <Link to={`/${user.role}/dashboard`}>
                  <Button variant="ghost" size="sm" className="text-slate-600">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>

                <div className="h-6 w-px bg-slate-200 mx-2"></div>

                <div className="flex items-center gap-3">
                  <Link to="/profile" className="flex items-center gap-3 group">
                    <div className="text-right hidden lg:block">
                      <div className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {user.name}
                      </div>
                      <div className="text-xs text-slate-500 capitalize">
                        {user.role}
                      </div>
                    </div>
                    <Avatar name={user.name} src={user.avatar} size="sm" />
                  </Link>
                  <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-full hover:bg-rose-50"
                  title="Sign out">

                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </> :

            <>
                <Link to="/login">
                  <Button
                  variant="ghost"
                  className="text-slate-600 hover:text-indigo-600">

                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">Get Started Free</Button>
                </Link>
              </>
            }
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 hover:text-indigo-600 p-2">

              {isMenuOpen ?
              <X className="h-6 w-6" /> :

              <Menu className="h-6 w-6" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen &&
        <motion.div
          initial={{
            opacity: 0,
            height: 0
          }}
          animate={{
            opacity: 1,
            height: 'auto'
          }}
          exit={{
            opacity: 0,
            height: 0
          }}
          className="md:hidden bg-white border-b border-slate-200 overflow-hidden">

            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) =>
            <Link
              key={link.name}
              to={link.path}
              className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md ${isActive(link.path) ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}>

                  {link.name}
                </Link>
            )}

              <div className="border-t border-slate-100 my-4 pt-4 space-y-3">
                {user ?
              <>
                    <div className="flex items-center px-3 mb-4">
                      <Avatar name={user.name} src={user.avatar} size="md" />
                      <div className="ml-3">
                        <div className="text-base font-medium text-slate-800">
                          {user.name}
                        </div>
                        <div className="text-sm text-slate-500 capitalize">
                          {user.role}
                        </div>
                      </div>
                    </div>
                    <Link
                  to="/student/results"
                  className="block px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 rounded-md">

                      <BookOpen className="h-4 w-4 inline mr-2" />
                      My Learning
                    </Link>
                    <Link
                  to={`/${user.role}/dashboard`}
                  className="block px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 rounded-md">

                      <LayoutDashboard className="h-4 w-4 inline mr-2" />
                      Dashboard
                    </Link>
                    <Link
                  to="/profile"
                  className="block px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 rounded-md">

                      <UserIcon className="h-4 w-4 inline mr-2" />
                      Profile Settings
                    </Link>
                    <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-base font-medium text-rose-600 hover:bg-rose-50 rounded-md flex items-center">

                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </> :

              <div className="flex flex-col space-y-3 px-3">
                    <Link to="/login" className="w-full">
                      <Button
                    variant="secondary"
                    className="w-full justify-center">

                        Log in
                      </Button>
                    </Link>
                    <Link to="/register" className="w-full">
                      <Button
                    variant="primary"
                    className="w-full justify-center">

                        Get Started Free
                      </Button>
                    </Link>
                  </div>
              }
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </motion.nav>);

}
