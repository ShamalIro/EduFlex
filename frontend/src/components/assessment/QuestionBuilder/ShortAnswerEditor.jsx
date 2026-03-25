import React from 'react';

export function ShortAnswerEditor({ question, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Reference Answer (for grading)
        </label>
        <textarea
          value={question.referenceAnswer || ''}
          onChange={(e) => onChange({
            ...question,
            referenceAnswer: e.target.value
          })}
          className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
          rows={3}
          placeholder="Enter the expected answer or key points to look for when grading..."
        />
        <p className="mt-1 text-sm text-slate-500">
          This will be shown to graders as a reference. Short answer questions require manual grading.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="caseSensitive"
          checked={question.caseSensitive || false}
          onChange={(e) => onChange({
            ...question,
            caseSensitive: e.target.checked
          })}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="caseSensitive" className="text-sm text-slate-700">
          Case sensitive matching (for auto-grading hints)
        </label>
      </div>
    </div>
  );
}
