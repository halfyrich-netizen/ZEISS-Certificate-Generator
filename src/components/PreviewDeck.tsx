import React, { useState, useEffect, useRef } from 'react';
import { CertificateData } from '../types';
import { CertificateView } from './CertificateView';
import { runLiveDiagnostics } from './DiagnosticModal';
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
  FileArchive,
  FileText,
  Printer,
  Type,
  CheckCircle2,
  AlertCircle,
  Terminal,
} from 'lucide-react';

interface PreviewDeckProps {
  data: CertificateData;
  activeRecipientIndex: number;
  isZeissFontActive: boolean;
  onOpenFontModal: () => void;
  onOpenDiagnosticModal: () => void;
  onSelectRecipient: (index: number) => void;
  onExportCurrent: () => void;
  onExportBatchZip: () => void;
  onExportCombinedPdf: () => void;
  onPrint: () => void;
}

export const PreviewDeck: React.FC<PreviewDeckProps> = ({
  data,
  activeRecipientIndex,
  isZeissFontActive,
  onOpenFontModal,
  onOpenDiagnosticModal,
  onSelectRecipient,
  onExportCurrent,
  onExportBatchZip,
  onExportCombinedPdf,
  onPrint,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState<number>(0.75);
  const recipients = data.recipients.length > 0 ? data.recipients : ['Recipient Name'];
  const currentRecipient = recipients[activeRecipientIndex] || recipients[0];

  // Auto-fit on initial mount or container resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth - 48; // padding
      if (width < 794) {
        const autoScale = Math.min(1, Math.max(0.42, width / 794));
        setScale(Number(autoScale.toFixed(2)));
      } else {
        setScale(0.85);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Run diagnostics on mount / scale change
  useEffect(() => {
    const timer = setTimeout(() => {
      runLiveDiagnostics();
    }, 400);
    return () => clearTimeout(timer);
  }, [scale, currentRecipient]);

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
    <div className="flex flex-col h-full">
      {/* Font & Compliance Ribbon */}
      <div className="no-print mb-3 flex items-center justify-between text-xs px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          {isZeissFontActive ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500" />
          )}
          <span className="font-medium text-slate-700">
            {isZeissFontActive
              ? 'Typography: ZEISS Frutiger Next W1G Loaded (Exact Layout)'
              : 'Typography: Arial Narrow / Roboto Condensed (Approximate Fallback)'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDiagnosticModal}
            className="flex items-center gap-1 font-mono text-[11px] text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors"
            title="Inspect computed styles (fontSize, letterSpacing, rendered dimensions)"
          >
            <Terminal className="w-3 h-3 text-emerald-600" />
            Diagnostics
          </button>
          <button
            onClick={onOpenFontModal}
            className="flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 underline"
          >
            <Type className="w-3.5 h-3.5" />
            {isZeissFontActive ? 'Manage Font Files' : 'Load Local ZEISS Font'}
          </button>
        </div>
      </div>

      {/* Top Controls Toolbar */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-3 mb-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Recipient Pagination */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={activeRecipientIndex <= 0}
            className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded hover:bg-slate-100 transition-colors"
            title="Previous recipient"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <span className="font-medium">Certificate</span>
            <span className="bg-slate-100 font-mono px-2 py-0.5 rounded text-blue-700 font-semibold tabular-nums">
              {activeRecipientIndex + 1}
            </span>
            <span className="text-slate-400">of</span>
            <span className="font-mono text-slate-600 font-semibold tabular-nums">
              {recipients.length}
            </span>
          </div>

          <button
            onClick={handleNext}
            disabled={activeRecipientIndex >= recipients.length - 1}
            className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded hover:bg-slate-100 transition-colors"
            title="Next recipient"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {recipients.length > 1 && (
            <select
              value={activeRecipientIndex}
              onChange={(e) => onSelectRecipient(Number(e.target.value))}
              className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 max-w-[180px] truncate"
            >
              {recipients.map((name, i) => (
                <option key={i} value={i}>
                  {i + 1}. {name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Zoom:</span>
          <button
            onClick={() => setScale((s) => Math.max(0.4, Number((s - 0.1).toFixed(2))))}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono text-slate-600 w-11 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(1.2, Number((s + 0.1).toFixed(2))))}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setScale(1.0)}
            className={`px-2 py-1 text-xs border rounded transition-colors ${
              scale === 1.0
                ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                : 'text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
            }`}
            title="Exact 100% (1:1 Print scale)"
          >
            100% (1:1)
          </button>
          <button
            onClick={() => setScale(0.75)}
            className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50"
            title="Fit to view"
          >
            Fit
          </button>
        </div>
      </div>

      {/* Action Download Strip */}
      <div className="no-print bg-slate-900 text-white rounded-xl p-3.5 mb-4 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-200">
            Export Options:
          </span>
          <span className="text-xs text-slate-400">
            (300 DPI A4 Master)
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Current PDF */}
          <button
            onClick={onExportCurrent}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download This PDF
          </button>

          {/* Export All as ZIP */}
          <button
            onClick={onExportBatchZip}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-xs transition-colors"
            title="Generate separate PDF for each recipient into a ZIP archive"
          >
            <FileArchive className="w-3.5 h-3.5 text-blue-700" />
            Batch ZIP ({recipients.length})
          </button>

          {/* Export Combined Multi-Page PDF */}
          <button
            onClick={onExportCombinedPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            title="Combine all recipients into a single multi-page PDF"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            Combined PDF ({recipients.length}p)
          </button>

          {/* Browser Print */}
          <button
            onClick={onPrint}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Print certificate"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main A4 Certificate Canvas Viewport */}
      <div
        ref={containerRef}
        className="flex-1 bg-slate-200/80 rounded-xl p-6 overflow-auto flex justify-center items-start border border-slate-300 min-h-[640px]"
      >
        <div
          style={{
            width: `${794 * scale}px`,
            height: `${1123 * scale}px`,
          }}
          className="relative transition-all duration-150"
        >
          <CertificateView
            id="certificate-live-node"
            data={data}
            recipientName={currentRecipient}
            scale={scale}
          />
        </div>
      </div>
    </div>
  );
};
