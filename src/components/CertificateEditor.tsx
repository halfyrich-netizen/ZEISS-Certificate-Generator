import React, { useState } from 'react';
import { CertificateData, ProcedurePreset, SavedSignatureProfile } from '../types';
import {
  GraduationCap,
  Building2,
  PenTool,
  Upload,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Settings,
  Sparkles,
} from 'lucide-react';

interface CertificateEditorProps {
  data: CertificateData;
  onChange: (updated: Partial<CertificateData>) => void;
  onOpenSignatureModal: () => void;
  onOpenSignatureProfileManager: () => void;
  signatureProfiles: SavedSignatureProfile[];
  onSelectSignatureProfile: (profile: SavedSignatureProfile) => void;
  procedurePresets: ProcedurePreset[];
  onAddCustomProcedure: (name: string, lines: string[]) => void;
  onDeleteCustomProcedure: (id: string) => void;
  onResetToDefaults: () => void;
  lastSaved?: Date | null;
}

export const CertificateEditor: React.FC<CertificateEditorProps> = ({
  data,
  onChange,
  onOpenSignatureModal,
  onOpenSignatureProfileManager,
  signatureProfiles,
  onSelectSignatureProfile,
  procedurePresets,
  onAddCustomProcedure,
  onDeleteCustomProcedure,
  onResetToDefaults,
  lastSaved,
}) => {
  // Custom Procedure modal/inline state
  const [isAddingProcedure, setIsAddingProcedure] = useState(false);
  const [newProcedureName, setNewProcedureName] = useState('');
  const [newProcedureLines, setNewProcedureLines] = useState('');
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);

  // Helper to convert textarea lines to string array
  const handleLinesChange = (field: keyof CertificateData, text: string) => {
    const lines = text.split('\n');
    onChange({ [field]: lines });
  };

  // Find matching preset based on qualification lines
  const matchingPreset = procedurePresets.find(
    (p) => p.lines.join('\n').trim() === data.qualificationLines.join('\n').trim()
  );
  const currentProcedureId = data.selectedProcedureId || matchingPreset?.id || 'custom-manual';

  const handleProcedureSelect = (presetId: string) => {
    if (presetId === '__add_new__') {
      setIsAddingProcedure(true);
      return;
    }
    const preset = procedurePresets.find((p) => p.id === presetId);
    if (preset) {
      onChange({
        selectedProcedureId: preset.id,
        qualificationLines: [...preset.lines],
      });
    }
  };

  const handleSaveCustomProcedure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcedureName.trim() || !newProcedureLines.trim()) return;

    const lines = newProcedureLines.split('\n').map((l) => l.trim()).filter(Boolean);
    onAddCustomProcedure(newProcedureName.trim(), lines);
    onChange({
      qualificationLines: lines,
    });
    setNewProcedureName('');
    setNewProcedureLines('');
    setIsAddingProcedure(false);
  };

  // Find active signature profile
  const activeProfile = signatureProfiles.find(
    (p) => p.id === data.selectedSignatureId ||
      (p.signatoryName === data.signatoryName && p.signatoryTitle === data.signatoryTitle)
  );

  const handleSignatureProfileChange = (profileId: string) => {
    if (profileId === '__manage__') {
      onOpenSignatureProfileManager();
      return;
    }
    const selected = signatureProfiles.find((p) => p.id === profileId);
    if (selected) {
      onSelectSignatureProfile(selected);
    }
  };

  // Security config helpers
  const isProtected = data.pdfSecurity?.isProtected ?? true;
  const ownerPassword = data.pdfSecurity?.ownerPassword ?? 'ZeissCert#2026';

  const handleToggleSecurity = (checked: boolean) => {
    onChange({
      pdfSecurity: {
        isProtected: checked,
        ownerPassword,
      },
    });
  };

  const handleOwnerPasswordChange = (val: string) => {
    onChange({
      pdfSecurity: {
        isProtected,
        ownerPassword: val,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Section 2: Trainings */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-700" />
            <h2 className="text-sm font-semibold text-slate-900">
              Trainings
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsAddingProcedure(!isAddingProcedure)}
            className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            {isAddingProcedure ? 'Cancel' : 'Add Procedure'}
          </button>
        </div>

        <div className="space-y-3">
          {/* Procedure Preset Dropdown */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Select Training
              </label>
              {matchingPreset?.isCustom && (
                <button
                  type="button"
                  onClick={() => onDeleteCustomProcedure(matchingPreset.id)}
                  className="flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-800"
                  title="Delete this custom procedure preset"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete Preset
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={matchingPreset ? matchingPreset.id : 'custom-manual'}
                onChange={(e) => handleProcedureSelect(e.target.value)}
                className="flex-1 text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
              >
                <optgroup label="Standard ZEISS Procedures">
                  {procedurePresets
                    .filter((p) => !p.isCustom)
                    .map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.name}
                      </option>
                    ))}
                </optgroup>

                {procedurePresets.some((p) => p.isCustom) && (
                  <optgroup label="My Custom Procedures">
                    {procedurePresets
                      .filter((p) => p.isCustom)
                      .map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.name} (Custom)
                        </option>
                      ))}
                  </optgroup>
                )}

                {!matchingPreset && (
                  <option value="custom-manual">
                    -- Custom / Manually Edited Lines --
                  </option>
                )}

                <option value="__add_new__" className="text-blue-600 font-bold">
                  + Add on my own...
                </option>
              </select>
            </div>
          </div>

          {/* Inline Add Custom Procedure Box */}
          {isAddingProcedure && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">
                  Add New Custom Procedure Preset
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingProcedure(false)}
                  className="text-xs text-blue-700 hover:text-blue-900"
                >
                  Dismiss
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Procedure Display Name
                </label>
                <input
                  type="text"
                  value={newProcedureName}
                  onChange={(e) => setNewProcedureName(e.target.value)}
                  placeholder="e.g. SMILE Xtra, FLEx, etc."
                  className="w-full text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Narration Lines (1 or 2 lines)
                </label>
                <textarea
                  rows={2}
                  value={newProcedureLines}
                  onChange={(e) => setNewProcedureLines(e.target.value)}
                  placeholder={"SMILE® Xtra using ZEISS VISUMAX®\nFemtosecond Laser System"}
                  className="w-full text-xs font-mono border border-slate-300 rounded-md p-2 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingProcedure(false)}
                  className="px-2.5 py-1 text-xs text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomProcedure}
                  className="px-3 py-1 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-2xs"
                >
                  Save Preset
                </button>
              </div>
            </div>
          )}

          {/* Qualification Lines Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Active Qualification Lines on Certificate
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
              Select from presets above or manually edit wording. Use <code className="bg-slate-100 px-1 py-0.2 rounded font-bold">®</code> for registered marks.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Certification Statement
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
            3. Institution
          </h2>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Institution
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
                State & Date
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
              Signature
            </h2>
          </div>
          <button
            type="button"
            onClick={onOpenSignatureProfileManager}
            className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-semibold"
          >
            <Settings className="w-3.5 h-3.5" />
            Manage Signatures
          </button>
        </div>

        {/* Signature Profile Dropdown */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Signatures
          </label>
          <div className="flex items-center gap-2">
            <select
              value={activeProfile ? activeProfile.id : data.selectedSignatureId || '__custom__'}
              onChange={(e) => handleSignatureProfileChange(e.target.value)}
              className="flex-1 text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
            >
              {signatureProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label || `${p.signatoryName} (${p.signatoryTitle})`}
                  {p.isDefault ? ' [Default]' : ''}
                </option>
              ))}
              {!activeProfile && (
                <option value="__custom__">-- Custom Manual Signatory --</option>
              )}
              <option value="__manage__" className="text-blue-600 font-bold">
                ⚙️ Manage Saved Signatures (CRUD)...
              </option>
            </select>
          </div>
        </div>

        {/* Current Signature Thumbnail */}
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
              Active Signature Stroke
            </div>
            <p className="text-[11px] text-slate-500">
              Positioned at left: 73mm, top: 190.8mm above the 52.56mm signature line.
            </p>
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
      </div>

      {/* Section 5: Security */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-slate-900">
              Security
            </h2>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isProtected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {isProtected ? 'Protected' : 'Unrestricted'}
          </span>
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={isProtected}
              onChange={(e) => handleToggleSecurity(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5"
            />
            <div className="flex-1 text-xs">
              <span className="font-semibold text-slate-900 block mb-0.5">
                Protect PDF from Editing (View & Print Only)
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Applies standard PDF permissions encryption. Recipients can open, view, and print freely without entering a password, but PDF readers prevent copying text, editing text, and modifying elements.
              </p>
            </div>
          </label>

          {isProtected && (
            <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  Owner / Administrator Password
                </label>
                <span className="text-[10px] text-emerald-700 font-medium">
                  Required only if you wish to unlock editing later
                </span>
              </div>
              <div className="relative">
                <input
                  type={showOwnerPassword ? 'text' : 'password'}
                  value={ownerPassword}
                  onChange={(e) => handleOwnerPasswordChange(e.target.value)}
                  placeholder="Set owner password"
                  className="w-full text-xs font-mono border border-slate-300 rounded-lg pl-3 pr-10 py-2 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  title={showOwnerPassword ? 'Hide password' : 'Show password'}
                >
                  {showOwnerPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10.5px] text-slate-500">
                Default: <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-700 font-mono font-semibold">ZeissCert#2026</code>. Recipients will never be asked for this password when opening or printing.
              </p>
            </div>
          )}
        </div>

        {/* Offline status indicator */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            {lastSaved ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Auto-saved offline ({lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})</span>
              </>
            ) : (
              <span>Draft auto-saves to offline storage</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
