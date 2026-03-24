import React, { useRef, useState } from 'react';
import { Upload, X, File, FileText, Image, Archive, AlertCircle } from 'lucide-react';
import { formatFileSize } from '../../data/mockData';

/**
 * FileUpload Component
 * Handles single file upload with drag & drop support
 *
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {function} props.onFileSelect - Callback when file is selected
 * @param {string[]} props.acceptedTypes - Array of accepted MIME types
 * @param {number} props.maxSize - Maximum file size in bytes
 * @param {Object} props.value - Current file object
 * @param {string} props.error - Error message
 * @param {string} props.hint - Helper text
 */
export function FileUpload({
  label,
  onFileSelect,
  acceptedTypes = [],
  maxSize = 10 * 1024 * 1024, // 10MB default
  value,
  error,
  hint,
  className = ''
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');

  // Get file icon based on type
  const getFileIcon = (file) => {
    if (!file) return File;
    const type = file.type || '';
    if (type.startsWith('image/')) return Image;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    if (type.includes('zip') || type.includes('archive')) return Archive;
    return File;
  };

  // Validate file
  const validateFile = (file) => {
    setLocalError('');

    // Check file size
    if (file.size > maxSize) {
      const errorMsg = `File size exceeds ${formatFileSize(maxSize)}`;
      setLocalError(errorMsg);
      return false;
    }

    // Check file type
    if (acceptedTypes.length > 0) {
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });
      if (!isValidType) {
        setLocalError('Invalid file type');
        return false;
      }
    }

    return true;
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  };

  // Clear selected file
  const handleClear = () => {
    onFileSelect(null);
    setLocalError('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const FileIcon = getFileIcon(value);
  const displayError = error || localError;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}

      {!value ? (
        // Upload area
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors duration-200
            ${isDragging
              ? 'border-indigo-500 bg-indigo-50'
              : displayError
                ? 'border-rose-300 bg-rose-50'
                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            onChange={handleFileChange}
            accept={acceptedTypes.join(',')}
            className="hidden"
          />

          <Upload
            className={`mx-auto h-10 w-10 mb-3 ${
              isDragging ? 'text-indigo-500' : 'text-slate-400'
            }`}
          />

          <p className="text-sm font-medium text-slate-700">
            {isDragging ? 'Drop file here' : 'Click to upload or drag and drop'}
          </p>

          {hint && (
            <p className="mt-1 text-xs text-slate-500">{hint}</p>
          )}

          {acceptedTypes.length > 0 && (
            <p className="mt-2 text-xs text-slate-400">
              Accepted: {acceptedTypes.map(t => t.split('/')[1]).join(', ')}
            </p>
          )}
        </div>
      ) : (
        // File preview
        <div className="flex items-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <FileIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {value.name}
            </p>
            <p className="text-xs text-slate-500">
              {formatFileSize(value.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="ml-3 flex-shrink-0 p-1 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {displayError && (
        <p className="mt-1 text-sm text-rose-500 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {displayError}
        </p>
      )}
    </div>
  );
}

export default FileUpload;
