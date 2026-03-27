import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, XCircle, Award, Calendar } from 'lucide-react';
import { getResults } from '../../api/assessments';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';

export function ResultsPage() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const getPercentage = (result) => {
    if (Number.isFinite(result?.percentage)) return result.percentage;
    if (Number(result?.totalPoints) > 0) {
      return Number(((result.score || 0) / result.totalPoints) * 100);
    }
    return 0;
  };

  const summary = useMemo(() => {
    if (!results.length) {
      return {
        averageScore: 0,
        passed: 0,
        lastAssessmentLabel: 'No attempts yet'
      };
    }

    const totalPercentage = results.reduce((sum, result) => sum + getPercentage(result), 0);
    const passed = results.filter((result) => getPercentage(result) >= 70).length;
    const lastAttemptDate = results[0]?.submittedAt || results[0]?.completedAt;
    let lastAssessmentLabel = 'No attempts yet';
    if (lastAttemptDate) {
      const dateObj = new Date(lastAttemptDate);
      const diffMs = Date.now() - dateObj.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) {
        lastAssessmentLabel = 'Today';
      } else if (diffDays === 1) {
        lastAssessmentLabel = '1 day ago';
      } else {
        lastAssessmentLabel = `${diffDays} days ago`;
      }
    }

    return {
      averageScore: totalPercentage / results.length,
      passed,
      lastAssessmentLabel
    };
  }, [results]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setError('');
        const data = await getResults();
        setResults(data);
      } catch (err) {
        console.error(err);
        setError(
          err?.response?.data?.message || 'Failed to load assessment results. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
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
            <h3 className="text-2xl font-bold text-slate-900">
              {results.length ? `${Math.round(summary.averageScore)}%` : '--'}
            </h3>
          </div>
        </Card>
        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Quizzes Passed</p>
            <h3 className="text-2xl font-bold text-slate-900">{summary.passed}</h3>
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
            <h3 className="text-lg font-bold text-slate-900">
              {summary.lastAssessmentLabel}
            </h3>
          </div>
        </Card>
      </div>

      {error ? (
        <Card className="p-10 text-center">
          <XCircle className="h-12 w-12 text-rose-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Could not load results</h2>
          <p className="text-slate-500">{error}</p>
        </Card>
      ) : results.length === 0 ? (
        <Card className="p-10 text-center">
          <CheckCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            No quiz attempts yet
          </h2>
          <p className="text-slate-500">
            Take a quiz to see your performance history.
          </p>
        </Card>
      ) : (
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
                  const percentage = getPercentage(result);
                  const passed = percentage >= 70;
                  const completedAt = result.submittedAt || result.completedAt;
                  return (
                    <tr
                      key={result._id || result.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {result.quiz_title || 'Quiz'}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {completedAt
                          ? new Date(completedAt).toLocaleDateString()
                          : 'Pending'}
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
      )}
    </div>
  );
}
