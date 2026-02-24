import React from 'react';
import { Users, BookOpen, Star, MessageSquare } from 'lucide-react';
import { StatsCard } from '../../components/shared/StatsCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function TutorDashboard() {
  const stats = [
    {
      label: 'Total Students',
      value: '1,250',
      icon: Users,
      change: '+12%',
      trend: 'up'
    },
    {
      label: 'Active Courses',
      value: 4,
      icon: BookOpen
    },
    {
      label: 'Average Rating',
      value: 4.8,
      icon: Star,
      change: '+0.2',
      trend: 'up'
    },
    {
      label: 'Unread Questions',
      value: 8,
      icon: MessageSquare,
      change: '-2',
      trend: 'down'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Tutor Dashboard</h1>
        <Button>Create New Course</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} stat={stat} icon={stat.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Courses */}
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-4">My Courses</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="h-12 w-12 bg-slate-200 rounded-md mr-4" />
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">
                    Introduction to React
                  </h4>
                  <p className="text-xs text-slate-500">
                    24 lessons • 1,250 students
                  </p>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-slate-900">4.8</span>
                  <span className="text-xs text-slate-500">rating</span>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4 text-sm">
            View All Courses
          </Button>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-4">
            Recent Student Activity
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mr-3">
                  JD
                </div>
                <div>
                  <p className="text-sm text-slate-900">
                    <span className="font-medium">John Doe</span> completed quiz{' '}
                    <span className="font-medium">React Basics</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    2 hours ago • Scored 90%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
