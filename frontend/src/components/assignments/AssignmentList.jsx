import React, { useState } from 'react';
import { Plus, Search, Filter, FileText, SortAsc } from 'lucide-react';
import { AssignmentCard, AssignmentCardCompact } from './AssignmentCard';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

/**
 * AssignmentList Component
 * Displays a list of assignments with filtering and actions
 *
 * @param {Object} props
 * @param {Array} props.assignments - Array of assignment objects
 * @param {string} props.variant - 'tutor' | 'student'
 * @param {boolean} props.showAddButton - Whether to show add button
 * @param {function} props.onAdd - Add new assignment handler
 * @param {function} props.onView - View assignment handler
 * @param {function} props.onEdit - Edit assignment handler
 * @param {function} props.onDelete - Delete assignment handler
 * @param {function} props.onSubmit - Submit assignment handler (student)
 * @param {string} props.viewMode - 'full' | 'compact'
 */
export function AssignmentList({
  assignments = [],
  variant = 'tutor',
  showAddButton = true,
  onAdd,
  onView,
  onEdit,
  onDelete,
  onSubmit,
  viewMode = 'full',
  emptyMessage = 'No assignments found',
  className = ''
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  // Filter and sort assignments
  const filteredAssignments = assignments
    // Search filter
    .filter(a => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query)
      );
    })
    // Status filter
    .filter(a => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'published') return a.status === 'published';
      if (statusFilter === 'draft') return a.status === 'draft';
      if (statusFilter === 'overdue') {
        const dueDate = new Date(a.dueDate);
        return dueDate < new Date() && a.status === 'published';
      }
      return true;
    })
    // Sort
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'marks':
          return b.totalMarks - a.totalMarks;
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
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
              placeholder="Search assignments..."
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
              { value: 'draft', label: 'Draft' },
              { value: 'overdue', label: 'Overdue' }
            ]}
            className="w-36"
          />

          {/* Sort */}
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'dueDate', label: 'Due Date' },
              { value: 'title', label: 'Title' },
              { value: 'marks', label: 'Marks' },
              { value: 'recent', label: 'Recently Added' }
            ]}
            className="w-36"
          />
        </div>

        {/* Add Button */}
        {showAddButton && variant === 'tutor' && (
          <Button onClick={onAdd} className="flex-shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Add Assignment
          </Button>
        )}
      </div>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        // Empty state
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">
            {searchQuery || statusFilter !== 'all' ? 'No matching assignments' : emptyMessage}
          </h3>
          <p className="text-slate-500 mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first assignment'
            }
          </p>
          {showAddButton && variant === 'tutor' && !searchQuery && statusFilter === 'all' && (
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'compact' ? 'space-y-2' : 'space-y-4'}>
          {/* Results count */}
          <p className="text-sm text-slate-500">
            Showing {filteredAssignments.length} of {assignments.length} assignments
          </p>

          {/* Assignment cards */}
          {viewMode === 'compact' ? (
            filteredAssignments.map(assignment => (
              <AssignmentCardCompact
                key={assignment.id}
                assignment={assignment}
                variant={variant}
                onClick={() => onView && onView(assignment)}
              />
            ))
          ) : (
            filteredAssignments.map(assignment => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                variant={variant}
                onView={() => onView && onView(assignment)}
                onEdit={() => onEdit && onEdit(assignment)}
                onDelete={() => onDelete && onDelete(assignment)}
                onSubmit={() => onSubmit && onSubmit(assignment)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default AssignmentList;
