import React from 'react';
import { CertificateData } from '../types';
import {
  GraduationCap,
  Building2,
  PenTool,
  Upload,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface CertificateEditorProps {
  data: CertificateData;
  onChange: (updated: Partial<CertificateData>) => void;
  onOpenSignatureModal: () => void;
  onResetToDefaults: () => void;
}

export const CertificateEditor: React.FC<CertificateEditorProps> = ({
  data,
  onChange,
  onOpenSignatureModal,
  onResetToDefaults,
}) => {
  // Helper to convert textarea lines to string array
  const handleLinesChange = (field: keyof CertificateData, text: string) => {
    const lines = text.split('\n');
    onChange({ [field]: lines });
  };

  return (
    <div className="space-y-4">
      {/* Section 2: Training & Equipment */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <GraduationCap className="w-4 h-4 text-blue-700" />
          <h2 className="text-sm font-semibold text-slate-900">
            2. Training & Qualification (Line Controlled)
          </h2>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Qualification Lines (Procedure & Device)
              </label>
              <span className="text-[10px] text-slate-400">
                {data.qualificationLines.length} line(s)
              </span>
            </div>
            <textarea
              rows={2}
              value={data.qualificationLines.join('\n')}
              onChange={(e) => handleLinesChange('qualificationLines', e.target.value)}
              placeholder={"Transepithelial PRK using\nZEISS MEL® 90 Excimer Laser System"}
              className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[10.5px] text-slate-500 mt-1">
              Line 1: Procedure name. Line 2: Device/Laser model with trademark (<code className="bg-slate-100 px-1 py-0.2 rounded font-bold">®</code>).
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Certification Statement (Exact 3 Lines)
              </label>
              <span className="text-[10px] text-slate-400">
                {data.statementLines.length} of 3 lines
              </span>
            </div>
            <textarea
              rows={3}
              value={data.statementLines.join('\n')}
              onChange={(e) => handleLinesChange('statementLines', e.target.value)}
              className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            {data.statementLines.length !== 3 && (
              <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-1">
                <AlertTriangle className="w-3 h-3" />
                Specification requires exactly 3 lines.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Hospital / Clinic & Date */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <Building2 className="w-4 h-4 text-blue-700" />
          <h2 className="text-sm font-semibold text-slate-900">
            3. Institution & Training Location
          </h2>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Recipient Institution (2 Lines)
              </label>
              <span className="text-[10px] text-slate-400">
                {data.institutionLines.length} line(s)
              </span>
            </div>
            <textarea
              rows={2}
              value={data.institutionLines.join('\n')}
              onChange={(e) => handleLinesChange('institutionLines', e.target.value)}
              placeholder={"EyeQu LASIK & Eye Center\nBekasi Timur"}
              className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[10.5px] text-slate-500 mt-1">
              Line 1: Hospital/Center name. Line 2: Branch or city.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Training Site & Date (2 Lines)
              </label>
              <span className="text-[10px] text-slate-400">
                {data.locationLines.length} line(s)
              </span>
            </div>
            <textarea
              rows={2}
              value={data.locationLines.join('\n')}
              onChange={(e) => handleLinesChange('locationLines', e.target.value)}
              placeholder={"EyeQu LASIK & Eye Center Bekasi Timur\nIndonesia, 9 Feb 2026"}
              className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Signature & Authority Authentication */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <h2 className="text-sm font-semibold text-slate-900">
              4. Signature & Authority
            </h2>
          </div>
          <button
            type="button"
            onClick={onOpenSignatureModal}
            className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-semibold"
          >
            <PenTool className="w-3.5 h-3.5" />
            Edit Signature
          </button>
        </div>

        {/* Current Signature Thumbnail & Quick Upload */}
        <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg mb-4">
          <div className="w-36 h-16 bg-white border border-slate-200 rounded flex items-center justify-center p-1 overflow-hidden shrink-0">
            {data.signatureImage ? (
              <img
                src={data.signatureImage}
                alt="Active Signature"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-[10px] text-slate-400">No Signature</span>
            )}
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-slate-800 mb-0.5">
              Authorized Signature
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Positioned at left: 73mm, top: 190.8mm above the 52.56mm signature line.
            </p>
            <button
              type="button"
              onClick={onOpenSignatureModal}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 rounded shadow-2xs transition-colors"
            >
              <Upload className="w-3 h-3" />
              Upload / Draw New
            </button>
          </div>
        </div>

        {/* Signer Details Inputs */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Signer Name
              </label>
              <input
                type="text"
                value={data.signatoryName}
                onChange={(e) => onChange({ signatoryName: e.target.value })}
                placeholder="Hary Destianto"
                className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Professional Title
              </label>
              <input
                type="text"
                value={data.signatoryTitle}
                onChange={(e) => onChange({ signatoryTitle: e.target.value })}
                placeholder="Application Specialist REF"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business Unit / Department
            </label>
            <input
              type="text"
              value={data.signatoryDepartment}
              onChange={(e) => onChange({ signatoryDepartment: e.target.value })}
              placeholder="Medical Technology Business Group"
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Affiliated Corporate Entity
            </label>
            <input
              type="text"
              value={data.signatoryCompany}
              onChange={(e) => onChange({ signatoryCompany: e.target.value })}
              placeholder="Carl Zeiss Pte. Ltd. - Representative Office in Indonesia"
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Medical Legal Disclaimer (Exact 2 Lines)
              </label>
              <span className="text-[10px] text-slate-400">
                {data.disclaimerLines.length} of 2 lines
              </span>
            </div>
            <textarea
              rows={2}
              value={data.disclaimerLines.join('\n')}
              onChange={(e) => handleLinesChange('disclaimerLines', e.target.value)}
              className="w-full text-[11px] font-mono text-slate-700 border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Reset to Carl Zeiss defaults */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onResetToDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset all to Specification Example
          </button>
        </div>
      </div>
    </div>
  );
};
