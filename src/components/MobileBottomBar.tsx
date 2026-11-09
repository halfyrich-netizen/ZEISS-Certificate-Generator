import React from 'react';
import { Eye, Download, FileArchive, Printer } from 'lucide-react';

interface MobileBottomBarProps {
  onOpenPreview: () => void;
  onExportCurrent: () => void;
  onExportBatchZip: () => void;
  onPrint: () => void;
  recipientCount: number;
  activeRecipientIndex: number;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  onOpenPreview,
  onExportCurrent,
  onExportBatchZip,
  onPrint,
  recipientCount,
  activeRecipientIndex,
}) => {
  return (
    <div className="no-print fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-3.5 py-2.5 shadow-xl flex items-center justify-between gap-2 pb-[calc(0.65rem+env(safe-area-inset-bottom,0px))]">
      {/* Floating Preview Sheet Trigger */}
      <button
        type="button"
        onClick={onOpenPreview}
        className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-transform shrink-0 min-h-[42px]"
      >
        <Eye className="w-4 h-4 text-blue-400" />
        <span>Preview</span>
        <span className="bg-slate-800 text-[10.5px] px-1.5 py-0.5 rounded font-mono text-slate-300">
          {activeRecipientIndex + 1}/{recipientCount}
        </span>
      </button>

      {/* Export & Print Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onPrint}
          className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg min-h-[42px] min-w-[42px] flex items-center justify-center transition-colors"
          title="Print certificate"
        >
          <Printer className="w-4 h-4" />
        </button>

        {recipientCount > 1 && (
          <button
            type="button"
            onClick={onExportBatchZip}
            className="px-2.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg min-h-[42px] flex items-center gap-1 transition-colors"
            title="Batch export as ZIP"
          >
            <FileArchive className="w-3.5 h-3.5 text-blue-700" />
            <span>ZIP</span>
          </button>
        )}

        <button
          type="button"
          onClick={onExportCurrent}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#004F9E] hover:bg-[#003d7c] active:bg-[#003366] rounded-xl shadow-md min-h-[42px] transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export PDF</span>
        </button>
      </div>
    </div>
  );
};
