import React from 'react';
import { Check } from 'lucide-react';

export function TrueFalseEditor({ question, onChange }) {
  // Ensure we have exactly 2 options
  const options = question.options?.length === 2
    ? question.options
    : [{ text: 'True', isCorrect: false }, { text: 'False', isCorrect: false }];

  const setCorrect = (index) => {
    const updated = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }));
    onChange({ ...question, options: updated });
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">
        Correct Answer
      </label>

      <div className="flex gap-4">
        {options.map((option, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCorrect(index)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-colors flex-1 justify-center
              ${option.isCorrect
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }
            `}
          >
            <div className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${option.isCorrect
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-slate-300'
              }
            `}>
              {option.isCorrect && <Check className="h-3 w-3" />}
            </div>
            <span className="font-medium">{option.text}</span>
          </button>
        ))}
      </div>

      {!options.some(o => o.isCorrect) && (
        <p className="text-sm text-amber-600">
          Select the correct answer
        </p>
      )}
    </div>
  );
}
