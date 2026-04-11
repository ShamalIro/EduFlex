import React, { useState, useEffect } from 'react';
import { Users, BookOpen, GraduationCap, DollarSign, Clock } from 'lucide-react';
import { StatsCard } from '../../components/shared/StatsCard';
import { Card } from '../../components/ui/Card';
import { getAdminCourseStats } from '../../api/courses';
import { getPendingTutors } from '../../api/admin';
import client from '../../api/client';

export function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingTutors, setPendingTutors] = useState(0);
  const [loading, setLoading] = useState(true);
  const [courseStats, setCourseStats] = useState({ totalCourses: 0, byCategory: [] });
  const [weeklyRegistrations, setWeeklyRegistrations] = useState([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => { 
    fetchTotalUsers();
    fetchPendingTutors();
  }, []);

  const fetchTotalUsers = async () => {
    try {
      setLoading(true);
      const response = await client.get('/users/all');
      const users = response.data.data.users || [];
      setTotalUsers(users.length);

      const days = [0, 0, 0, 0, 0, 0, 0];
      const now = new Date();
      now.setHours(23, 59, 59, 999);

      users.forEach(user => {
        const created = new Date(user.created_at);
        const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 6) {
          days[6 - diffDays]++;
        }
      });

      setWeeklyRegistrations(days);
    } catch (error) {
      console.error('Failed to fetch total users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingTutors = async () => {
    try {
      const data = await getPendingTutors();
      setPendingTutors(data.length);
    } catch (error) {
      console.error('Failed to fetch pending tutors:', error);
    }
  };

  useEffect(() => {
    getAdminCourseStats()
      .then(data => setCourseStats(data))
      .catch(err => console.error(err));
  }, []);

  const getLast7Days = () => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push(dayNames[d.getDay()]);
    }
    return result;
  };

  const maxVal = Math.max(...weeklyRegistrations, 1);

  const stats = [
    {
      label: 'Total Users',
      value: loading ? '...' : String(totalUsers),
      icon: Users,
      change: '+15%',
      trend: 'up'
    },
    {
      label: 'Total Courses',
      value: String(courseStats.totalCourses),
      icon: BookOpen,
      change: `+${courseStats.published || 0} published`,
      trend: 'up'
    },
    {
      label: 'Pending Tutors',
      value: String(pendingTutors),
      icon: Clock,
      change: 'Needs review',
      trend: 'up'
    },
    {
      label: 'Active Enrollments',
      value: 'Coming Soon',
      icon: GraduationCap,
      change: 'EnrollmentService pending',
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} stat={stat} icon={stat.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* User Registrations Chart */}
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-6">
            User Registrations (Last 7 Days)
          </h3>
          <div className="flex items-end justify-between h-48 gap-2">
            {weeklyRegistrations.map((value, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full flex flex-col justify-end" style={{ height: '100%' }}>
                  <div
                    className="w-full bg-indigo-500 rounded-t-lg transition-all duration-500 group-hover:bg-indigo-600 relative"
                    style={{
                      height: value > 0 ? `${(value / maxVal) * 100}%` : '4px',
                      minHeight: value > 0 ? '8px' : '4px',
                      opacity: value > 0 ? 1 : 0.15
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {value} user{value !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {getLast7Days()[idx]}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Courses by Category */}
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-6">Courses by Category</h3>
          <div className="space-y-4">
            {courseStats.byCategory.map((cat) => {
              const pct = courseStats.totalCourses > 0
                ? Math.round((cat.count / courseStats.totalCourses) * 100)
                : 0;
              return (
                <div key={cat._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{cat._id}</span>
                    <span className="text-slate-500">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-indigo-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>
    </div>
  );
}