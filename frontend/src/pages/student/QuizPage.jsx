import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Timer, AlertCircle } from 'lucide-react';
import { getQuizByCourse, submitQuiz } from '../../api/assessments';
import { Button } from '../../components/ui/Button';
import { QuizQuestion } from '../../components/shared/QuizQuestion';
import { Modal } from '../../components/ui/Modal';

export function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (id) {
        const data = await getQuizByCourse('1'); // Mock using course ID 1
        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(-1));
        setTimeLeft(data.timeLimit * 60);
      }
    };
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const handleAnswer = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIdx] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setIsSubmitting(true);
    try {
      await submitQuiz(quiz.id, answers);
      navigate('/student/results');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quiz) return <div className="p-8 text-center">Loading quiz...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{quiz.title}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Question {currentQuestionIdx + 1} of {quiz.questions.length}
          </p>
        </div>
        <div
          className={`
          flex items-center px-4 py-2 rounded-lg font-mono font-medium
          ${timeLeft < 60 ? 'bg-rose-100 text-rose-700' : 'bg-indigo-50 text-indigo-700'}
        `}
        >
          <Timer className="h-5 w-5 mr-2" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm mb-8 min-h-[400px]">
        <QuizQuestion
          question={quiz.questions[currentQuestionIdx]}
          selectedAnswer={answers[currentQuestionIdx]}
          onSelect={handleAnswer}
          questionNumber={currentQuestionIdx + 1}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          disabled={currentQuestionIdx === 0}
          onClick={() => setCurrentQuestionIdx((i) => i - 1)}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {quiz.questions.map((_, idx) => (
            <div
              key={idx}
              className={`
                w-2.5 h-2.5 rounded-full
                ${idx === currentQuestionIdx ? 'bg-indigo-600' : answers[idx] !== -1 ? 'bg-indigo-200' : 'bg-slate-200'}
              `}
            />
          ))}
        </div>

        {currentQuestionIdx === quiz.questions.length - 1 ? (
          <Button onClick={() => setShowConfirm(true)}>Submit Quiz</Button>
        ) : (
          <Button onClick={() => setCurrentQuestionIdx((i) => i + 1)}>
            Next
          </Button>
        )}
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Submit Assessment?"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <p className="text-slate-600 mb-6">
            You have answered {answers.filter((a) => a !== -1).length} out of{' '}
            {quiz.questions.length} questions. Are you sure you want to submit?
            You cannot change your answers after submission.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>
              Keep Reviewing
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Yes, Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
