import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { Users, BookOpen, TrendingUp, Award, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getAllUsers } from '../../api/admin';
import { getCourses } from '../../api/courses';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

// ✅ Excel download
const downloadExcel = (data, filename) => {
  if (!data.length) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  XLSX.writeFile(workbook, filename);
};

export function AdminReports() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, coursesData] = await Promise.all([
          getAllUsers({ limit: 1000 }),
          getCourses()
        ]);
        setUsers(usersData?.users || []);
        setCourses(coursesData || []);
      } catch (error) {
        console.error('Failed to fetch report data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── User Stats ──────────────────────────────────────
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalTutors = users.filter(u => u.role === 'tutor').length;
  const activeUsers = users.filter(u => u.is_active).length;
  const inactiveUsers = users.filter(u => !u.is_active).length;
  const approvedTutors = users.filter(u => u.role === 'tutor' && u.is_verified).length;
  const pendingTutors = users.filter(u => u.role === 'tutor' && !u.is_verified).length;

  const usersByMonth = users.reduce((acc, user) => {
    const month = new Date(user.created_at || user.createdAt)
      .toLocaleString('default', { month: 'short', year: '2-digit' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const userMonthData = Object.entries(usersByMonth)
    .slice(-6)
    .map(([month, count]) => ({ month, count }));

  const tutorStatusData = [
    { name: 'Approved', value: approvedTutors },
    { name: 'Pending', value: pendingTutors }
  ];

  const userStatusData = [
    { name: 'Active', value: activeUsers },
    { name: 'Inactive', value: inactiveUsers }
  ];

  // ── Course Stats ─────────────────────────────────────
  const totalCourses = courses.length;
  const freeCourses = courses.filter(c => c.is_free).length;
  const paidCourses = courses.filter(c => !c.is_free).length;

  const coursesByCategory = courses.reduce((acc, course) => {
    const cat = course.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.entries(coursesByCategory)
    .map(([name, value]) => ({ name, value }));

  const coursesByLevel = courses.reduce((acc, course) => {
    const level = course.level || 'Other';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const levelData = Object.entries(coursesByLevel)
    .map(([name, value]) => ({ name, value }));

  const topCourses = [...courses]
    .sort((a, b) => (b.students_count || 0) - (a.students_count || 0))
    .slice(0, 5);

  // ── Download Handlers ─────────────────────────────────
  const handleDownloadUsers = () => {
    const data = users.map(u => ({
      'First Name': u.first_name,
      'Last Name': u.last_name,
      'Email': u.email,
      'Role': u.role,
      'Status': u.is_active ? 'Active' : 'Inactive',
      'Verified': u.is_verified ? 'Yes' : 'No',
      'Joined': new Date(u.created_at || u.createdAt).toLocaleDateString()
    }));
    downloadExcel(data, 'eduflex_users_report.xlsx');
  };

  const handleDownloadCourses = () => {
    const data = courses.map(c => ({
      'Title': c.title,
      'Category': c.category,
      'Level': c.level,
      'Price': c.is_free ? 'Free' : `$${c.price}`,
      'Tutor': c.tutor_name,
      'Students': c.students_count || 0,
      'Rating': c.rating || 0,
      'Status': c.is_published ? 'Published' : 'Draft'
    }));
    downloadExcel(data, 'eduflex_courses_report.xlsx');
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i}
              className="h-32 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={item}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500 mt-1">
            Platform analytics and insights
          </p>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          {
            label: 'Total Students',
            value: totalStudents,
            icon: Users,
            color: 'bg-indigo-50 text-indigo-600'
          },
          {
            label: 'Total Tutors',
            value: totalTutors,
            icon: Award,
            color: 'bg-purple-50 text-purple-600'
          },
          {
            label: 'Total Courses',
            value: totalCourses,
            icon: BookOpen,
            color: 'bg-emerald-50 text-emerald-600'
          },
          {
            label: 'Active Users',
            value: activeUsers,
            icon: TrendingUp,
            color: 'bg-amber-50 text-amber-600'
          }
        ].map((stat, i) => (
          <div key={i}
            className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">
                {stat.label}
              </span>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <div className="border-b border-slate-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { key: 'users', label: '👥 User Reports' },
              { key: 'courses', label: '📚 Course Reports' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 px-1 border-b-2 font-medium text-sm 
                  transition-colors ${activeTab === tab.key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* ── USER REPORTS TAB ── */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Download Button */}
            <div className="flex justify-end">
              <button
                onClick={handleDownloadUsers}
                className="flex items-center gap-2 px-4 py-2 
                  bg-indigo-600 text-white text-sm font-semibold 
                  rounded-lg hover:bg-indigo-700 transition"
              >
                <Download className="h-4 w-4" />
                Download User Report
              </button>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Users Per Month */}
              <div className="bg-white rounded-xl border 
                  border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">
                  Users Registered Per Month
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={userMonthData}>
                    <CartesianGrid strokeDasharray="3 3"
                      stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1"
                      radius={[4, 4, 0, 0]} name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tutor Status */}
              <div className="bg-white rounded-xl border 
                  border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">
                  Tutor Status
                </h3>
                <div className="flex items-center justify-around">
                  <ResponsiveContainer width="60%" height={200}>
                    <PieChart>
                      <Pie
                        data={tutorStatusData}
                        cx="50%" cy="50%"
                        innerRadius={50} outerRadius={80}
                        paddingAngle={5} dataKey="value"
                      >
                        {tutorStatusData.map((_, i) => (
                          <Cell key={i}
                            fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {tutorStatusData.map((entry, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[i % COLORS.length]
                          }} />
                        <span className="text-sm text-slate-600">
                          {entry.name}:
                          <span className="font-bold ml-1">
                            {entry.value}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Status */}
              <div className="bg-white rounded-xl border 
                  border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">
                  User Account Status
                </h3>
                <div className="flex items-center justify-around">
                  <ResponsiveContainer width="60%" height={200}>
                    <PieChart>
                      <Pie
                        data={userStatusData}
                        cx="50%" cy="50%"
                        innerRadius={50} outerRadius={80}
                        paddingAngle={5} dataKey="value"
                      >
                        {userStatusData.map((_, i) => (
                          <Cell key={i}
                            fill={i === 0 ? '#10b981' : '#ef4444'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {userStatusData.map((entry, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: i === 0
                              ? '#10b981' : '#ef4444'
                          }} />
                        <span className="text-sm text-slate-600">
                          {entry.name}:
                          <span className="font-bold ml-1">
                            {entry.value}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Registrations */}
              <div className="bg-white rounded-xl border 
                  border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">
                  Recent Registrations
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-2 text-slate-500 
                            font-medium">Name</th>
                        <th className="text-left py-2 text-slate-500 
                            font-medium">Role</th>
                        <th className="text-left py-2 text-slate-500 
                            font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 8).map((user, i) => (
                        <tr key={i}
                          className="border-b border-slate-50">
                          <td className="py-2 text-slate-800 font-medium">
                            {user.first_name} {user.last_name}
                          </td>
                          <td className="py-2">
                            <span className={`px-2 py-0.5 rounded-full 
                              text-xs font-medium capitalize
                              ${user.role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : user.role === 'tutor'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-indigo-100 text-indigo-700'
                              }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-2">
                            <span className={`px-2 py-0.5 rounded-full 
                              text-xs font-medium
                              ${user.is_active
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                              }`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── COURSE REPORTS TAB ── */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {/* Download Button */}
            <div className="flex justify-end">
              <button
                onClick={handleDownloadCourses}
                className="flex items-center gap-2 px-4 py-2 
                  bg-indigo-600 text-white text-sm font-semibold 
                  rounded-lg hover:bg-indigo-700 transition"
              >
                <Download className="h-4 w-4" />
                Download Course Report
              </button>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Courses by Category */}
              <div className="bg-white rounded-xl border 
                  border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">
                  Courses by Category
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%" cy="50%"
                      outerRadius={80} dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {categoryData.map((_, i) => (
                        <Cell key={i}
                          fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Courses by Level */}
              <div className="bg-white rounded-xl border 
                  border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">
                  Courses by Level
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={levelData}>
                    <CartesianGrid strokeDasharray="3 3"
                      stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6"
                      radius={[4, 4, 0, 0]} name="Courses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Free vs Paid */}
              <div className="bg-white rounded-xl border 
                  border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">
                  Free vs Paid Courses
                </h3>
                <div className="flex items-center justify-around">
                  <ResponsiveContainer width="60%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Free', value: freeCourses },
                          { name: 'Paid', value: paidCourses }
                        ]}
                        cx="50%" cy="50%"
                        innerRadius={50} outerRadius={80}
                        paddingAngle={5} dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#6366f1" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-sm text-slate-600">
                        Free: <span className="font-bold">{freeCourses}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500" />
                      <span className="text-sm text-slate-600">
                        Paid: <span className="font-bold">{paidCourses}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* All Courses Table with View Details */}
              <div className="bg-white rounded-xl border 
                  border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">
                  All Courses
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-2 text-slate-500 
                            font-medium">Title</th>
                        <th className="text-left py-2 text-slate-500 
                            font-medium">Category</th>
                        <th className="text-left py-2 text-slate-500 
                            font-medium">Students</th>
                        <th className="text-left py-2 text-slate-500 
                            font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.slice(0, 8).map((course, i) => (
                        <tr key={i}
                          className="border-b border-slate-50">
                          <td className="py-2 text-slate-800 
                              font-medium max-w-[100px] truncate">
                            {course.title}
                          </td>
                          <td className="py-2">
                            <span className="px-2 py-0.5 bg-indigo-50 
                              text-indigo-700 rounded-full text-xs">
                              {course.category}
                            </span>
                          </td>
                          <td className="py-2 font-bold text-slate-700">
                            {course.students_count || 0}
                          </td>
                          <td className="py-2">
                            <button
                              onClick={() => navigate(
                                `/admin/courses/${course._id}`
                              )}
                              className="text-xs text-indigo-600 
                                hover:underline font-medium"
                            >
                              View Details →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}