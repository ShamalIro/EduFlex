import React from 'react';

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice', description: 'Select one correct answer' },
  { value: 'true_false', label: 'True/False', description: 'Binary choice question' },
  { value: 'short_answer', label: 'Short Answer', description: 'Text-based response' },
  { value: 'fill_in_blank', label: 'Fill in the Blank', description: 'Complete the sentence' }
];

export function QuestionTypeSelector({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Question Type
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 bg-white"
      >
        {QUESTION_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  );
}
