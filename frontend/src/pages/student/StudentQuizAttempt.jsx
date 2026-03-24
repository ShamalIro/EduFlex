import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Timer,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  HelpCircle,
  ListOrdered,
  ToggleLeft,
  Type,
  Award,
  X,
  Clock
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { QuizTimer } from '../../components/ui/CountdownTimer';
import { MOCK_QUIZZES } from '../../data/mockData';

/**
 * StudentQuizAttempt Page
 * Enhanced quiz taking interface with timer, question navigation, and auto-submit
 */
export function StudentQuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId') || '1';

  // Quiz state
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);

  // Modal states
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showStartModal, setShowStartModal] = useState(true);
  const [quizResult, setQuizResult] = useState(null);

  // Load quiz
  useEffect(() => {
    const loadQuiz = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find quiz by ID from mock data
      const foundQuiz = MOCK_QUIZZES.find(q => q.id === id);
      if (foundQuiz) {
        setQuiz(foundQuiz);
        setTimeRemaining(foundQuiz.timerDuration * 60);

        // Initialize answers based on question types
        const initialAnswers = {};
        foundQuiz.questions.forEach(q => {
          if (q.type === 'mcq') {
            initialAnswers[q.id] = -1;
          } else if (q.type === 'truefalse') {
            initialAnswers[q.id] = null;
          } else if (q.type === 'shortanswer') {
            initialAnswers[q.id] = '';
          }
        });
        setAnswers(initialAnswers);
      }
      setIsLoading(false);
    };

    loadQuiz();
  }, [id]);

  // Timer effect
  useEffect(() => {
    if (!timerStarted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerStarted, timeRemaining]);

  // Handle auto-submit when time runs out
  const handleAutoSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Calculate result
    const result = calculateResult();
    setQuizResult(result);
    setShowResults(true);
    setIsSubmitting(false);
  }, [quiz, answers, isSubmitting]);

  // Calculate quiz result
  const calculateResult = () => {
    if (!quiz) return null;

    let score = 0;
    const questionResults = [];

    quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      let isCorrect = false;

      if (question.type === 'mcq') {
        isCorrect = userAnswer === question.correctAnswer;
      } else if (question.type === 'truefalse') {
        isCorrect = userAnswer === question.correctAnswer;
      } else if (question.type === 'shortanswer') {
        // Case-insensitive comparison
        isCorrect = userAnswer?.toLowerCase().trim() === question.expectedAnswer?.toLowerCase().trim();
      }

      if (isCorrect) {
        score += question.points;
      }

      questionResults.push({
        ...question,
        userAnswer,
        isCorrect
      });
    });

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((score / totalPoints) * 100);

    return {
      score,
      totalPoints,
      percentage,
      questionResults,
      timeSpent: (quiz.timerDuration * 60) - timeRemaining,
      completedAt: new Date().toISOString()
    };
  };

  // Handle answer selection
  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  // Handle quiz start
  const handleStartQuiz = () => {
    setShowStartModal(false);
    setTimerStarted(true);
  };

  // Handle manual submit
  const handleSubmit = async () => {
    setShowConfirmSubmit(false);
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = calculateResult();
    setQuizResult(result);
    setShowResults(true);
    setIsSubmitting(false);
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get answered questions count
  const getAnsweredCount = () => {
    if (!quiz) return 0;
    return quiz.questions.filter(q => {
      const answer = answers[q.id];
      if (q.type === 'mcq') return answer !== -1;
      if (q.type === 'truefalse') return answer !== null;
      if (q.type === 'shortanswer') return answer?.trim() !== '';
      return false;
    }).length;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-slate-500 mt-4">Loading quiz...</p>
      </div>
    );
  }

  // Check if we're in test mode (URL starts with /test)
  const isTestMode = window.location.pathname.startsWith('/test');
  const basePath = isTestMode ? '/test/student' : '/student';

  // Not found state
  if (!quiz) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Quiz not found</h2>
        <Button onClick={() => navigate(`${basePath}/courses/${courseId}`)}>Back to Course</Button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIdx];
  const isLastQuestion = currentQuestionIdx === quiz.questions.length - 1;
  const isFirstQuestion = currentQuestionIdx === 0;

  // Question type icon
  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'mcq': return ListOrdered;
      case 'truefalse': return ToggleLeft;
      case 'shortanswer': return Type;
      default: return HelpCircle;
    }
  };

  const QuestionTypeIcon = getQuestionTypeIcon(currentQuestion.type);

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Start Quiz Modal */}
      <Modal
        isOpen={showStartModal}
        onClose={() => navigate(-1)}
        title="Ready to Start?"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
            <HelpCircle className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{quiz.title}</h3>
          <p className="text-slate-600 mb-4">{quiz.description}</p>

          <div className="flex justify-center gap-6 mb-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span>{quiz.questions.length} questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{quiz.timerDuration} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>{quiz.questions.reduce((sum, q) => sum + q.points, 0)} points</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Timer starts when you click "Start Quiz"</li>
                  <li>Quiz auto-submits when timer expires</li>
                  <li>You cannot pause or restart the quiz</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={handleStartQuiz}>
              Start Quiz
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quiz Header */}
      {!showStartModal && !showResults && (
        <>
          <Card className="p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{quiz.title}</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Question {currentQuestionIdx + 1} of {quiz.questions.length}
                </p>
              </div>

              {/* Timer */}
              <div
                className={`
                  flex items-center px-4 py-2 rounded-lg font-mono font-bold text-lg
                  ${timeRemaining < 60
                    ? 'bg-rose-100 text-rose-700 animate-pulse'
                    : timeRemaining < 300
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-indigo-50 text-indigo-700'
                  }
                `}
              >
                <Timer className={`h-5 w-5 mr-2 ${timeRemaining < 60 ? 'animate-bounce' : ''}`} />
                {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1.5 mt-4 flex-wrap">
              {quiz.questions.map((q, idx) => {
                const isAnswered = q.type === 'mcq'
                  ? answers[q.id] !== -1
                  : q.type === 'truefalse'
                    ? answers[q.id] !== null
                    : answers[q.id]?.trim() !== '';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`
                      w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium
                      transition-colors
                      ${idx === currentQuestionIdx
                        ? 'bg-indigo-600 text-white'
                        : isAnswered
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }
                    `}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Question Card */}
          <Card className="p-6 mb-6 min-h-[400px]">
            {/* Question Header */}
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="info">
                <QuestionTypeIcon className="h-3 w-3 mr-1" />
                {currentQuestion.type === 'mcq' ? 'Multiple Choice' :
                 currentQuestion.type === 'truefalse' ? 'True/False' : 'Short Answer'}
              </Badge>
              <span className="text-sm text-slate-500">{currentQuestion.points} points</span>
            </div>

            {/* Question Text */}
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              {currentQuestion.text}
            </h2>

            {/* Answer Options */}
            {currentQuestion.type === 'mcq' && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => handleAnswer(currentQuestion.id, optIdx)}
                    className={`
                      w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left
                      transition-all
                      ${answers[currentQuestion.id] === optIdx
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }
                    `}
                  >
                    <div className={`
                      flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
                      ${answers[currentQuestion.id] === optIdx
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-slate-300'
                      }
                    `}>
                      {answers[currentQuestion.id] === optIdx && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className={`text-sm ${
                      answers[currentQuestion.id] === optIdx
                        ? 'text-indigo-900 font-medium'
                        : 'text-slate-700'
                    }`}>
                      {option}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'truefalse' && (
              <div className="flex gap-4">
                {[true, false].map((value) => (
                  <button
                    key={String(value)}
                    onClick={() => handleAnswer(currentQuestion.id, value)}
                    className={`
                      flex-1 flex items-center justify-center gap-3 p-6 rounded-lg border-2
                      transition-all
                      ${answers[currentQuestion.id] === value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }
                    `}
                  >
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center
                      ${answers[currentQuestion.id] === value
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-slate-300'
                      }
                    `}>
                      {answers[currentQuestion.id] === value && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className={`text-lg font-medium ${
                      answers[currentQuestion.id] === value
                        ? 'text-indigo-900'
                        : 'text-slate-700'
                    }`}>
                      {value ? 'True' : 'False'}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'shortanswer' && (
              <Input
                placeholder="Type your answer here..."
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                className="text-lg py-4"
              />
            )}
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              disabled={isFirstQuestion}
              onClick={() => setCurrentQuestionIdx(i => i - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <p className="text-sm text-slate-500">
              {getAnsweredCount()} of {quiz.questions.length} answered
            </p>

            {isLastQuestion ? (
              <Button onClick={() => setShowConfirmSubmit(true)}>
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={() => setCurrentQuestionIdx(i => i + 1)}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </>
      )}

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showConfirmSubmit}
        onClose={() => setShowConfirmSubmit(false)}
        title="Submit Quiz?"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <p className="text-slate-600 mb-4">
            You have answered <strong>{getAnsweredCount()}</strong> out of <strong>{quiz.questions.length}</strong> questions.
          </p>
          <p className="text-slate-500 text-sm mb-6">
            Are you sure you want to submit? You cannot change your answers after submission.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => setShowConfirmSubmit(false)}>
              Keep Reviewing
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              Yes, Submit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Results Modal */}
      <Modal
        isOpen={showResults}
        onClose={() => navigate(`${basePath}/courses/${courseId}`)}
        title="Quiz Results"
      >
        {quizResult && (
          <div>
            {/* Score Summary */}
            <div className="text-center mb-6">
              <div className={`
                mx-auto flex items-center justify-center h-20 w-20 rounded-full mb-4
                ${quizResult.percentage >= 70 ? 'bg-emerald-100' : quizResult.percentage >= 50 ? 'bg-amber-100' : 'bg-rose-100'}
              `}>
                <span className={`text-3xl font-bold ${
                  quizResult.percentage >= 70 ? 'text-emerald-600' : quizResult.percentage >= 50 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {quizResult.percentage}%
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {quizResult.percentage >= 70 ? 'Great Job!' : quizResult.percentage >= 50 ? 'Good Effort!' : 'Keep Practicing!'}
              </h3>
              <p className="text-slate-600">
                You scored <strong>{quizResult.score}</strong> out of <strong>{quizResult.totalPoints}</strong> points
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">{quizResult.questionResults.filter(q => q.isCorrect).length}</p>
                <p className="text-xs text-slate-500">Correct</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">{quizResult.questionResults.filter(q => !q.isCorrect).length}</p>
                <p className="text-xs text-slate-500">Incorrect</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">{Math.floor(quizResult.timeSpent / 60)}:{(quizResult.timeSpent % 60).toString().padStart(2, '0')}</p>
                <p className="text-xs text-slate-500">Time Used</p>
              </div>
            </div>

            {/* Question Review */}
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              <h4 className="font-medium text-slate-900 sticky top-0 bg-white py-1">Question Review</h4>
              {quizResult.questionResults.map((q, idx) => (
                <div
                  key={q.id}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg
                    ${q.isCorrect ? 'bg-emerald-50' : 'bg-rose-50'}
                  `}
                >
                  <div className={`
                    flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                    ${q.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}
                  `}>
                    {q.isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : (
                      <X className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 line-clamp-1">
                      Q{idx + 1}: {q.text}
                    </p>
                    <p className="text-xs text-slate-500">
                      {q.points} points
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => navigate(`${basePath}/courses/${courseId}`)}>
                Back to Course
              </Button>
              <Button onClick={() => window.location.reload()}>
                Retake Quiz
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default StudentQuizAttempt;
