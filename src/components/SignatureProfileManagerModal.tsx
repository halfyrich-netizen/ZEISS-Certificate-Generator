import React, { useState, useRef, useEffect } from 'react';
import { SavedSignatureProfile } from '../types';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Upload,
  PenTool,
  RotateCcw,
  User,
  Building,
  Briefcase,
} from 'lucide-react';

interface SignatureProfileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: SavedSignatureProfile[];
  activeProfileId?: string;
  onSelectProfile: (profile: SavedSignatureProfile) => void;
  onSaveProfile: (profile: SavedSignatureProfile) => void;
  onDeleteProfile: (profileId: string) => void;
}

export const SignatureProfileManagerModal: React.FC<SignatureProfileManagerModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onSaveProfile,
  onDeleteProfile,
}) => {
  const [editingProfile, setEditingProfile] = useState<SavedSignatureProfile | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
  const [strokeColor, setStrokeColor] = useState<string>('#1D1D1F');
  const [lineWidth, setLineWidth] = useState<number>(2.5);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Form State
  const [formLabel, setFormLabel] = useState('');
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDept, setFormDept] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formSignatureImage, setFormSignatureImage] = useState<string | null>(null);

  // Reset form when opening editor
  const handleStartEdit = (profile: SavedSignatureProfile) => {
    setEditingProfile(profile);
    setIsAddingNew(false);
    setFormLabel(profile.label);
    setFormName(profile.signatoryName);
    setFormTitle(profile.signatoryTitle);
    setFormDept(profile.signatoryDepartment);
    setFormCompany(profile.signatoryCompany);
    setFormSignatureImage(profile.signatureImage);
  };

  const handleStartAdd = () => {
    setEditingProfile(null);
    setIsAddingNew(true);
    setFormLabel('');
    setFormName('');
    setFormTitle('Application Specialist REF');
    setFormDept('Medical Technology Business Group');
    setFormCompany('Carl Zeiss Pte. Ltd. - Representative Office in Indonesia');
    setFormSignatureImage(null);
  };

  const handleCancelForm = () => {
    setEditingProfile(null);
    setIsAddingNew(false);
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    lastPointRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const currentPoint = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();

    lastPointRef.current = currentPoint;
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      setFormSignatureImage(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setFormSignatureImage(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const offscreen = document.createElement('canvas');
        offscreen.width = img.width;
        offscreen.height = img.height;
        const ctx = offscreen.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);

        // Auto remove paper off-white background
        const imgData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (r > 230 && g > 230 && b > 230) {
            data[i + 3] = 0; // Make pure transparent
          }
        }
        ctx.putImageData(imgData, 0, 0);
        setFormSignatureImage(offscreen.toDataURL('image/png'));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const profileToSave: SavedSignatureProfile = {
      id: editingProfile ? editingProfile.id : `sig-${Date.now()}`,
      label: formLabel.trim() || `${formName.trim()} (${formTitle.trim()})`,
      signatoryName: formName.trim(),
      signatoryTitle: formTitle.trim(),
      signatoryDepartment: formDept.trim(),
      signatoryCompany: formCompany.trim(),
      signatureImage: formSignatureImage,
      isDefault: editingProfile?.isDefault || false,
    };

    onSaveProfile(profileToSave);
    handleCancelForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-semibold tracking-wide">
              Manage Signatures
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {!editingProfile && !isAddingNew ? (
            /* Profiles List View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {profiles.length} Saved Signature(s)
                </span>
                <button
                  onClick={handleStartAdd}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Signature
                </button>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-[420px] overflow-y-auto">
                {profiles.map((profile) => {
                  const isSelected = profile.id === activeProfileId;
                  return (
                    <div
                      key={profile.id}
                      className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                        isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Signature Thumbnail */}
                        <div className="w-20 h-12 bg-white border border-slate-200 rounded flex items-center justify-center overflow-hidden shrink-0 p-1">
                          {profile.signatureImage ? (
                            <img
                              src={profile.signatureImage}
                              alt={profile.signatoryName}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No image</span>
                          )}
                        </div>

                        {/* Metadata */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {profile.signatoryName}
                            </span>
                            {profile.isDefault && (
                              <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                                Default
                              </span>
                            )}
                            {isSelected && (
                              <span className="text-[10px] font-semibold bg-blue-600 text-white px-1.5 py-0.2 rounded">
                                Active on Cert
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 truncate">
                            {profile.signatoryTitle}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {profile.signatoryCompany}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {!isSelected ? (
                          <button
                            onClick={() => onSelectProfile(profile)}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Apply
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-xs font-semibold text-blue-700 px-2 py-1">
                            <Check className="w-3.5 h-3.5 text-blue-600" />
                            Applied
                          </div>
                        )}

                        <button
                          onClick={() => handleStartEdit(profile)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                          title="Edit profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {!profile.isDefault && (
                          <button
                            onClick={() => onDeleteProfile(profile.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50 transition-colors"
                            title="Delete profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Add / Edit Profile Form */
            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {isAddingNew ? 'Add New Signature Profile' : `Edit Signature: ${editingProfile?.signatoryName}`}
                </h3>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Back to List
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Profile Label (Dropdown Display Name)
                  </label>
                  <input
                    type="text"
                    value={formLabel}
                    onChange={(e) => setFormLabel(e.target.value)}
                    placeholder="e.g. Dr. Hary Destianto (Lead Application Specialist)"
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Signatory Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Hary Destianto"
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Signatory Title
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Application Specialist REF"
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Group / Department
                  </label>
                  <input
                    type="text"
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    placeholder="e.g. Medical Technology Business Group"
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Legal Entity
                  </label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Carl Zeiss Pte. Ltd. - Representative Office in Indonesia"
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Signature Graphic Acquisition */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Signature Graphic
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setSignatureMode('draw')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                        signatureMode === 'draw'
                          ? 'bg-white text-blue-700 font-semibold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <PenTool className="w-3 h-3" />
                      Draw
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignatureMode('upload')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                        signatureMode === 'upload'
                          ? 'bg-white text-blue-700 font-semibold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      Upload PNG
                    </button>
                  </div>
                </div>

                {signatureMode === 'draw' ? (
                  <div className="space-y-2">
                    <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-50 relative">
                      <canvas
                        ref={canvasRef}
                        width={480}
                        height={160}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-36 bg-white cursor-crosshair touch-none"
                      />
                      <div className="absolute bottom-2 right-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={clearCanvas}
                          className="flex items-center gap-1 text-[11px] text-slate-600 bg-white/90 hover:bg-white border border-slate-200 px-2 py-1 rounded shadow-2xs"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="modal-sig-upload"
                    />
                    <label
                      htmlFor="modal-sig-upload"
                      className="cursor-pointer flex flex-col items-center gap-1.5"
                    >
                      <Upload className="w-6 h-6 text-blue-600" />
                      <span className="text-xs font-semibold text-slate-800">
                        Click to upload signature image
                      </span>
                      <span className="text-[10.5px] text-slate-500">
                        PNG or JPG (white backgrounds automatically made transparent)
                      </span>
                    </label>
                  </div>
                )}

                {/* Signature Preview */}
                {formSignatureImage && (
                  <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">Current Stroke Preview:</span>
                      <img
                        src={formSignatureImage}
                        alt="Signature Preview"
                        className="h-8 max-w-[160px] object-contain"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormSignatureImage(null)}
                      className="text-[11px] text-rose-600 hover:text-rose-800"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
          <span>Profiles persist offline across training sessions</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
