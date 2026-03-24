import React from 'react';

/**
 * Textarea Component
 * Multi-line text input with consistent styling
 *
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.error - Error message
 * @param {string} props.hint - Helper text
 * @param {number} props.rows - Number of visible rows
 * @param {boolean} props.resizable - Allow resizing
 */
export function Textarea({
  label,
  error,
  hint,
  rows = 4,
  resizable = true,
  className = '',
  id,
  ...props
}) {
  const textareaId = id || props.name || Math.random().toString(36).substr(2, 9);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          {label}
        </label>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        className={`
          block w-full rounded-lg border shadow-sm
          px-3 py-2.5 text-sm
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
          ${!resizable ? 'resize-none' : 'resize-y'}
          ${error
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
          }
        `}
        {...props}
      />

      {hint && !error && (
        <p className="mt-1 text-sm text-slate-500">{hint}</p>
      )}

      {error && (
        <p className="mt-1 text-sm text-rose-500">{error}</p>
      )}
    </div>
  );
}

export default Textarea;
