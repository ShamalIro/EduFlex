import React from 'react';

const FILE_TYPES = [
  { value: 'pdf', label: 'PDF' },
  { value: 'doc', label: 'DOC' },
  { value: 'docx', label: 'DOCX' },
  { value: 'txt', label: 'TXT' },
  { value: 'zip', label: 'ZIP' },
  { value: 'rar', label: 'RAR' },
  { value: 'jpg', label: 'JPG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'ppt', label: 'PPT' },
  { value: 'pptx', label: 'PPTX' },
  { value: 'xls', label: 'XLS' },
  { value: 'xlsx', label: 'XLSX' }
];

export function FileRequirementsEditor({ requirements, onChange }) {
  const current = requirements || {
    allowedTypes: ['pdf', 'doc', 'docx'],
    maxFileSize: 10,
    maxFiles: 1,
    required: true
  };

  const toggleFileType = (type) => {
    const types = current.allowedTypes || [];
    const updated = types.includes(type)
      ? types.filter(t => t !== type)
      : [...types, type];
    onChange({ ...current, allowedTypes: updated });
  };

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
      <h4 className="font-medium text-slate-900">File Requirements</h4>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Allowed File Types
        </label>
        <div className="flex flex-wrap gap-2">
          {FILE_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => toggleFileType(type.value)}
              className={`
                px-3 py-1.5 text-sm rounded-full border transition-colors
                ${current.allowedTypes?.includes(type.value)
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }
              `}
            >
              .{type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Max File Size (MB)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={current.maxFileSize}
            onChange={(e) => onChange({
              ...current,
              maxFileSize: parseInt(e.target.value) || 10
            })}
            className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Max Number of Files
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={current.maxFiles}
            onChange={(e) => onChange({
              ...current,
              maxFiles: parseInt(e.target.value) || 1
            })}
            className="block w-full rounded-lg border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="fileRequired"
          checked={current.required}
          onChange={(e) => onChange({ ...current, required: e.target.checked })}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="fileRequired" className="text-sm text-slate-700">
          File submission is required
        </label>
      </div>
    </div>
  );
}
