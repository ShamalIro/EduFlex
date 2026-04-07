import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, XCircle, Award, Calendar, FileText, TrendingUp } from 'lucide-react';
import { getResults, getAssignmentSubmissions } from '../../api/assessments';
import { getEnrolledCourses } from '../../api/courses';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';

export function ResultsPage() {
  const [quizResults, setQuizResults] = useState([]);
  const [assignmentResults, setAssignmentResults] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
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
    const allResults = [...quizResults, ...assignmentResults];
    if (!allResults.length && !enrolledCourses.length) {
      return {
        averageScore: 0,
        passed: 0,
        completed: 0,
        overallProgress: 0,
        lastAssessmentLabel: 'No attempts yet'
      };
    }

    // Calculate average score from assessments
    const totalPercentage = allResults.reduce((sum, result) => sum + getPercentage(result), 0);
    const passed = allResults.filter((result) => getPercentage(result) >= 70).length;
    const completed = assignmentResults.filter(r => r.status === 'submitted').length + quizResults.length;
    
    // Calculate overall progress from enrolled courses
    const overallProgress = enrolledCourses.length > 0
      ? Math.round(enrolledCourses.reduce((sum, course) => sum + (course.progress || 0), 0) / enrolledCourses.length)
      : 0;
    
    const getAllDates = () => [
      ...quizResults.map(r => r.submittedAt || r.completedAt),
      ...assignmentResults.map(r => r.submittedAt)
    ].filter(Boolean);
    
    const lastAttemptDate = getAllDates().sort((a, b) => new Date(b) - new Date(a))[0];
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
      averageScore: allResults.length ? totalPercentage / allResults.length : 0,
      passed,
      completed,
      overallProgress,
      lastAssessmentLabel
    };
  }, [quizResults, assignmentResults, enrolledCourses]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setError('');
        const [quizData, assignmentData, coursesData] = await Promise.all([
          getResults(),
          getAssignmentSubmissions(),
          getEnrolledCourses()
        ]);
        setQuizResults(quizData);
        setAssignmentResults(assignmentData);
        setEnrolledCourses(coursesData);
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

  const allResults = [...quizResults, ...assignmentResults];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">
        My Assessment Progress
      </h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-full text-purple-600">
            <TrendingUp className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Overall Progress</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {summary.overallProgress}%
            </h3>
          </div>
        </Card>
        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
            <Award className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Average Score</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {(quizResults.length || assignmentResults.length) ? `${Math.round(summary.averageScore)}%` : '--'}
            </h3>
          </div>
        </Card>
        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Passed</p>
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
      ) : (
        <>
          {enrolledCourses.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Course Progress</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {enrolledCourses.map((course) => (
                  <Card key={course.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-slate-900">{course.title || course.name}</h3>
                      <span className="text-sm font-semibold text-slate-900">{course.progress || 0}%</span>
                    </div>
                    <ProgressBar value={course.progress || 0} size="md" />
                  </Card>
                ))}
              </div>
            </div>
          )}

          {allResults.length === 0 ? (
            <Card className="p-10 text-center">
              <CheckCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-800 mb-2">
                No assessment attempts yet
              </h2>
              <p className="text-slate-500">
                Take a quiz or submit an assignment to see your performance history.
              </p>
            </Card>
          ) : (
            <>
              {quizResults.length > 0 && (
                <>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Quiz Results</h2>
                  <Card className="overflow-hidden mb-8">
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
                            <th className="px-6 py-4 font-semibold text-slate-900"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {quizResults
                            .sort((a, b) => new Date(b.submittedAt || b.completedAt) - new Date(a.submittedAt || a.completedAt))
                            .map((result) => {
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
                                  {/* <td className="px-6 py-4">
                                    <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs uppercase tracking-wide">
                                      View Details
                                    </button>
                                  </td> */}
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </>
              )}

              {assignmentResults.length > 0 && (
                <>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Assignment Submissions</h2>
                  <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4 font-semibold text-slate-900">
                              Assignment Name
                            </th>
                            <th className="px-6 py-4 font-semibold text-slate-900">Date</th>
                            <th className="px-6 py-4 font-semibold text-slate-900">
                              Status
                            </th>
                            <th className="px-6 py-4 font-semibold text-slate-900"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {assignmentResults
                            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
                            .map((result) => {
                              const submittedAt = result.submittedAt;
                              return (
                                <tr
                                  key={result._id || result.id}
                                  className="hover:bg-slate-50 transition-colors"
                                >
                                  <td className="px-6 py-4 font-medium text-slate-900">
                                    {result.assignment_title || 'Assignment'}
                                  </td>
                                  <td className="px-6 py-4 text-slate-500">
                                    {submittedAt
                                      ? new Date(submittedAt).toLocaleDateString()
                                      : 'Not submitted'}
                                  </td>
                                  <td className="px-6 py-4">
                                    <Badge variant={result.status === 'submitted' ? 'success' : 'secondary'}>
                                      {result.status === 'submitted' ? 'Submitted' : 'Draft'}
                                    </Badge>
                                  </td>
                                  {/* <td className="px-6 py-4">
                                    <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs uppercase tracking-wide">
                                      View Details
                                    </button>
                                  </td> */}
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
