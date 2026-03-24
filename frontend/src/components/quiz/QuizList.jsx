import React, { useState } from 'react';
import { Plus, Search, HelpCircle } from 'lucide-react';
import { QuizCard, QuizCardCompact } from './QuizCard';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

/**
 * QuizList Component
 * Displays a list of quizzes with filtering and actions
 *
 * @param {Object} props
 * @param {Array} props.quizzes - Array of quiz objects
 * @param {string} props.variant - 'tutor' | 'student'
 * @param {boolean} props.showAddButton - Whether to show add button
 * @param {function} props.onAdd - Add new quiz handler
 * @param {function} props.onView - View quiz handler
 * @param {function} props.onEdit - Edit quiz handler
 * @param {function} props.onDelete - Delete quiz handler
 * @param {function} props.onStart - Start quiz handler (student)
 * @param {Object} props.quizResults - Map of quiz results by quizId (student)
 * @param {string} props.viewMode - 'full' | 'compact'
 */
export function QuizList({
  quizzes = [],
  variant = 'tutor',
  showAddButton = true,
  onAdd,
  onView,
  onEdit,
  onDelete,
  onStart,
  quizResults = {},
  viewMode = 'full',
  emptyMessage = 'No quizzes found',
  className = ''
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Filter and sort quizzes
  const filteredQuizzes = quizzes
    // Search filter
    .filter(q => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        q.title.toLowerCase().includes(query) ||
        q.description?.toLowerCase().includes(query)
      );
    })
    // Status filter
    .filter(q => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'published') return q.status === 'published';
      if (statusFilter === 'draft') return q.status === 'draft';
      return true;
    })
    // Sort
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'questions':
          return (b.questions?.length || 0) - (a.questions?.length || 0);
        case 'duration':
          return b.timerDuration - a.timerDuration;
        case 'recent':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex-1 flex gap-3">
          {/* Search */}
          <div className="flex-1 max-w-xs">
            <Input
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
              className="h-9"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Draft' }
            ]}
            className="w-36"
          />

          {/* Sort */}
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'recent', label: 'Recently Added' },
              { value: 'title', label: 'Title' },
              { value: 'questions', label: 'Most Questions' },
              { value: 'duration', label: 'Longest Duration' }
            ]}
            className="w-40"
          />
        </div>

        {/* Add Button */}
        {showAddButton && variant === 'tutor' && (
          <Button onClick={onAdd} className="flex-shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Add Quiz
          </Button>
        )}
      </div>

      {/* Quizzes List */}
      {filteredQuizzes.length === 0 ? (
        // Empty state
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <HelpCircle className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">
            {searchQuery || statusFilter !== 'all' ? 'No matching quizzes' : emptyMessage}
          </h3>
          <p className="text-slate-500 mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first quiz'
            }
          </p>
          {showAddButton && variant === 'tutor' && !searchQuery && statusFilter === 'all' && (
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'compact' ? 'space-y-2' : 'space-y-4'}>
          {/* Results count */}
          <p className="text-sm text-slate-500">
            Showing {filteredQuizzes.length} of {quizzes.length} quizzes
          </p>

          {/* Quiz cards */}
          {viewMode === 'compact' ? (
            filteredQuizzes.map(quiz => (
              <QuizCardCompact
                key={quiz.id}
                quiz={quiz}
                variant={variant}
                onClick={() => onView && onView(quiz)}
              />
            ))
          ) : (
            filteredQuizzes.map(quiz => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                variant={variant}
                onView={() => onView && onView(quiz)}
                onEdit={() => onEdit && onEdit(quiz)}
                onDelete={() => onDelete && onDelete(quiz)}
                onStart={() => onStart && onStart(quiz)}
                previousResult={quizResults[quiz.id]}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default QuizList;
