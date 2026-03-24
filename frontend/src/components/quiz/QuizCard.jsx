import React from 'react';
import {
  HelpCircle,
  Clock,
  Users,
  Edit2,
  Trash2,
  Eye,
  Play,
  MoreVertical,
  CheckCircle,
  ListOrdered,
  ToggleLeft,
  Type
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate } from '../../data/mockData';

/**
 * QuizCard Component
 * Displays quiz information with actions
 *
 * @param {Object} props
 * @param {Object} props.quiz - Quiz data object
 * @param {string} props.variant - 'tutor' | 'student'
 * @param {function} props.onView - View handler
 * @param {function} props.onEdit - Edit handler (tutor only)
 * @param {function} props.onDelete - Delete handler (tutor only)
 * @param {function} props.onStart - Start quiz handler (student only)
 * @param {Object} props.previousResult - Previous attempt result (student only)
 */
export function QuizCard({
  quiz,
  variant = 'tutor',
  onView,
  onEdit,
  onDelete,
  onStart,
  previousResult = null,
  className = ''
}) {
  // Count question types
  const questionTypeCounts = quiz.questions?.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {}) || {};

  // Status badge
  const getStatusBadge = () => {
    if (quiz.status === 'draft') {
      return <Badge variant="default">Draft</Badge>;
    }
    return <Badge variant="success">Published</Badge>;
  };

  return (
    <Card className={`p-5 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`
          flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center
          ${quiz.status === 'draft' ? 'bg-slate-100' : 'bg-purple-100'}
        `}>
          <HelpCircle className={`h-6 w-6 ${
            quiz.status === 'draft' ? 'text-slate-500' : 'text-purple-600'
          }`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {getStatusBadge()}
                <span className="text-xs text-slate-500">
                  {quiz.totalPoints || quiz.questions?.reduce((sum, q) => sum + q.points, 0)} points
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 truncate">
                {quiz.title}
              </h3>
            </div>

            {/* Actions menu for tutor */}
            {variant === 'tutor' && (
              <div className="flex-shrink-0">
                <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          {quiz.description && (
            <p className="text-sm text-slate-600 line-clamp-2 mb-3">
              {quiz.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
            {/* Timer */}
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{quiz.timerDuration} minutes</span>
            </div>

            {/* Questions count */}
            <div className="flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4" />
              <span>{quiz.questions?.length || 0} questions</span>
            </div>

            {/* Attempts count (tutor view) */}
            {variant === 'tutor' && quiz.attempts !== undefined && (
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{quiz.attempts} attempts</span>
              </div>
            )}
          </div>

          {/* Question type breakdown */}
          <div className="flex flex-wrap gap-2 mb-4">
            {questionTypeCounts.mcq > 0 && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                <ListOrdered className="h-3 w-3 mr-1" />
                {questionTypeCounts.mcq} MCQ
              </span>
            )}
            {questionTypeCounts.truefalse > 0 && (
              <span className="inline-flex items-center px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs">
                <ToggleLeft className="h-3 w-3 mr-1" />
                {questionTypeCounts.truefalse} True/False
              </span>
            )}
            {questionTypeCounts.shortanswer > 0 && (
              <span className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs">
                <Type className="h-3 w-3 mr-1" />
                {questionTypeCounts.shortanswer} Short Answer
              </span>
            )}
          </div>

          {/* Previous result (student view) */}
          {variant === 'student' && previousResult && (
            <div className={`
              flex items-center gap-3 p-3 rounded-lg mb-4
              ${previousResult.percentage >= 70 ? 'bg-emerald-50' : 'bg-amber-50'}
            `}>
              <CheckCircle className={`h-5 w-5 ${
                previousResult.percentage >= 70 ? 'text-emerald-600' : 'text-amber-600'
              }`} />
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Previous Score: {previousResult.score}/{previousResult.totalPoints} ({previousResult.percentage}%)
                </p>
                <p className="text-xs text-slate-500">
                  Completed {formatDate(previousResult.completedAt)}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {variant === 'tutor' ? (
              <>
                <Button variant="secondary" size="sm" onClick={onView}>
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  View Results
                </Button>
                <Button variant="ghost" size="sm" onClick={onEdit}>
                  <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete
                </Button>
              </>
            ) : (
              <>
                {quiz.status === 'published' && (
                  <Button size="sm" onClick={onStart}>
                    <Play className="h-3.5 w-3.5 mr-1.5" />
                    {previousResult ? 'Retake Quiz' : 'Start Quiz'}
                  </Button>
                )}
                {previousResult && (
                  <Button variant="secondary" size="sm" onClick={onView}>
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    View Results
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * QuizCardCompact
 * Smaller card variant for list views
 */
export function QuizCardCompact({
  quiz,
  variant = 'tutor',
  onClick,
  className = ''
}) {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center p-4 bg-white border border-slate-200 rounded-lg
        hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer
        ${className}
      `}
    >
      <div className={`
        flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center
        ${quiz.status === 'draft' ? 'bg-slate-100' : 'bg-purple-100'}
      `}>
        <HelpCircle className={`h-5 w-5 ${
          quiz.status === 'draft' ? 'text-slate-500' : 'text-purple-600'
        }`} />
      </div>

      <div className="ml-4 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-slate-900 truncate">
            {quiz.title}
          </h4>
          {quiz.status === 'draft' && (
            <Badge variant="default">Draft</Badge>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {quiz.questions?.length || 0} questions · {quiz.timerDuration} min
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Clock className="h-4 w-4" />
        <span>{quiz.timerDuration}m</span>
      </div>
    </div>
  );
}

export default QuizCard;
