import React, { useState } from 'react';
import { X, Upload, Check } from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (names: string[]) => void;
  className: string;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  className,
}) => {
  const [rawText, setRawText] = useState('');

  if (!isOpen) return null;

  const handleImport = () => {
    if (!rawText.trim()) return;

    // Split by newlines, commas, or semicolons
    const lines = rawText
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Remove duplicates if any
    const uniqueNames = Array.from(new Set(lines));

    if (uniqueNames.length > 0) {
      onImport(uniqueNames);
      setRawText('');
      onClose();
    }
  };

  const samplePaste = () => {
    setRawText('Noah Miller\nOlivia Davis\nEthan Garcia\nAva Rodriguez\nLucas Wilson\nIsabella Taylor');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Bulk Import Students to {className}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Paste a list of student names below. You can separate names by newlines, commas, or semicolons.
          </p>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste student names here..."
            className="w-full h-48 p-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono resize-none"
          />

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Detected:{' '}
              <strong className="text-indigo-600 dark:text-indigo-400 font-medium">
                {
                  rawText
                    .split(/[\n,;]+/)
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0).length
                }
              </strong>{' '}
              names
            </span>
            <button
              type="button"
              onClick={samplePaste}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Insert sample names
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!rawText.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
          >
            <Check className="w-4 h-4" />
            Add Students
          </button>
        </div>
      </div>
    </div>
  );
};
