import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Pen, Upload, RotateCcw, Trash2, Check, X, ShieldCheck } from 'lucide-react';
import { DEFAULT_HARY_DESTIANTO_SIGNATURE } from '../constants/defaults';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSignature: string | null;
  onSaveSignature: (signatureDataUrl: string) => void;
}

interface StrokePoint {
  x: number;
  y: number;
}

interface Stroke {
  points: StrokePoint[];
  color: string;
  width: number;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  currentSignature,
  onSaveSignature,
}) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'upload'>('draw');
  const [penColor, setPenColor] = useState<string>('#0f172a');
  const [penWidth, setPenWidth] = useState<number>(2.5);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Redraw canvas whenever strokes change
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        // Simple smoothing using midpoint quadratic curves
        const midX = (stroke.points[i - 1].x + stroke.points[i].x) / 2;
        const midY = (stroke.points[i - 1].y + stroke.points[i].y) / 2;
        ctx.quadraticCurveTo(stroke.points[i - 1].x, stroke.points[i - 1].y, midX, midY);
      }
      ctx.lineTo(stroke.points[stroke.points.length - 1].x, stroke.points[stroke.points.length - 1].y);
      ctx.stroke();
    });
  }, [strokes]);

  useEffect(() => {
    if (activeTab === 'draw') {
      redrawCanvas();
    }
  }, [strokes, activeTab, redrawCanvas]);

  if (!isOpen) return null;

  // Coordinate helper for canvas
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): StrokePoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    setStrokes((prev) => [
      ...prev,
      {
        points: [coords],
        color: penColor,
        width: penWidth,
      },
    ]);
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const lastStroke = prev[prev.length - 1];
      const updatedLast = {
        ...lastStroke,
        points: [...lastStroke.points, coords],
      };
      return [...prev.slice(0, -1), updatedLast];
    });
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setStrokes([]);
  };

  // Image Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPresetSignature = () => {
    onSaveSignature(DEFAULT_HARY_DESTIANTO_SIGNATURE);
    onClose();
  };

  const handleSave = () => {
    if (activeTab === 'upload') {
      if (uploadedPreview) {
        onSaveSignature(uploadedPreview);
        onClose();
      }
    } else {
      const canvas = canvasRef.current;
      if (!canvas || strokes.length === 0) {
        onClose();
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      onSaveSignature(dataUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <h2 className="text-base font-semibold text-slate-900">
              Signature Authentication
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 flex gap-2">
          <button
            onClick={() => setActiveTab('draw')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'draw'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 border border-transparent'
            }`}
          >
            <Pen className="w-4 h-4" />
            Draw Digital Signature
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'upload'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 border border-transparent'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Image
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === 'draw' ? (
            <div>
              {/* Canvas Controls Bar */}
              <div className="flex items-center justify-between mb-3 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-700">Pen Color:</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { label: 'Black', val: '#0f172a' },
                      { label: 'Zeiss Blue', val: '#004F9E' },
                      { label: 'Navy', val: '#1e3a8a' },
                      { label: 'Charcoal', val: '#334155' },
                    ].map((col) => (
                      <button
                        key={col.val}
                        onClick={() => setPenColor(col.val)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          penColor === col.val
                            ? 'scale-110 border-blue-500 ring-2 ring-blue-200'
                            : 'border-slate-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: col.val }}
                        title={col.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700">Width:</span>
                  <select
                    value={penWidth}
                    onChange={(e) => setPenWidth(Number(e.target.value))}
                    className="border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={1.8}>Fine (1.8px)</option>
                    <option value={2.5}>Medium (2.5px)</option>
                    <option value={3.5}>Bold (3.5px)</option>
                  </select>
                </div>
              </div>

              {/* Drawing Canvas */}
              <div className="relative border-2 border-dashed border-slate-300 rounded-lg overflow-hidden bg-white shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={480}
                  height={220}
                  className="w-full h-52 touch-none cursor-crosshair block"
                  onMouseDown={handleStart}
                  onMouseMove={handleMove}
                  onMouseUp={handleEnd}
                  onMouseLeave={handleEnd}
                  onTouchStart={handleStart}
                  onTouchMove={handleMove}
                  onTouchEnd={handleEnd}
                />
                {strokes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-sm">
                    Draw your signature here with mouse or stylus
                  </div>
                )}
                {/* Baseline Guide */}
                <div className="absolute bottom-8 left-8 right-8 border-b border-slate-200 pointer-events-none" />
              </div>

              {/* Canvas Actions */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUndo}
                    disabled={strokes.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-40 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Undo
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={strokes.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 rounded disabled:opacity-40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>

                <button
                  onClick={handleApplyPresetSignature}
                  className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  Load Hary Destianto Default
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* File Upload Zone */}
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-lg p-8 cursor-pointer bg-slate-50 hover:bg-blue-50/30 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm font-medium text-slate-700">
                  Click to select signature image
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  PNG, JPG, SVG or WebP with transparent/clean background
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Preview of Uploaded image */}
              {uploadedPreview && (
                <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-white flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-500 mb-2">
                    Image Preview:
                  </span>
                  <img
                    src={uploadedPreview}
                    alt="Uploaded signature preview"
                    className="max-h-24 object-contain"
                  />
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  Need the sample signature?
                </span>
                <button
                  onClick={handleApplyPresetSignature}
                  className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  Load Hary Destianto Signature
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={activeTab === 'draw' ? strokes.length === 0 : !uploadedPreview}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
          >
            <Check className="w-4 h-4" />
            Apply Signature
          </button>
        </div>
      </div>
    </div>
  );
};
