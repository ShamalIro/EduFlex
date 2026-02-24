import React from 'react';

export function Card({ children, className = '', onClick, hoverable = false }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden
        ${hoverable ? 'transition-shadow duration-200 hover:shadow-md cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
