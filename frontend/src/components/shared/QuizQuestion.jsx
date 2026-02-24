import React from 'react';

export function QuizQuestion({
  question,
  selectedAnswer,
  onSelect,
  questionNumber
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-4">
        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
          {questionNumber}
        </span>
        <h3 className="text-lg font-medium text-slate-900 pt-1">
          {question.text}
        </h3>
      </div>

      <div className="space-y-3 pl-12">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          return (
            <div
              key={index}
              onClick={() => onSelect(index)}
              className={`
                relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                ${isSelected ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'}
              `}>

              <div
                className={`
                h-5 w-5 rounded-full border flex items-center justify-center mr-3
                ${isSelected ? 'border-indigo-600' : 'border-slate-400'}
              `}>

                {isSelected &&
                <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                }
              </div>
              <span
                className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>

                {option}
              </span>
            </div>);

        })}
      </div>
    </div>);

}
