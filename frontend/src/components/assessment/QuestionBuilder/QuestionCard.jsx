import React from 'react';
import { ChevronDown, ChevronUp, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../../ui/Button';
import { QuestionTypeSelector } from './QuestionTypeSelector';
import { MultipleChoiceEditor } from './MultipleChoiceEditor';
import { TrueFalseEditor } from './TrueFalseEditor';
import { ShortAnswerEditor } from './ShortAnswerEditor';
import { FillInBlankEditor } from './FillInBlankEditor';

const QUESTION_TYPE_LABELS = {
  multiple_choice: 'Multiple Choice',
  true_false: 'True/False',
  short_answer: 'Short Answer',
  fill_in_blank: 'Fill in the Blank'
};

export function QuestionCard({
  question,
  index,
  isExpanded,
  onToggle,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  error
}) {
  const renderEditor = () => {
    const props = { question, onChange };

    switch (question.type) {
      case 'multiple_choice':
        return <MultipleChoiceEditor {...props} />;
      case 'true_false':
        return <TrueFalseEditor {...props} />;
      case 'short_answer':
        return <ShortAnswerEditor {...props} />;
      case 'fill_in_blank':
        return <FillInBlankEditor {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className={`border rounded-lg bg-white ${error ? 'border-rose-300' : 'border-slate-200'}`}>
      {/* Collapsed header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
            {index + 1}
          </span>
          <div>
            <p className="font-medium text-slate-900 line-clamp-1">
              {question.text || 'Untitled Question'}
            </p>
            <p className="text-sm text-slate-500">
              {QUESTION_TYPE_LABELS[question.type]} - {question.points} pt{question.points !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-slate-100 p-4 space-y-4">
          {/* Question text */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Question Text
            </label>
            <textarea
              value={question.text}
              onChange={(e) => onChange({ ...question, text: e.target.value })}
              placeholder="Enter your question here..."
              className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
              rows={2}
            />
          </div>

          {/* Type and points row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuestionTypeSelector
              value={question.type}
              onChange={(type) => onChange({
                ...question,
                type,
                // Reset type-specific fields
                options: type === 'true_false'
                  ? [{ text: 'True', isCorrect: false }, { text: 'False', isCorrect: false }]
                  : type === 'multiple_choice'
                    ? [{ text: '', isCorrect: false }, { text: '', isCorrect: false }]
                    : undefined,
                referenceAnswer: undefined,
                sentenceTemplate: undefined,
                blanks: undefined
              })}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Points
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={question.points}
                onChange={(e) => onChange({
                  ...question,
                  points: parseFloat(e.target.value) || 0
                })}
                className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
              />
            </div>
          </div>

          {/* Type-specific editor */}
          {renderEditor()}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                disabled={!canMoveUp}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                disabled={!canMoveDown}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>

          {error && (
            <p className="text-sm text-rose-600">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
