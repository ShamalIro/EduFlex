import React from 'react';
import {
  FileText,
  Calendar,
  Users,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CountdownTimer } from '../ui/CountdownTimer';
import { formatDate, getTimeRemaining } from '../../data/mockData';

/**
 * AssignmentCard Component
 * Displays assignment information with actions
 *
 * @param {Object} props
 * @param {Object} props.assignment - Assignment data object
 * @param {string} props.variant - 'tutor' | 'student'
 * @param {function} props.onView - View handler
 * @param {function} props.onEdit - Edit handler (tutor only)
 * @param {function} props.onDelete - Delete handler (tutor only)
 * @param {function} props.onSubmit - Submit handler (student only)
 */
export function AssignmentCard({
  assignment,
  variant = 'tutor',
  onView,
  onEdit,
  onDelete,
  onSubmit,
  className = ''
}) {
  const timeRemaining = getTimeRemaining(assignment.dueDate);
  const isOverdue = timeRemaining.expired;

  // Status badge variant
  const getStatusBadge = () => {
    if (assignment.status === 'draft') {
      return <Badge variant="default">Draft</Badge>;
    }
    if (isOverdue) {
      return <Badge variant="error">Past Due</Badge>;
    }
    if (timeRemaining.urgent) {
      return <Badge variant="warning">Due Soon</Badge>;
    }
    return <Badge variant="success">Active</Badge>;
  };

  return (
    <Card className={`p-5 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`
          flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center
          ${assignment.status === 'draft'
            ? 'bg-slate-100'
            : isOverdue
              ? 'bg-rose-100'
              : 'bg-indigo-100'
          }
        `}>
          <FileText className={`h-6 w-6 ${
            assignment.status === 'draft'
              ? 'text-slate-500'
              : isOverdue
                ? 'text-rose-500'
                : 'text-indigo-600'
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
                  {assignment.totalMarks} marks
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 truncate">
                {assignment.title}
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
          <p className="text-sm text-slate-600 line-clamp-2 mb-3">
            {assignment.description}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
            {/* Due date / Countdown */}
            <div className="flex items-center gap-1.5">
              {isOverdue ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  <span className="text-rose-600">
                    Due {formatDate(assignment.dueDate)}
                  </span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4" />
                  <span>Due {formatDate(assignment.dueDate)}</span>
                </>
              )}
            </div>

            {/* Submissions count (tutor view) */}
            {variant === 'tutor' && assignment.submissions !== undefined && (
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{assignment.submissions} submissions</span>
              </div>
            )}

            {/* Instruction file indicator */}
            {assignment.instructionFile && (
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span>Has attachment</span>
              </div>
            )}
          </div>

          {/* Countdown timer for students */}
          {variant === 'student' && !isOverdue && assignment.status === 'published' && (
            <div className="mb-4">
              <CountdownTimer
                targetDate={assignment.dueDate}
                size="sm"
                variant="compact"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {variant === 'tutor' ? (
              <>
                <Button variant="secondary" size="sm" onClick={onView}>
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  View Submissions
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
                <Button variant="secondary" size="sm" onClick={onView}>
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  View Details
                </Button>
                {!isOverdue && assignment.status === 'published' && (
                  <Button size="sm" onClick={onSubmit}>
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    Submit Assignment
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
 * AssignmentCardCompact
 * Smaller card variant for list views
 */
export function AssignmentCardCompact({
  assignment,
  variant = 'tutor',
  onClick,
  className = ''
}) {
  const timeRemaining = getTimeRemaining(assignment.dueDate);
  const isOverdue = timeRemaining.expired;

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center p-4 bg-white border border-slate-200 rounded-lg
        hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer
        ${className}
      `}
    >
      <div className={`
        flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center
        ${isOverdue ? 'bg-rose-100' : 'bg-indigo-100'}
      `}>
        <FileText className={`h-5 w-5 ${isOverdue ? 'text-rose-500' : 'text-indigo-600'}`} />
      </div>

      <div className="ml-4 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-slate-900 truncate">
            {assignment.title}
          </h4>
          {assignment.status === 'draft' && (
            <Badge variant="default">Draft</Badge>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {assignment.totalMarks} marks · Due {formatDate(assignment.dueDate)}
        </p>
      </div>

      {!isOverdue && assignment.status === 'published' && (
        <CountdownTimer
          targetDate={assignment.dueDate}
          size="sm"
          showIcon={false}
          variant="compact"
        />
      )}
    </div>
  );
}

export default AssignmentCard;
