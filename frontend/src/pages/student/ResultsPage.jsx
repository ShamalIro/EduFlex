import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Award, Calendar } from 'lucide-react';
import { getResults } from '../../api/assessments';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';

export function ResultsPage() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      const data = await getResults();
      setResults(data);
      setIsLoading(false);
    };
    fetchResults();
  }, []);

  if (isLoading)
    return <div className="p-8 text-center">Loading results...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">
        My Assessment Results
      </h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
            <Award className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Average Score</p>
            <h3 className="text-2xl font-bold text-slate-900">85%</h3>
          </div>
        </Card>
        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Quizzes Passed</p>
            <h3 className="text-2xl font-bold text-slate-900">12</h3>
          </div>
        </Card>
        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <Calendar className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">
              Last Assessment
            </p>
            <h3 className="text-lg font-bold text-slate-900">2 days ago</h3>
          </div>
        </Card>
      </div>

      {/* Results List */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-900">
                  Quiz Name
                </th>
                <th className="px-6 py-4 font-semibold text-slate-900">Date</th>
                <th className="px-6 py-4 font-semibold text-slate-900">
                  Score
                </th>
                <th className="px-6 py-4 font-semibold text-slate-900">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold text-slate-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((result) => {
                const percentage = (result.score / result.totalPoints) * 100;
                const passed = percentage >= 70;
                return (
                  <tr
                    key={result.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      React Fundamentals Quiz
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(result.completedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-slate-900">
                          {percentage}%
                        </span>
                        <div className="w-24">
                          <ProgressBar
                            value={percentage}
                            size="sm"
                            color={passed ? 'bg-emerald-500' : 'bg-rose-500'}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={passed ? 'success' : 'error'}>
                        {passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs uppercase tracking-wide">
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
