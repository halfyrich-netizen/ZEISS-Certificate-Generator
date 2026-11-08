import React, { useState } from 'react';
import { Type, Upload, CheckCircle2, AlertCircle, X, RefreshCw, FolderSearch } from 'lucide-react';
import {
  queryAndLoadLocalZeissFonts,
  loadFontFiles,
  clearFontsFromDb,
} from '../utils/fontManager';

interface FontManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isZeissFontActive: boolean;
  loadedFontNames: string[];
  onFontsUpdated: () => void;
}

export const FontManagerModal: React.FC<FontManagerModalProps> = ({
  isOpen,
  onClose,
  isZeissFontActive,
  loadedFontNames,
  onFontsUpdated,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleScanLocal = async () => {
    setIsScanning(true);
    setStatusMessage(null);
    try {
      const res = await queryAndLoadLocalZeissFonts();
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        onFontsUpdated();
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error scanning local fonts' });
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileDrop = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLElement>) => {
    let files: FileList | null = null;

    if ('dataTransfer' in e) {
      e.preventDefault();
      files = e.dataTransfer.files;
    } else if (e.target.files) {
      files = e.target.files;
    }

    if (!files || files.length === 0) return;

    try {
      const res = await loadFontFiles(files);
      setStatusMessage({
        type: 'success',
        text: `Loaded ${res.count} font file(s): ${res.names.join(', ')}`,
      });
      onFontsUpdated();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to read font files' });
    }
  };

  const handleClear = async () => {
    await clearFontsFromDb();
    setStatusMessage({ type: 'info', text: 'Cached font files cleared. Refreshing page.' });
    onFontsUpdated();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-blue-700" />
            <h2 className="text-base font-semibold text-slate-900">
              ZEISS Font Manager
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="p-6 space-y-5">
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              isZeissFontActive || loadedFontNames.length > 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {isZeissFontActive || loadedFontNames.length > 0 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">
                {isZeissFontActive || loadedFontNames.length > 0
                  ? 'Official ZEISS Font Active'
                  : 'Approximate Fallback Mode'}
              </div>
              <p className="text-xs mt-1 text-slate-600">
                {isZeissFontActive || loadedFontNames.length > 0
                  ? 'Rendering with licensed ZEISS Frutiger Next W1G typography. Letter spacing and line lengths are exact.'
                  : 'Currently falling back to Arial Narrow / Roboto Condensed. Connect your local ZEISS font files below for exact 100% specification match.'}
              </p>
            </div>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Option A: Direct Local File Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Option 1: Select or Drop ZEISS Font Files from Computer
            </label>
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 cursor-pointer bg-slate-50 hover:bg-blue-50/20 transition-colors"
            >
              <Upload className="w-7 h-7 text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-slate-700">
                Click to browse or drop font files (.otf, .ttf, .woff)
              </span>
              <span className="text-[11px] text-slate-500 mt-1 text-center">
                Select <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">ZEISSFrutigerNextW1G-*.otf</code> files from your local font folder
              </span>
              <input
                type="file"
                multiple
                accept=".otf,.ttf,.woff,.woff2"
                onChange={handleFileDrop}
                className="hidden"
              />
            </label>
          </div>

          {/* Option B: Local Font Access API Scan */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Option 2: Detect Installed Fonts from System (Chrome / Edge)
            </label>
            <button
              onClick={handleScanLocal}
              disabled={isScanning}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors disabled:opacity-50"
            >
              {isScanning ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FolderSearch className="w-3.5 h-3.5" />
              )}
              {isScanning ? 'Scanning System Fonts...' : 'Detect Installed ZEISS Fonts Automatically'}
            </button>
          </div>

          {/* Loaded Font List */}
          {loadedFontNames.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  Cached Local Fonts ({loadedFontNames.length}):
                </span>
                <button
                  onClick={handleClear}
                  className="text-[11px] text-rose-600 hover:underline"
                >
                  Clear Cached Fonts
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {loadedFontNames.map((name, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-mono"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            Close & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
