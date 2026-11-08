import React from 'react';
import { Loader2, CheckCircle2, FileArchive, FileText } from 'lucide-react';

interface ExportProgressModalProps {
  isOpen: boolean;
  type: 'zip' | 'combined' | 'single';
  current: number;
  total: number;
  currentRecipientName: string;
  isComplete: boolean;
  onClose: () => void;
}

export const ExportProgressModal: React.FC<ExportProgressModalProps> = ({
  isOpen,
  type,
  current,
  total,
  currentRecipientName,
  isComplete,
  onClose,
}) => {
  if (!isOpen) return null;

  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-center">
        {isComplete ? (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-3 animate-bounce" />
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Generation Complete!
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              {type === 'zip'
                ? `All ${total} certificates have been archived and your download will begin automatically.`
                : `Combined ${total}-page document has been compiled and downloaded.`}
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <Loader2 className="w-10 h-10 text-blue-700 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                {type === 'zip' ? (
                  <FileArchive className="w-4 h-4 text-blue-700" />
                ) : (
                  <FileText className="w-4 h-4 text-blue-700" />
                )}
              </div>
            </div>

            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              {type === 'zip'
                ? 'Building ZIP Archive of Certificates'
                : 'Compiling Combined Multi-Page PDF'}
            </h3>

            <p className="text-xs text-slate-500 mb-3 truncate max-w-xs">
              Rendering: <span className="font-medium text-slate-700">{currentRecipientName}</span>
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden border border-slate-200">
              <div
                className="bg-blue-700 h-full rounded-full transition-all duration-200"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="flex justify-between w-full text-[11px] text-slate-400 font-mono">
              <span>{percentage}%</span>
              <span>
                {current} of {total}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
