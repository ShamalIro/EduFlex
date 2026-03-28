import React from 'react';
import { Plus, X, Check } from 'lucide-react';
import { Button } from '../../ui/Button';

export function MultipleChoiceEditor({ question, onChange }) {
  const options = question.options || [];

  const addOption = () => {
    onChange({
      ...question,
      options: [...options, { text: '', isCorrect: false }]
    });
  };

  const updateOption = (index, updates) => {
    const updated = options.map((opt, i) => {
      if (i === index) {
        return { ...opt, ...updates };
      }
      // If setting this option as correct, unset others
      if (updates.isCorrect) {
        return { ...opt, isCorrect: false };
      }
      return opt;
    });
    onChange({ ...question, options: updated });
  };

  const removeOption = (index) => {
    if (options.length <= 2) return;
    const updated = options.filter((_, i) => i !== index);
    onChange({ ...question, options: updated });
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">
        Answer Options
      </label>

      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateOption(index, { isCorrect: true })}
            className={`
              flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
              ${option.isCorrect
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-slate-300 hover:border-green-400'
              }
            `}
            title={option.isCorrect ? 'Correct answer' : 'Mark as correct'}
          >
            {option.isCorrect && <Check className="h-3 w-3" />}
          </button>

          <input
            type="text"
            value={option.text}
            onChange={(e) => updateOption(index, { text: e.target.value })}
            placeholder={`Option ${index + 1}`}
            className="flex-1 rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeOption(index)}
            disabled={options.length <= 2}
            className="text-slate-400 hover:text-rose-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={addOption}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Option
      </Button>

      {!options.some(o => o.isCorrect) && (
        <p className="text-sm text-amber-600">
          Click the circle to mark the correct answer
        </p>
      )}
    </div>
  );
}
