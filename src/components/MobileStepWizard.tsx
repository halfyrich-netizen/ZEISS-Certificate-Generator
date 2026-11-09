import React, { useState } from 'react';
import { CertificateData, ProcedurePreset, SavedSignatureProfile } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  UserPlus,
  X,
  Sparkles,
  ClipboardList,
  GraduationCap,
  Building2,
  Calendar,
  ShieldCheck,
  Lock,
  FileText,
  Download,
  Printer,
  FileArchive,
  Eye,
  EyeOff,
  Check,
  Zap,
  Shield,
  FileCheck,
  Cloud,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { SAMPLE_RECIPIENTS } from '../constants/defaults';
import { PWAInstallButton } from './PWAInstallButton';

interface MobileStepWizardProps {
  data: CertificateData;
  onChange: (updated: Partial<CertificateData>) => void;
  recipients: string[];
  activeRecipientIndex: number;
  onSelectRecipient: (index: number) => void;
  onAddRecipient: (name: string) => void;
  onRemoveRecipient: (index: number) => void;
  onSetRecipients: (names: string[]) => void;
  procedurePresets: ProcedurePreset[];
  signatureProfiles: SavedSignatureProfile[];
  onSelectSignatureProfile: (profile: SavedSignatureProfile) => void;
  onOpenSignatureModal: () => void;
  onOpenSignatureProfileManager: () => void;
  onOpenPreview: () => void;
  onExportCurrent: () => void;
  onExportBatchZip: () => void;
  onExportCombinedPdf: () => void;
  onPrint: () => void;
  onResetToDefaults: () => void;
}

const OFFICIAL_ZEISS_LOGO_URL = '/assets/aistudio/ZEISS_Logo_RGB_b3095ed1_cropped.png';

export const MobileStepWizard: React.FC<MobileStepWizardProps> = ({
  data,
  onChange,
  recipients,
  activeRecipientIndex,
  onSelectRecipient,
  onAddRecipient,
  onRemoveRecipient,
  onSetRecipients,
  procedurePresets,
  signatureProfiles,
  onSelectSignatureProfile,
  onOpenSignatureModal,
  onOpenSignatureProfileManager,
  onOpenPreview,
  onExportCurrent,
  onExportBatchZip,
  onExportCombinedPdf,
  onPrint,
  onResetToDefaults,
}) => {
  // Step state: 0 = Home, 1 = Recipients, 2 = Procedure, 3 = Institution & Signer, 4 = Review & Generate
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [singleRecipientInput, setSingleRecipientInput] = useState('');
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkTextInput, setBulkTextInput] = useState('');
  const [exportFormat, setExportFormat] = useState<'combined' | 'zip' | 'single'>('combined');
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);

  // Handle single recipient submission
  const handleAddSingle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = singleRecipientInput.trim();
    if (!val) return;
    onAddRecipient(val);
    setSingleRecipientInput('');
  };

  const handleApplyBulk = () => {
    const lines = bulkTextInput
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length > 0) {
      onSetRecipients(lines);
      setIsBulkOpen(false);
      setBulkTextInput('');
    }
  };

  // Helper for line changes
  const handleLinesChange = (field: keyof CertificateData, text: string) => {
    onChange({ [field]: text.split('\n') });
  };

  // Find matching preset
  const matchingPreset = procedurePresets.find(
    (p) => p.lines.join('\n').trim() === data.qualificationLines.join('\n').trim()
  );

  const handleSelectProcedure = (presetId: string) => {
    const preset = procedurePresets.find((p) => p.id === presetId);
    if (preset) {
      onChange({
        selectedProcedureId: preset.id,
        qualificationLines: [...preset.lines],
      });
    }
  };

  // Current active signatory
  const activeProfile = signatureProfiles.find(
    (p) => p.id === data.selectedSignatureId ||
      (p.signatoryName === data.signatoryName && p.signatoryTitle === data.signatoryTitle)
  );

  return (
    <div className="lg:hidden flex flex-col min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* =========================================================================
          VIEW 0: HOME SCREEN (Matches Designer Mockup 1. Home)
         ========================================================================= */}
      {currentStep === 0 && (
        <div className="flex-1 flex flex-col justify-between px-5 py-6 max-w-md mx-auto w-full animate-fadeIn">
          {/* Top Branding Header */}
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-slate-200/80 mb-6">
              <div className="flex items-center gap-3">
                <img
                  src={OFFICIAL_ZEISS_LOGO_URL}
                  alt="ZEISS"
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <h1 className="text-xs font-bold tracking-tight text-slate-900 uppercase">
                    ZEISS
                  </h1>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Training Certificate Generator
                  </p>
                </div>
              </div>
              <PWAInstallButton />
            </div>

            {/* Hero Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight mb-2">
                Generate Training Certificates Easily
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Create official, pixel-perfect ZEISS training certificates in just a few guided steps.
              </p>
            </div>

            {/* 4 Feature Cards Grid (2x2) */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-start gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">Quick & Easy</div>
                <p className="text-[10.5px] text-slate-500 leading-snug">
                  Save time with streamlined step-by-step entry.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-start gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">Secure & Compliant</div>
                <p className="text-[10.5px] text-slate-500 leading-snug">
                  Official ZEISS layout with tamper protection.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-start gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">Professional Master</div>
                <p className="text-[10.5px] text-slate-500 leading-snug">
                  High-fidelity 300 DPI A4 PDF output.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-start gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <Cloud className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">Access Anywhere</div>
                <p className="text-[10.5px] text-slate-500 leading-snug">
                  Works 100% offline on iPhone, iPad or PC.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="space-y-4 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[#004F9E] hover:bg-[#003d7c] active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-md transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-center text-[11px] text-slate-400 font-medium tracking-wide">
              Seeing beyond.
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEPS 1 to 4: GUIDED CREATION WIZARD HEADER & PROGRESS
         ========================================================================= */}
      {currentStep > 0 && (
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 shadow-2xs">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <button
              type="button"
              onClick={() => setCurrentStep((s) => s - 1)}
              className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 min-h-[38px] min-w-[38px] flex items-center justify-center transition-colors"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-slate-900">
                Create Certificate
              </span>
              {/* Progress Dots */}
              <div className="flex items-center gap-2 mt-1.5">
                {[1, 2, 3, 4].map((step) => {
                  const isActive = step === currentStep;
                  const isDone = step < currentStep;
                  return (
                    <div key={step} className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full transition-all ${
                          isActive
                            ? 'bg-[#004F9E] ring-4 ring-blue-100 scale-125'
                            : isDone
                            ? 'bg-blue-600'
                            : 'bg-slate-200'
                        }`}
                      />
                      {step < 4 && (
                        <div
                          className={`w-4 h-0.5 ${
                            step < currentStep ? 'bg-blue-600' : 'bg-slate-200'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <span className="text-xs font-semibold text-slate-500 font-mono tabular-nums">
              {currentStep}/4
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 1: RECIPIENTS (1/4)
         ========================================================================= */}
      {currentStep === 1 && (
        <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                1. Recipients
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4 ml-9">
              Add the participant name(s) for the certificate.
            </p>

            {/* Input & Add */}
            <form onSubmit={handleAddSingle} className="flex gap-2 mb-3">
              <input
                type="text"
                value={singleRecipientInput}
                onChange={(e) => setSingleRecipientInput(e.target.value)}
                placeholder="e.g. Dr. Andreas S. Anugrah, MD"
                className="flex-1 text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 min-h-[42px]"
              />
              <button
                type="submit"
                disabled={!singleRecipientInput.trim()}
                className="px-4 py-2.5 bg-[#004F9E] text-white rounded-xl font-bold text-xs hover:bg-[#003d7c] disabled:opacity-40 disabled:cursor-not-allowed min-h-[42px] transition-colors"
              >
                + Add
              </button>
            </form>

            {/* Active Recipient Chips */}
            <div className="flex flex-wrap gap-1.5 mb-4 max-h-48 overflow-y-auto">
              {recipients.map((name, idx) => (
                <div
                  key={`${name}-${idx}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-blue-50 text-blue-900 border border-blue-200 font-medium"
                >
                  <span className="truncate max-w-[180px]">{name}</span>
                  {recipients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveRecipient(idx)}
                      className="text-blue-400 hover:text-rose-600 p-0.5 rounded"
                      aria-label="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Bulk Paste Card */}
            <div
              onClick={() => setIsBulkOpen(!isBulkOpen)}
              className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ClipboardList className="w-4 h-4 text-blue-700" />
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Bulk Paste
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Add multiple recipients at once
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Bulk Modal/Drawer if expanded */}
            {isBulkOpen && (
              <div className="mt-3 p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2 animate-fadeIn">
                <textarea
                  rows={4}
                  value={bulkTextInput}
                  onChange={(e) => setBulkTextInput(e.target.value)}
                  placeholder="Paste list of names here (one per line)..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => onSetRecipients(SAMPLE_RECIPIENTS)}
                    className="text-xs text-blue-700 hover:underline font-semibold"
                  >
                    Load Sample Doctors
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBulkOpen(false)}
                      className="px-2.5 py-1 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyBulk}
                      disabled={!bulkTextInput.trim()}
                      className="px-3 py-1 text-xs font-bold text-white bg-[#004F9E] rounded-lg disabled:opacity-40"
                    >
                      Apply List
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: TRAININGS (2/4)
         ========================================================================= */}
      {currentStep === 2 && (
        <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                Trainings
              </h2>
            </div>
            <p className="text-xs text-slate-500 ml-9 -mt-3">
              Select training and enter qualification lines.
            </p>

            {/* Dropdown Preset */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Training
              </label>
              <select
                value={matchingPreset ? matchingPreset.id : 'custom-manual'}
                onChange={(e) => handleSelectProcedure(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-3 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs min-h-[44px]"
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
                  <optgroup label="Custom Procedures">
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
                  <option value="custom-manual">-- Custom Manual Lines --</option>
                )}
              </select>
            </div>

            {/* Active Qualification Lines */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Active Qualification Lines
                </label>
                <span className="text-[11px] text-slate-400">
                  {data.qualificationLines.length} line(s)
                </span>
              </div>
              <textarea
                rows={2}
                value={data.qualificationLines.join('\n')}
                onChange={(e) => handleLinesChange('qualificationLines', e.target.value)}
                placeholder={"Transepithelial PRK using\nZEISS MEL® 90 Excimer Laser System"}
                className="w-full text-xs font-mono border border-slate-300 rounded-xl p-3 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Use <code className="bg-slate-100 px-1 py-0.5 rounded font-bold">®</code> for registered marks.
              </p>
            </div>

            {/* Info Callout */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Selecting presets automatically fills exact standard wording compliant with ZEISS specifications.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: INSTITUTION, SIGNATURE & SECURITY (3/4)
         ========================================================================= */}
      {currentStep === 3 && (
        <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-4 animate-fadeIn">
          {/* Institution Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                Institution
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Institution
              </label>
              <textarea
                rows={2}
                value={data.institutionLines.join('\n')}
                onChange={(e) => handleLinesChange('institutionLines', e.target.value)}
                placeholder={"EyeQu LASIK & Eye Center\nBekasi Timur"}
                className="w-full text-xs font-mono border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                State & Date
              </label>
              <textarea
                rows={2}
                value={data.locationLines.join('\n')}
                onChange={(e) => handleLinesChange('locationLines', e.target.value)}
                placeholder={"EyeQu LASIK & Eye Center Bekasi Timur\nIndonesia, 9 Feb 2026"}
                className="w-full text-xs font-mono border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Signatory Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  Signature
                </h2>
              </div>
              <button
                type="button"
                onClick={onOpenSignatureProfileManager}
                className="text-xs text-blue-700 font-bold hover:underline"
              >
                Manage Signatures
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Signatures
              </label>
              <select
                value={activeProfile ? activeProfile.id : '__custom__'}
                onChange={(e) => {
                  if (e.target.value === '__manage__') {
                    onOpenSignatureProfileManager();
                  } else {
                    const p = signatureProfiles.find((sp) => sp.id === e.target.value);
                    if (p) onSelectSignatureProfile(p);
                  }
                }}
                className="w-full text-xs font-medium border border-slate-300 rounded-xl p-3 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs min-h-[44px]"
              >
                {signatureProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label || `${p.signatoryName} (${p.signatoryTitle})`}
                  </option>
                ))}
                <option value="__manage__">⚙️ Manage Signatures...</option>
              </select>
            </div>

            {/* Signature Graphic Preview */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-24 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 overflow-hidden shrink-0">
                {data.signatureImage ? (
                  <img
                    src={data.signatureImage}
                    alt="Signature"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-slate-400">No stroke</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {data.signatoryName}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {data.signatoryTitle}
                </div>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                Security
              </h2>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.pdfSecurity?.isProtected ?? true}
                onChange={(e) =>
                  onChange({
                    pdfSecurity: {
                      isProtected: e.target.checked,
                      ownerPassword: data.pdfSecurity?.ownerPassword || 'ZeissCert#2026',
                    },
                  })
                }
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">
                  Protect PDF from Editing (View & Print Only)
                </span>
                <span className="text-[11px] text-slate-500 leading-relaxed">
                  Locks exported PDF against text changes while recipients can open and print freely.
                </span>
              </div>
            </label>

            {(data.pdfSecurity?.isProtected ?? true) && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <label className="text-[11.5px] font-bold text-slate-800 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-700" />
                    Owner / Administrator Password
                  </label>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    To unlock editing
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showOwnerPassword ? 'text' : 'password'}
                    value={data.pdfSecurity?.ownerPassword || 'ZeissCert#2026'}
                    onChange={(e) =>
                      onChange({
                        pdfSecurity: {
                          isProtected: data.pdfSecurity?.isProtected ?? true,
                          ownerPassword: e.target.value,
                        },
                      })
                    }
                    placeholder="Enter owner password"
                    className="w-full text-xs font-mono border border-slate-300 rounded-lg pl-3 pr-10 py-2 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[38px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 min-h-[34px] min-w-[34px] flex items-center justify-center"
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
                  Default: <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-700 font-mono font-semibold">ZeissCert#2026</code>. Recipients can open and print without entering any password.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 4: REVIEW & GENERATE (4/4) (Matches Designer Mockup)
         ========================================================================= */}
      {currentStep === 4 && (
        <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Review & Generate
                </h2>
                <p className="text-xs text-slate-500">
                  Check your details before creating the certificate.
                </p>
              </div>
            </div>

            {/* Summary Details List */}
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
              {/* Recipient */}
              <div className="p-3.5 flex items-start gap-3">
                <User className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Recipient ({recipients.length})
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {data.recipientName}
                  </div>
                  {recipients.length > 1 && (
                    <div className="text-[11px] text-blue-700 font-medium mt-0.5">
                      + {recipients.length - 1} other recipient(s) in batch
                    </div>
                  )}
                </div>
              </div>

              {/* Procedure */}
              <div className="p-3.5 flex items-start gap-3">
                <GraduationCap className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Procedure & Qualification
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {data.qualificationLines[0] || 'Procedure'}
                  </div>
                  {data.qualificationLines[1] && (
                    <div className="text-[11px] text-slate-600">
                      {data.qualificationLines[1]}
                    </div>
                  )}
                </div>
              </div>

              {/* Institution */}
              <div className="p-3.5 flex items-start gap-3">
                <Building2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Institution
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {data.institutionLines.join(' · ')}
                  </div>
                </div>
              </div>

              {/* Training Date */}
              <div className="p-3.5 flex items-start gap-3">
                <Calendar className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Training Date & Location
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {data.locationLines.join(', ')}
                  </div>
                </div>
              </div>

              {/* Signatory */}
              <div className="p-3.5 flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Authorized Signatory
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {data.signatoryName} ({data.signatoryTitle})
                  </div>
                </div>
              </div>
            </div>

            {/* Multiple Recipients Export Options */}
            {recipients.length > 1 && (
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-800">
                  Select Export Format for All {recipients.length} Recipients:
                </label>

                <div className="grid grid-cols-1 gap-2">
                  {/* Option 1: Combined Multi-Page PDF */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      exportFormat === 'combined'
                        ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportFormat"
                      checked={exportFormat === 'combined'}
                      onChange={() => setExportFormat('combined')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-700 shrink-0" />
                        <span className="text-xs font-bold text-slate-900">
                          Combined Multi-Page PDF ({recipients.length} Pages)
                        </span>
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded shrink-0">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        All {recipients.length} certificates merged into 1 single PDF file (1 page per recipient).
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Batch ZIP Archive */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      exportFormat === 'zip'
                        ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportFormat"
                      checked={exportFormat === 'zip'}
                      onChange={() => setExportFormat('zip')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileArchive className="w-4 h-4 text-blue-700 shrink-0" />
                        <span className="text-xs font-bold text-slate-900">
                          Batch ZIP Archive ({recipients.length} Separate Files)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Download a ZIP archive containing individual PDF files for each doctor.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Current Recipient Only */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      exportFormat === 'single'
                        ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportFormat"
                      checked={exportFormat === 'single'}
                      onChange={() => setExportFormat('single')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-slate-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-900 truncate">
                          Current Recipient Only ({data.recipientName})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Export only 1 single PDF for the active participant.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Live Preview Button */}
            <button
              type="button"
              onClick={onOpenPreview}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-slate-800 transition-colors"
            >
              <Eye className="w-4 h-4 text-blue-400" />
              <span>Inspect Live A4 Certificate Preview</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          FIXED STICKY BOTTOM NAVIGATION BAR (Steps 1 to 4)
         ========================================================================= */}
      {currentStep > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-lg pb-[calc(0.7rem+env(safe-area-inset-bottom,0px))]">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            {/* Back button */}
            <button
              type="button"
              onClick={() => setCurrentStep((s) => s - 1)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold min-h-[44px] transition-colors"
            >
              Back
            </button>

            {/* Next / Generate Button */}
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s + 1)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#004F9E] hover:bg-[#003d7c] active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-md min-h-[44px] transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (recipients.length <= 1 || exportFormat === 'single') {
                    onExportCurrent();
                  } else if (exportFormat === 'combined') {
                    onExportCombinedPdf();
                  } else if (exportFormat === 'zip') {
                    onExportBatchZip();
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#004F9E] hover:bg-[#003d7c] active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-md min-h-[44px] transition-all"
              >
                <Download className="w-4 h-4" />
                <span className="truncate">
                  {recipients.length <= 1 || exportFormat === 'single'
                    ? 'Generate Certificate'
                    : exportFormat === 'combined'
                    ? `Generate Combined PDF (${recipients.length}p)`
                    : `Generate Batch ZIP (${recipients.length})`}
                </span>
              </button>
            )}

            {/* Quick Preview Icon button on steps 1-3 */}
            {currentStep < 4 && (
              <button
                type="button"
                onClick={onOpenPreview}
                className="p-2.5 bg-slate-900 text-white rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center shadow-xs"
                title="Preview"
              >
                <Eye className="w-4 h-4 text-blue-400" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
