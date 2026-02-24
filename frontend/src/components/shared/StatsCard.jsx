import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/Card';

export function StatsCard({
  stat,
  icon: Icon,
  color = 'text-indigo-600 bg-indigo-50'
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{stat.label}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {stat.value}
          </h3>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {stat.change &&
      <div className="mt-4 flex items-center text-sm">
          {stat.trend === 'up' ?
        <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" /> :
        stat.trend === 'down' ?
        <TrendingDown className="h-4 w-4 text-rose-500 mr-1" /> :
        null}

          <span
          className={`font-medium ${stat.trend === 'up' ? 'text-emerald-600' : stat.trend === 'down' ? 'text-rose-600' : 'text-slate-600'}`}>

            {stat.change}
          </span>
          <span className="text-slate-500 ml-1">vs last month</span>
        </div>
      }
    </Card>);

}
