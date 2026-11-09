import React, { useState, useEffect, useRef } from 'react';
import { CertificateData } from '../types';
import { CertificateView } from './CertificateView';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ShieldCheck,
  Printer,
} from 'lucide-react';

interface MobilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CertificateData;
  activeRecipientIndex: number;
  onSelectRecipient: (index: number) => void;
  onExportCurrent: () => void;
  onExportCombinedPdf?: () => void;
  onPrint: () => void;
}

export const MobilePreviewModal: React.FC<MobilePreviewModalProps> = ({
  isOpen,
  onClose,
  data,
  activeRecipientIndex,
  onSelectRecipient,
  onExportCurrent,
  onExportCombinedPdf,
  onPrint,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState<number>(0.45);
  const recipients = data.recipients.length > 0 ? data.recipients : ['Recipient Name'];
  const currentRecipient = recipients[activeRecipientIndex] || recipients[0];

  // Auto-calculate fit scale based on viewport width
  const handleAutoFit = () => {
    if (typeof window === 'undefined') return;
    const availableWidth = window.innerWidth - 24; // 12px margin each side
    // 794px is the unscaled A4 pixel width (210mm at 96 DPI)
    const fitScale = Math.min(0.95, Math.max(0.35, availableWidth / 794));
    setScale(Number(fitScale.toFixed(2)));
  };

  useEffect(() => {
    if (isOpen) {
      handleAutoFit();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrev = () => {
    if (activeRecipientIndex > 0) {
      onSelectRecipient(activeRecipientIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeRecipientIndex < recipients.length - 1) {
      onSelectRecipient(activeRecipientIndex + 1);
    }
  };

  return (
    <div className="no-print fixed inset-0 z-50 lg:hidden flex flex-col bg-slate-950/95 backdrop-blur-md animate-fadeIn">
      {/* Mobile Modal Header */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-slate-900 border-b border-slate-800 text-white shrink-0 pt-[calc(0.6rem+env(safe-area-inset-top,0px))]">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 active:scale-95 transition-all"
            aria-label="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold tracking-tight text-slate-200 truncate max-w-[140px] sm:max-w-[200px]">
            {currentRecipient}
          </span>
        </div>

        {/* Header Actions: Pagination & Export */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeRecipientIndex <= 0}
              className="min-h-[38px] min-w-[34px] flex items-center justify-center text-slate-300 disabled:opacity-30 rounded hover:bg-slate-700"
              title="Previous recipient"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-semibold px-1.5 text-slate-200">
              {activeRecipientIndex + 1}/{recipients.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={activeRecipientIndex >= recipients.length - 1}
              className="min-h-[38px] min-w-[34px] flex items-center justify-center text-slate-300 disabled:opacity-30 rounded hover:bg-slate-700"
              title="Next recipient"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {recipients.length > 1 && onExportCombinedPdf ? (
            <button
              type="button"
              onClick={onExportCombinedPdf}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-white bg-[#004F9E] hover:bg-[#003d7c] rounded-lg shadow-sm min-h-[40px] active:scale-95 transition-transform"
              title={`Export all ${recipients.length} certificates as 1 multi-page PDF`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>All ({recipients.length}p)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onExportCurrent}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-white bg-[#004F9E] hover:bg-[#003d7c] rounded-lg shadow-sm min-h-[40px] active:scale-95 transition-transform"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Zoom & Protection Ribbon */}
      <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-300 shrink-0">
        <div className="flex items-center gap-2">
          {data.pdfSecurity?.isProtected && (
            <span className="flex items-center gap-1 text-[10.5px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Protected
            </span>
          )}
          <span className="text-[11px] text-slate-400 font-mono">
            Scale: {Math.round(scale * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.3, Number((s - 0.05).toFixed(2))))}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleAutoFit}
            className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded min-h-[36px] flex items-center gap-1"
          >
            <Maximize2 className="w-3 h-3" />
            Fit
          </button>
          <button
            type="button"
            onClick={() => setScale(1.0)}
            className="px-2 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded min-h-[36px] flex items-center"
          >
            100%
          </button>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(1.2, Number((s + 0.05).toFixed(2))))}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 rounded ml-1"
            title="Print"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable A4 Certificate Viewport */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 flex items-start justify-center touch-pan-x touch-pan-y"
      >
        <div className="transition-transform duration-150 origin-top shadow-2xl">
          <CertificateView
            data={data}
            recipientName={currentRecipient}
            scale={scale}
          />
        </div>
      </div>
    </div>
  );
};
