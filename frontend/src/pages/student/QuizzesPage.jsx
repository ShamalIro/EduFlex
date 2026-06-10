import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ClipboardCheck, Clock3, BookOpen } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { getMyQuizzes } from '../../api/assessments';

export function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const courseId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('course') || undefined;
  }, [location.search]);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setError('');
        const data = await getMyQuizzes(courseId);
        setQuizzes(data);
      } catch (error) {
        console.error(error);
        setError(
          error?.response?.data?.message ||
            'Failed to load quizzes. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizzes();
  }, [courseId]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading quizzes...</div>;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quizzes</h1>
          <p className="text-slate-500 mt-1">Quizzes from your enrolled courses</p>
        </div>
        <Card className="p-10 text-center">
          <ClipboardCheck className="h-12 w-12 text-rose-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Could not load quizzes
          </h2>
          <p className="text-slate-500 mb-5">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quizzes</h1>
        <p className="text-slate-500 mt-1">Quizzes from your enrolled courses</p>
      </div>

      {quizzes.length === 0 ? (
        <Card className="p-10 text-center">
          <ClipboardCheck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            No quizzes available
          </h2>
          <p className="text-slate-500 mb-5">
            Enroll in a course and wait for tutors to publish quizzes.
          </p>
          <Link to="/student/courses">
            <Button>Browse Courses</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz._id || quiz.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{quiz.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Course ID: {quiz.course_id}
                  </p>
                </div>
                <Badge variant="info">Published</Badge>
              </div>

              <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                {quiz.description}
              </p>

              <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  <span>{quiz.timeLimit || 0} mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{quiz.totalPoints || 0} pts</span>
                </div>
              </div>

              <div className="mt-4">
                <Button
                  className="w-full"
                  onClick={() => navigate(`/student/quiz/${quiz.course_id}`)}
                >
                  Start Quiz
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
