import React from 'react';
import { Plus, X, Info } from 'lucide-react';
import { Button } from '../../ui/Button';

export function FillInBlankEditor({ question, onChange }) {
  const blanks = question.blanks || [];

  const updateTemplate = (template) => {
    // Count blanks in template (marked as ___)
    const blankMatches = template.match(/___/g) || [];
    const blankCount = blankMatches.length;

    // Adjust blanks array to match
    let updatedBlanks = [...blanks];
    while (updatedBlanks.length < blankCount) {
      updatedBlanks.push({
        position: updatedBlanks.length,
        correctAnswers: ['']
      });
    }
    updatedBlanks = updatedBlanks.slice(0, blankCount);

    onChange({
      ...question,
      sentenceTemplate: template,
      blanks: updatedBlanks
    });
  };

  const updateBlankAnswer = (blankIndex, answerIndex, value) => {
    const updated = blanks.map((blank, bi) => {
      if (bi !== blankIndex) return blank;
      const answers = [...blank.correctAnswers];
      answers[answerIndex] = value;
      return { ...blank, correctAnswers: answers };
    });
    onChange({ ...question, blanks: updated });
  };

  const addAlternateAnswer = (blankIndex) => {
    const updated = blanks.map((blank, bi) => {
      if (bi !== blankIndex) return blank;
      return {
        ...blank,
        correctAnswers: [...blank.correctAnswers, '']
      };
    });
    onChange({ ...question, blanks: updated });
  };

  const removeAlternateAnswer = (blankIndex, answerIndex) => {
    const updated = blanks.map((blank, bi) => {
      if (bi !== blankIndex) return blank;
      if (blank.correctAnswers.length <= 1) return blank;
      return {
        ...blank,
        correctAnswers: blank.correctAnswers.filter((_, ai) => ai !== answerIndex)
      };
    });
    onChange({ ...question, blanks: updated });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Sentence Template
        </label>
        <textarea
          value={question.sentenceTemplate || ''}
          onChange={(e) => updateTemplate(e.target.value)}
          className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
          rows={2}
          placeholder="The capital of France is ___. Use ___ to mark blanks."
        />
        <p className="mt-1 text-sm text-slate-500 flex items-center gap-1">
          <Info className="h-4 w-4" />
          Use ___ (three underscores) to mark each blank position
        </p>
      </div>

      {blanks.length > 0 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Correct Answers for Each Blank
          </label>

          {blanks.map((blank, blankIndex) => (
            <div key={blankIndex} className="p-3 bg-slate-50 rounded-lg space-y-2">
              <p className="text-sm font-medium text-slate-600">
                Blank #{blankIndex + 1}
              </p>

              {blank.correctAnswers.map((answer, answerIndex) => (
                <div key={answerIndex} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => updateBlankAnswer(
                      blankIndex,
                      answerIndex,
                      e.target.value
                    )}
                    placeholder={answerIndex === 0 ? 'Correct answer' : 'Alternate answer'}
                    className="flex-1 rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                  />
                  {answerIndex > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAlternateAnswer(blankIndex, answerIndex)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addAlternateAnswer(blankIndex)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Alternate Answer
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
