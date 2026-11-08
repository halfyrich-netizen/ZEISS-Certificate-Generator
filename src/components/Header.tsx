import React from 'react';
import { Download, Printer, ShieldCheck, Type, CheckCircle2, Terminal } from 'lucide-react';

interface HeaderProps {
  onExportCurrent: () => void;
  onOpenSignatureModal: () => void;
  onOpenFontModal: () => void;
  onOpenDiagnosticModal: () => void;
  onPrint: () => void;
  recipientCount: number;
  isZeissFontActive: boolean;
}

const OFFICIAL_ZEISS_LOGO_URL = '/assets/aistudio/ZEISS_Logo_RGB_b3095ed1_cropped.png';

export const Header: React.FC<HeaderProps> = ({
  onExportCurrent,
  onOpenSignatureModal,
  onOpenFontModal,
  onOpenDiagnosticModal,
  onPrint,
  recipientCount,
  isZeissFontActive,
}) => {
  return (
    <header className="no-print bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-8 sticky top-0 z-40">
      {/* Zone 1: Single element brand wordmark with official Zeiss badge */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <img
          src={OFFICIAL_ZEISS_LOGO_URL}
          alt="ZEISS"
          className="w-7 h-7 object-contain"
        />
        <span className="text-sm font-bold tracking-tight text-slate-900">
          ZEISS Training Certificate Generator
        </span>
      </div>

      {/* Zone 2: Navigation & Font/Auth Management */}
      <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-600">
        <button
          onClick={onOpenFontModal}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
            isZeissFontActive
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
          }`}
          title="Manage local ZEISS Frutiger Next font files"
        >
          <Type className="w-3.5 h-3.5" />
          <span>{isZeissFontActive ? 'ZEISS Font Active' : 'Load Local ZEISS Font'}</span>
          {isZeissFontActive && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
        </button>

        <button
          onClick={onOpenSignatureModal}
          className="hover:text-slate-900 transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
          Signature Authentication
        </button>

        <button
          onClick={onOpenDiagnosticModal}
          className="hover:text-slate-900 transition-colors whitespace-nowrap flex items-center gap-1 text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded"
          title="Inspect computed styles and dimensions"
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-600" />
          Diagnostics
        </button>

        <button
          onClick={onPrint}
          className="hover:text-slate-900 transition-colors whitespace-nowrap flex items-center gap-1"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Direct
        </button>

        <span className="text-slate-400">
          {recipientCount} {recipientCount === 1 ? 'Recipient Queued' : 'Recipients Queued'}
        </span>
      </nav>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onExportCurrent}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#004F9E] hover:bg-[#003d7c] rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          Export Current PDF
        </button>
      </div>
    </header>
  );
};
