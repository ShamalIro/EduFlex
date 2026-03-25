import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../ui/Button';
import { QuestionCard } from './QuestionCard';

const EMPTY_QUESTION = {
  type: 'multiple_choice',
  text: '',
  points: 1,
  options: [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]
};

export function QuestionBuilder({ questions = [], onChange, errors = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const addQuestion = () => {
    const newQuestion = {
      ...EMPTY_QUESTION,
      order: questions.length
    };
    onChange([...questions, newQuestion]);
    setExpandedIndex(questions.length);
  };

  const updateQuestion = (index, updatedQuestion) => {
    const updated = questions.map((q, i) =>
      i === index ? { ...updatedQuestion, order: i } : q
    );
    onChange(updated);
  };

  const removeQuestion = (index) => {
    const updated = questions
      .filter((_, i) => i !== index)
      .map((q, i) => ({ ...q, order: i }));
    onChange(updated);
    setExpandedIndex(null);
  };

  const moveQuestion = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= questions.length) return;

    const updated = [...questions];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    // Recalculate order
    const reordered = updated.map((q, i) => ({ ...q, order: i }));
    onChange(reordered);
    setExpandedIndex(toIndex);
  };

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-slate-900">Questions</h3>
          <p className="text-sm text-slate-500">
            {questions.length} question{questions.length !== 1 ? 's' : ''} -{' '}
            {totalPoints} point{totalPoints !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={addQuestion}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="p-8 text-center border-dashed border-2 border-slate-200 rounded-lg">
          <p className="text-slate-500 mb-4">No questions added yet</p>
          <Button type="button" onClick={addQuestion}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Question
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <QuestionCard
              key={question._id || index}
              question={question}
              index={index}
              isExpanded={expandedIndex === index}
              onToggle={() => setExpandedIndex(
                expandedIndex === index ? null : index
              )}
              onChange={(updated) => updateQuestion(index, updated)}
              onRemove={() => removeQuestion(index)}
              onMoveUp={() => moveQuestion(index, index - 1)}
              onMoveDown={() => moveQuestion(index, index + 1)}
              canMoveUp={index > 0}
              canMoveDown={index < questions.length - 1}
              error={errors[index]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
