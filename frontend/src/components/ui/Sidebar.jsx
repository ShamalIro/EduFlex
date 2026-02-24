import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  BarChart3,
  Users,
  Settings,
  LogOut,
  FileText
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from './Avatar';

export function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/courses', icon: BookOpen, label: 'Browse Courses' },
    { to: '/student/my-courses', icon: GraduationCap, label: 'My Courses' },
    { to: '/student/results', icon: BarChart3, label: 'My Progress' }
  ];

  const tutorLinks = [
    { to: '/tutor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tutor/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/tutor/students', icon: Users, label: 'Students' }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/courses', icon: BookOpen, label: 'All Courses' },
    { to: '/admin/reports', icon: FileText, label: 'Reports' }
  ];

  const links =
    user.role === 'student'
      ? studentLinks
      : user.role === 'tutor'
      ? tutorLinks
      : adminLinks;

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <GraduationCap className="h-8 w-8 text-indigo-500 mr-3" />
            <span className="text-xl font-bold tracking-tight">EduFlex</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={({ isActive }) => `
                    flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center mb-4 px-2">
              <Avatar
                name={user.name}
                src={user.avatar}
                size="sm"
                className="mr-3"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-400 truncate capitalize">
                  {user.role}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-400 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
