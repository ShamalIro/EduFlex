import React from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  CheckCircle,
  Circle,
  HelpCircle,
  Type,
  ToggleLeft,
  ListOrdered
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

/**
 * QuestionBuilder Component
 * Build individual questions with different types (MCQ, True/False, Short Answer)
 */
export function QuestionBuilder({
  question,
  index,
  onChange,
  onDelete,
  errors = {}
}) {
  // Question type icons
  const typeIcons = {
    mcq: ListOrdered,
    truefalse: ToggleLeft,
    shortanswer: Type
  };

  const TypeIcon = typeIcons[question.type] || HelpCircle;

  // Handle question field changes
  const handleFieldChange = (field, value) => {
    onChange(index, { ...question, [field]: value });
  };

  // Handle points change - only allow positive integers
  const handlePointsChange = (e) => {
    const value = e.target.value;
    // Only allow positive numbers (no -, +, e, E)
    if (value === '' || /^[0-9]+$/.test(value)) {
      const numValue = parseInt(value) || 0;
      // Max 100 points per question
      if (numValue <= 100) {
        handleFieldChange('points', numValue || '');
      }
    }
  };

  // Handle points keydown - prevent invalid characters
  const handlePointsKeyDown = (e) => {
    if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
      e.preventDefault();
    }
  };

  // Handle option change for MCQ
  const handleOptionChange = (optIndex, value) => {
    const newOptions = [...question.options];
    newOptions[optIndex] = value;
    onChange(index, { ...question, options: newOptions });
  };

  // Add new MCQ option
  const addOption = () => {
    const newOptions = [...(question.options || []), ''];
    onChange(index, { ...question, options: newOptions });
  };

  // Remove MCQ option
  const removeOption = (optIndex) => {
    const newOptions = question.options.filter((_, i) => i !== optIndex);
    // Adjust correct answer if needed
    let newCorrectAnswer = question.correctAnswer;
    if (question.correctAnswer === optIndex) {
      newCorrectAnswer = 0;
    } else if (question.correctAnswer > optIndex) {
      newCorrectAnswer = question.correctAnswer - 1;
    }
    onChange(index, { ...question, options: newOptions, correctAnswer: newCorrectAnswer });
  };

  // Set correct answer for MCQ
  const setCorrectOption = (optIndex) => {
    onChange(index, { ...question, correctAnswer: optIndex });
  };

  return (
    <Card className="p-4 border-l-4 border-l-indigo-500">
      {/* Question Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex items-center gap-2 cursor-move text-slate-400">
          <GripVertical className="h-5 w-5" />
          <span className="text-sm font-medium text-slate-600">Q{index + 1}</span>
        </div>

        <div className="flex-1">
          {/* Question Type Selector */}
          <div className="flex items-center gap-3 mb-3">
            <Select
              value={question.type}
              onChange={(e) => handleFieldChange('type', e.target.value)}
              options={[
                { value: 'mcq', label: 'Multiple Choice' },
                { value: 'truefalse', label: 'True/False' },
                { value: 'shortanswer', label: 'Short Answer' }
              ]}
              className="w-44"
            />

            {/* Points - Only positive integers */}
            <div className="w-24">
              <input
                type="text"
                inputMode="numeric"
                value={question.points || ''}
                onChange={handlePointsChange}
                onKeyDown={handlePointsKeyDown}
                placeholder="Points"
                className="block w-full rounded-lg border border-slate-300 shadow-sm px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <Badge variant="info" className="ml-auto">
              <TypeIcon className="h-3 w-3 mr-1" />
              {question.type === 'mcq' ? 'MCQ' :
               question.type === 'truefalse' ? 'T/F' : 'Short'}
            </Badge>
          </div>

          {/* Question Text */}
          <Textarea
            placeholder="Enter your question..."
            value={question.text}
            onChange={(e) => handleFieldChange('text', e.target.value)}
            error={errors.text}
            rows={2}
            className="mb-4"
          />

          {/* Question Type Specific Content */}
          {question.type === 'mcq' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 mb-2">
                Click on an option to mark it as correct
              </p>
              {(question.options || ['', '']).map((option, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrectOption(optIndex)}
                    className={`flex-shrink-0 p-1 rounded-full transition-colors ${
                      question.correctAnswer === optIndex
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {question.correctAnswer === optIndex ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>

                  <Input
                    placeholder={`Option ${optIndex + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(optIndex, e.target.value)}
                    className="flex-1"
                    error={errors.options?.[optIndex]}
                  />

                  {(question.options?.length || 0) > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(optIndex)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              {(question.options?.length || 0) < 6 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addOption}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              )}
              {errors.options && typeof errors.options === 'string' && (
                <p className="text-sm text-rose-500">{errors.options}</p>
              )}
            </div>
          )}

          {question.type === 'truefalse' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 mb-2">
                Select the correct answer
              </p>
              <div className="flex gap-4">
                {[true, false].map((value) => (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => handleFieldChange('correctAnswer', value)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors
                      ${question.correctAnswer === value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }
                    `}
                  >
                    {question.correctAnswer === value ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                    {value ? 'True' : 'False'}
                  </button>
                ))}
              </div>
              {errors.correctAnswer && (
                <p className="text-sm text-rose-500">{errors.correctAnswer}</p>
              )}
            </div>
          )}

          {question.type === 'shortanswer' && (
            <div>
              <Input
                label="Expected Answer"
                placeholder="Enter the expected answer..."
                value={question.expectedAnswer || ''}
                onChange={(e) => handleFieldChange('expectedAnswer', e.target.value)}
                error={errors.expectedAnswer}
                hint="This will be used for manual grading reference"
              />
            </div>
          )}
        </div>

        {/* Delete Question */}
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </Card>
  );
}

/**
 * Create a new empty question
 */
export function createEmptyQuestion(type = 'mcq') {
  const baseQuestion = {
    id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    text: '',
    points: 10
  };

  switch (type) {
    case 'mcq':
      return {
        ...baseQuestion,
        options: ['', '', '', ''],
        correctAnswer: 0
      };
    case 'truefalse':
      return {
        ...baseQuestion,
        correctAnswer: true
      };
    case 'shortanswer':
      return {
        ...baseQuestion,
        expectedAnswer: ''
      };
    default:
      return baseQuestion;
  }
}

export default QuestionBuilder;
