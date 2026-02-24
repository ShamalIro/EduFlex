import React from 'react';
import { Users, BookOpen, GraduationCap, DollarSign } from 'lucide-react';
import { StatsCard } from '../../components/shared/StatsCard';
import { Card } from '../../components/ui/Card';

export function AdminDashboard() {
  const stats = [
  {
    label: 'Total Users',
    value: '12,450',
    icon: Users,
    change: '+15%',
    trend: 'up'
  },
  {
    label: 'Total Courses',
    value: 145,
    icon: BookOpen,
    change: '+4',
    trend: 'up'
  },
  {
    label: 'Active Enrollments',
    value: '8,200',
    icon: GraduationCap,
    change: '+8%',
    trend: 'up'
  },
  {
    label: 'Total Revenue',
    value: '$124k',
    icon: DollarSign,
    change: '+12%',
    trend: 'up'
  }];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) =>
        <StatsCard key={idx} stat={stat} icon={stat.icon} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Simple Bar Chart for User Growth */}
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-6">
            User Registrations (Last 7 Days)
          </h3>
          <div className="flex items-end justify-between h-64 gap-2">
            {[45, 60, 75, 50, 80, 95, 110].map((value, idx) =>
            <div
              key={idx}
              className="flex-1 flex flex-col items-center gap-2 group">

                <div className="relative w-full bg-indigo-50 rounded-t-lg hover:bg-indigo-100 transition-colors flex items-end">
                  <div
                  className="w-full bg-indigo-500 rounded-t-lg transition-all duration-500 group-hover:bg-indigo-600"
                  style={{
                    height: `${value / 120 * 100}%`
                  }} />

                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {value}
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-6">Courses by Category</h3>
          <div className="space-y-4">
            {[
            {
              label: 'Programming',
              value: 45,
              color: 'bg-blue-500'
            },
            {
              label: 'Design',
              value: 25,
              color: 'bg-purple-500'
            },
            {
              label: 'Business',
              value: 20,
              color: 'bg-emerald-500'
            },
            {
              label: 'Marketing',
              value: 10,
              color: 'bg-amber-500'
            }].
            map((item, idx) =>
            <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">
                    {item.label}
                  </span>
                  <span className="text-slate-500">{item.value}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                  className={`h-2.5 rounded-full ${item.color}`}
                  style={{
                    width: `${item.value}%`
                  }} />

                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>);

}
