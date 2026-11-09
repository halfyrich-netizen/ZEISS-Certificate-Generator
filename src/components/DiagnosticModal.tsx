import React, { useState, useEffect } from 'react';
import { Terminal, Copy, Check, X, RefreshCw } from 'lucide-react';

interface DiagnosticData {
  titleFontSize: string;
  titleLetterSpacing: string;
  titleTop: string;
  titleWidth: number;
  titleHeight: number;
  logoCssWidth: string;
  logoCssHeight: string;
  logoCssLeft: string;
  logoRenderedWidth: number;
  logoRenderedHeight: number;
  logoNaturalWidth: number;
  logoNaturalHeight: number;
  pageWidth: number;
  pageHeight: number;
  pageTransform: string;
  devicePixelRatio: number;
}

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function runLiveDiagnostics(): DiagnosticData | null {
  const title = document.querySelector('.vertical-title') as HTMLElement | null;
  const logo = document.querySelector('.zeiss-logo') as HTMLImageElement | null;
  const page = document.querySelector('.certificate-page') as HTMLElement | null;

  if (!title || !logo || !page) return null;

  const data: DiagnosticData = {
    titleFontSize: getComputedStyle(title).fontSize,
    titleLetterSpacing: getComputedStyle(title).letterSpacing,
    titleTop: getComputedStyle(title).top,
    titleWidth: Number(title.getBoundingClientRect().width.toFixed(2)),
    titleHeight: Number(title.getBoundingClientRect().height.toFixed(2)),

    logoCssWidth: getComputedStyle(logo).width,
    logoCssHeight: getComputedStyle(logo).height,
    logoCssLeft: getComputedStyle(logo).left,
    logoRenderedWidth: Number(logo.getBoundingClientRect().width.toFixed(2)),
    logoRenderedHeight: Number(logo.getBoundingClientRect().height.toFixed(2)),
    logoNaturalWidth: logo.naturalWidth,
    logoNaturalHeight: logo.naturalHeight,

    pageWidth: Number(page.getBoundingClientRect().width.toFixed(2)),
    pageHeight: Number(page.getBoundingClientRect().height.toFixed(2)),
    pageTransform: getComputedStyle(page).transform,

    devicePixelRatio: window.devicePixelRatio,
  };

  // Log to browser DevTools console as requested
  console.table(data);
  return data;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [copied, setCopied] = useState(false);

  const refresh = () => {
    const res = runLiveDiagnostics();
    setData(res);
  };

  useEffect(() => {
    if (isOpen) {
      refresh();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-semibold tracking-wide">
              Computed Layout Diagnostics
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostic Table */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
            <span>Live DOM Computed Styles & Rendered Bounds:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={refresh}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Re-measure
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
            </div>
          </div>

          {data ? (
            <div className="border border-slate-200 rounded-lg overflow-hidden font-mono text-xs">
              <table className="w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3.5 py-2 text-left font-semibold">Property</th>
                    <th className="px-3.5 py-2 text-left font-semibold">Measured Value</th>
                    <th className="px-3.5 py-2 text-left font-semibold">Target Baseline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr>
                    <td className="px-3.5 py-2 text-slate-600">titleType</td>
                    <td className="px-3.5 py-2 font-bold text-emerald-700">600 DPI Vector Asset</td>
                    <td className="px-3.5 py-2 text-slate-400">ZEISS Frutiger Next W1G LtCn (72pt, 38pt tracking)</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 text-slate-600">titleTop</td>
                    <td className="px-3.5 py-2 font-bold text-emerald-700">{data.titleTop}</td>
                    <td className="px-3.5 py-2 text-slate-400">14.99mm (Exact Reference Alignment)</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 text-slate-600">titleWidth</td>
                    <td className="px-3.5 py-2 text-slate-900">{data.titleWidth}px</td>
                    <td className="px-3.5 py-2 text-slate-400">23.2mm (~87.7px)</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 text-slate-600">titleHeight</td>
                    <td className="px-3.5 py-2 text-slate-900">{data.titleHeight}px</td>
                    <td className="px-3.5 py-2 text-slate-400">269.7mm (~1019px)</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 text-slate-600">logoCssLeft (Horizontal)</td>
                    <td className="px-3.5 py-2 font-bold text-emerald-700">{data.logoCssLeft}</td>
                    <td className="px-3.5 py-2 text-slate-400">105mm (Shifted left for balance)</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 text-slate-600">logoCssWidth</td>
                    <td className="px-3.5 py-2 font-bold text-emerald-700">{data.logoCssWidth}</td>
                    <td className="px-3.5 py-2 text-slate-400">71.81px (19mm)</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 text-slate-600">logoCssHeight</td>
                    <td className="px-3.5 py-2 font-bold text-emerald-700">{data.logoCssHeight}</td>
                    <td className="px-3.5 py-2 text-slate-400">71.81px (19mm)</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 text-slate-600">logoRenderedWidth</td>
                    <td className="px-3.5 py-2 font-bold text-emerald-700">{data.logoRenderedWidth}px</td>
                    <td className="px-3.5 py-2 text-slate-400">71.81px (19mm)</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 text-slate-600">logoNaturalWidth x Height</td>
                    <td className="px-3.5 py-2 text-slate-900">{data.logoNaturalWidth} x {data.logoNaturalHeight}</td>
                    <td className="px-3.5 py-2 text-slate-400">144 x 144 (cropped)</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 text-slate-600">pageWidth x Height</td>
                    <td className="px-3.5 py-2 text-slate-900">{data.pageWidth} x {data.pageHeight}px</td>
                    <td className="px-3.5 py-2 text-slate-400">793.7 x 1122.5px (A4)</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 text-slate-600">pageTransform</td>
                    <td className="px-3.5 py-2 text-slate-900">{data.pageTransform}</td>
                    <td className="px-3.5 py-2 text-slate-400">none</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 text-slate-600">devicePixelRatio</td>
                    <td className="px-3.5 py-2 text-slate-900">{data.devicePixelRatio}</td>
                    <td className="px-3.5 py-2 text-slate-400">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Certificate node is not currently visible in the DOM.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
