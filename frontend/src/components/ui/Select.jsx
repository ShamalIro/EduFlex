import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Select Component
 * Styled dropdown select input
 *
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {Array} props.options - Array of {value, label} objects
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message
 * @param {string} props.value - Selected value
 * @param {function} props.onChange - Change handler
 */
export function Select({
  label,
  options = [],
  placeholder = 'Select an option',
  error,
  value,
  onChange,
  disabled = false,
  className = '',
  id,
  ...props
}) {
  const selectId = id || props.name || Math.random().toString(36).substr(2, 9);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            block w-full rounded-lg border shadow-sm appearance-none
            pl-3 pr-10 py-2.5 text-sm
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
            }
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-rose-500">{error}</p>
      )}
    </div>
  );
}

export default Select;
