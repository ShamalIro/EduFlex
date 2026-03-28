import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '../../ui/Button';

export function RubricBuilder({ rubric = [], maxPoints, onChange }) {
  const rubricTotal = rubric.reduce((sum, c) => sum + (c.maxPoints || 0), 0);
  const remaining = maxPoints - rubricTotal;

  const addCriterion = () => {
    onChange([
      ...rubric,
      {
        name: '',
        description: '',
        maxPoints: Math.max(0, remaining),
        order: rubric.length
      }
    ]);
  };

  const updateCriterion = (index, updates) => {
    const updated = rubric.map((c, i) =>
      i === index ? { ...c, ...updates } : c
    );
    onChange(updated);
  };

  const removeCriterion = (index) => {
    const updated = rubric
      .filter((_, i) => i !== index)
      .map((c, i) => ({ ...c, order: i }));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-slate-900">Grading Rubric</h4>
          <p className="text-sm text-slate-500">
            {rubricTotal} of {maxPoints} points assigned
            {remaining > 0 && ` (${remaining} remaining)`}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addCriterion}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Criterion
        </Button>
      </div>

      {rubric.length === 0 ? (
        <div className="p-6 border-2 border-dashed border-slate-200 rounded-lg text-center">
          <p className="text-slate-500 mb-3">No rubric criteria defined</p>
          <Button type="button" size="sm" onClick={addCriterion}>
            <Plus className="h-4 w-4 mr-1" />
            Add First Criterion
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {rubric.map((criterion, index) => (
            <div
              key={criterion._id || index}
              className="p-4 bg-slate-50 rounded-lg space-y-3"
            >
              <div className="flex items-start gap-3">
                <GripVertical className="h-5 w-5 text-slate-400 mt-2 cursor-move flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Criterion Name
                      </label>
                      <input
                        type="text"
                        value={criterion.name}
                        onChange={(e) => updateCriterion(index, {
                          name: e.target.value
                        })}
                        placeholder="e.g., Code Quality"
                        className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Points
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={criterion.maxPoints}
                        onChange={(e) => updateCriterion(index, {
                          maxPoints: parseInt(e.target.value) || 0
                        })}
                        className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={criterion.description || ''}
                      onChange={(e) => updateCriterion(index, {
                        description: e.target.value
                      })}
                      className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                      rows={2}
                      placeholder="Describe what this criterion evaluates..."
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCriterion(index)}
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {rubricTotal > maxPoints && (
        <p className="text-sm text-rose-600">
          Warning: Rubric total ({rubricTotal}) exceeds max points ({maxPoints})
        </p>
      )}
    </div>
  );
}
