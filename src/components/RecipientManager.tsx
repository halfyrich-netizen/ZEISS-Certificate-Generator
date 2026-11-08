import React, { useState } from 'react';
import { Users, UserPlus, Trash2, ClipboardList, Check, X, Sparkles } from 'lucide-react';
import { SAMPLE_RECIPIENTS } from '../constants/defaults';

interface RecipientManagerProps {
  recipients: string[];
  activeRecipientIndex: number;
  onSelectRecipient: (index: number) => void;
  onAddRecipient: (name: string) => void;
  onRemoveRecipient: (index: number) => void;
  onSetRecipients: (names: string[]) => void;
}

export const RecipientManager: React.FC<RecipientManagerProps> = ({
  recipients,
  activeRecipientIndex,
  onSelectRecipient,
  onAddRecipient,
  onRemoveRecipient,
  onSetRecipients,
}) => {
  const [newRecipientInput, setNewRecipientInput] = useState('');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkTextInput, setBulkTextInput] = useState('');

  const handleAddSingle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newRecipientInput.trim();
    if (!trimmed) return;
    onAddRecipient(trimmed);
    setNewRecipientInput('');
  };

  const handleApplyBulk = () => {
    const lines = bulkTextInput
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (lines.length > 0) {
      onSetRecipients(lines);
      setIsBulkModalOpen(false);
      setBulkTextInput('');
    }
  };

  const handleLoadSamples = () => {
    onSetRecipients(SAMPLE_RECIPIENTS);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-700" />
          <h2 className="text-sm font-semibold text-slate-900">
            1. Recipients
          </h2>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded tabular-nums">
            {recipients.length} {recipients.length === 1 ? 'Person' : 'People'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Bulk Paste
          </button>
          <span className="text-slate-300">·</span>
          <button
            type="button"
            onClick={handleLoadSamples}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            title="Load sample doctors list"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Samples
          </button>
        </div>
      </div>

      {/* Single Add Input */}
      <form onSubmit={handleAddSingle} className="flex gap-2 mb-3">
        <input
          type="text"
          value={newRecipientInput}
          onChange={(e) => setNewRecipientInput(e.target.value)}
          placeholder="e.g. Dr. Andreas S. Anugrah, MD"
          className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!newRecipientInput.trim()}
          className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add
        </button>
      </form>

      {/* Recipient Chips List */}
      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
        {recipients.map((name, index) => {
          const isActive = index === activeRecipientIndex;
          return (
            <div
              key={`${name}-${index}`}
              onClick={() => onSelectRecipient(index)}
              className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs cursor-pointer transition-all ${
                isActive
                  ? 'bg-blue-100 text-blue-900 border border-blue-300 font-medium shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent'
              }`}
            >
              <span className="truncate max-w-[170px]" title={name}>
                {name}
              </span>
              {recipients.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveRecipient(index);
                  }}
                  className="text-slate-400 hover:text-rose-600 rounded p-0.5 transition-colors"
                  title="Remove recipient"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {recipients.length > 1 && (
        <p className="mt-2 text-[11px] text-slate-400">
          Click any recipient name above to preview their individual certificate on the right.
        </p>
      )}

      {/* Bulk Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">
                Bulk Paste Recipient Names
              </h3>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-xs text-slate-500 mb-2">
                Paste doctor names separated by line breaks or commas:
              </p>
              <textarea
                rows={6}
                value={bulkTextInput}
                onChange={(e) => setBulkTextInput(e.target.value)}
                placeholder={"Andreas S. Anugrah, MD\nDr. Budi Santoso, Sp.M\nClara Wijaya, MD\nDr. Hendra Gunawan, Sp.M"}
                className="w-full text-xs font-mono border border-slate-300 rounded-lg p-3 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBulk}
                disabled={!bulkTextInput.trim()}
                className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 rounded-lg shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                Import Names
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
