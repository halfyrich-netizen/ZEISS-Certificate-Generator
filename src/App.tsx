import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CertificateData } from './types';
import { INITIAL_CERTIFICATE_DATA } from './constants/defaults';
import { Header } from './components/Header';
import { RecipientManager } from './components/RecipientManager';
import { CertificateEditor } from './components/CertificateEditor';
import { PreviewDeck } from './components/PreviewDeck';
import { SignaturePadModal } from './components/SignaturePadModal';
import { FontManagerModal } from './components/FontManagerModal';
import { DiagnosticModal } from './components/DiagnosticModal';
import { ExportProgressModal } from './components/ExportProgressModal';
import { CertificateView } from './components/CertificateView';
import {
  exportCurrentCertificate,
  exportBatchAsZip,
  exportCombinedPdf,
} from './utils/pdfGenerator';
import {
  loadCachedFonts,
  checkZeissFontStatus,
  getFontsFromDb,
} from './utils/fontManager';
import { createRoot } from 'react-dom/client';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<CertificateData>(INITIAL_CERTIFICATE_DATA);
  const [activeRecipientIndex, setActiveRecipientIndex] = useState<number>(0);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState<boolean>(false);
  const [isFontModalOpen, setIsFontModalOpen] = useState<boolean>(false);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState<boolean>(false);
  const [isZeissFontActive, setIsZeissFontActive] = useState<boolean>(false);
  const [loadedFontNames, setLoadedFontNames] = useState<string[]>([]);
  const [validationErrorModal, setValidationErrorModal] = useState<string | null>(null);

  // Check and initialize local fonts
  const refreshFontStatus = useCallback(async () => {
    try {
      const stored = await getFontsFromDb();
      setLoadedFontNames(stored.map((s) => s.name));
      const active = checkZeissFontStatus() || stored.length > 0;
      setIsZeissFontActive(active);
    } catch {
      setIsZeissFontActive(false);
    }
  }, []);

  useEffect(() => {
    loadCachedFonts().then(() => {
      refreshFontStatus();
    });
  }, [refreshFontStatus]);

  // Batch Export Progress state
  const [exportModalState, setExportModalState] = useState<{
    isOpen: boolean;
    type: 'zip' | 'combined' | 'single';
    current: number;
    total: number;
    currentRecipientName: string;
    isComplete: boolean;
  }>({
    isOpen: false,
    type: 'zip',
    current: 0,
    total: 0,
    currentRecipientName: '',
    isComplete: false,
  });

  const offscreenContainerRef = useRef<HTMLDivElement | null>(null);

  // Updates to certificate data
  const handleDataChange = (updated: Partial<CertificateData>) => {
    setData((prev) => ({ ...prev, ...updated }));
  };

  // Recipient Management
  const handleAddRecipient = (name: string) => {
    setData((prev) => {
      const updated = [...prev.recipients, name];
      return { ...prev, recipients: updated, recipientName: updated[activeRecipientIndex] || name };
    });
    setActiveRecipientIndex(data.recipients.length);
  };

  const handleRemoveRecipient = (index: number) => {
    setData((prev) => {
      const updated = prev.recipients.filter((_, i) => i !== index);
      const newRecipients = updated.length > 0 ? updated : ['Recipient Name'];
      return {
        ...prev,
        recipients: newRecipients,
        recipientName: newRecipients[0],
      };
    });
    if (activeRecipientIndex >= index && activeRecipientIndex > 0) {
      setActiveRecipientIndex(activeRecipientIndex - 1);
    }
  };

  const handleSetRecipients = (names: string[]) => {
    const list = names.length > 0 ? names : ['Recipient Name'];
    setData((prev) => ({
      ...prev,
      recipients: list,
      recipientName: list[0],
    }));
    setActiveRecipientIndex(0);
  };

  const handleSelectRecipient = (index: number) => {
    setActiveRecipientIndex(index);
    const name = data.recipients[index] || data.recipients[0] || 'Recipient Name';
    setData((prev) => ({ ...prev, recipientName: name }));
  };

  // Reset to default specification example
  const handleResetToDefaults = () => {
    setData(INITIAL_CERTIFICATE_DATA);
    setActiveRecipientIndex(0);
  };

  // Save new signature
  const handleSaveSignature = (sigUrl: string) => {
    setData((prev) => ({ ...prev, signatureImage: sigUrl }));
  };

  /**
   * Helper to render off-screen certificate DOM element at exact 1:1 scale (210mm x 297mm)
   * for zero-distortion capture and font metrics
   */
  const renderRecipientNode = useCallback(
    async (recipientName: string): Promise<HTMLElement> => {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.left = '0px';
      wrapper.style.top = '0px';
      wrapper.style.width = '210mm';
      wrapper.style.height = '297mm';
      wrapper.style.zIndex = '-99999';
      wrapper.style.pointerEvents = 'none';
      document.body.appendChild(wrapper);

      const root = createRoot(wrapper);
      root.render(
        <CertificateView
          data={data}
          recipientName={recipientName}
          scale={1}
        />
      );

      // Await fonts and DOM paint
      if (document.fonts) {
        await document.fonts.ready;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));

      const certNode = (wrapper.querySelector('.certificate-page') as HTMLElement) || wrapper;
      (wrapper as any).__reactRoot = root;
      return certNode;
    },
    [data]
  );

  const cleanupNode = useCallback((node: HTMLElement) => {
    const parent = node.closest('div[style*="position: fixed"]') || node.parentElement;
    if (parent) {
      if ((parent as any).__reactRoot) {
        (parent as any).__reactRoot.unmount();
      }
      if (document.body.contains(parent)) {
        document.body.removeChild(parent);
      }
    }
  }, []);

  // Export current single PDF
  const handleExportCurrent = async () => {
    const recipients = data.recipients.length > 0 ? data.recipients : ['Recipient Name'];
    const currentName = recipients[activeRecipientIndex] || recipients[0];

    try {
      const node = await renderRecipientNode(currentName);
      await exportCurrentCertificate(node, data, currentName);
      cleanupNode(node);
    } catch (err: any) {
      console.error('Export failed:', err);
      setValidationErrorModal(err.message || 'Export failed.');
    }
  };

  // Export batch ZIP
  const handleExportBatchZip = async () => {
    const recipients = data.recipients.length > 0 ? data.recipients : ['Recipient Name'];
    setExportModalState({
      isOpen: true,
      type: 'zip',
      current: 0,
      total: recipients.length,
      currentRecipientName: recipients[0],
      isComplete: false,
    });

    try {
      await exportBatchAsZip(
        recipients,
        data,
        renderRecipientNode,
        cleanupNode,
        (curr, tot) => {
          setExportModalState((prev) => ({
            ...prev,
            current: curr,
            total: tot,
            currentRecipientName: recipients[curr - 1] || '',
          }));
        }
      );

      setExportModalState((prev) => ({ ...prev, isComplete: true }));
    } catch (err: any) {
      console.error('Batch ZIP export failed:', err);
      setExportModalState((prev) => ({ ...prev, isOpen: false }));
      setValidationErrorModal(err.message || 'Batch ZIP export failed.');
    }
  };

  // Export Combined multi-page PDF
  const handleExportCombinedPdf = async () => {
    const recipients = data.recipients.length > 0 ? data.recipients : ['Recipient Name'];
    setExportModalState({
      isOpen: true,
      type: 'combined',
      current: 0,
      total: recipients.length,
      currentRecipientName: recipients[0],
      isComplete: false,
    });

    try {
      await exportCombinedPdf(
        recipients,
        data,
        renderRecipientNode,
        cleanupNode,
        (curr, tot) => {
          setExportModalState((prev) => ({
            ...prev,
            current: curr,
            total: tot,
            currentRecipientName: recipients[curr - 1] || '',
          }));
        }
      );

      setExportModalState((prev) => ({ ...prev, isComplete: true }));
    } catch (err: any) {
      console.error('Combined PDF export failed:', err);
      setExportModalState((prev) => ({ ...prev, isOpen: false }));
      setValidationErrorModal(err.message || 'Combined PDF export failed.');
    }
  };

  // Direct Browser Print (Zero Margin A4)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900">
      {/* Top Navigation */}
      <Header
        onExportCurrent={handleExportCurrent}
        onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
        onOpenFontModal={() => setIsFontModalOpen(true)}
        onOpenDiagnosticModal={() => setIsDiagnosticModalOpen(true)}
        onPrint={handlePrint}
        recipientCount={data.recipients.length}
        isZeissFontActive={isZeissFontActive}
      />

      {/* Main Workspace split */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Configuration Controls (5 cols on lg) */}
        <div className="no-print lg:col-span-5 xl:col-span-4 space-y-4">
          <RecipientManager
            recipients={data.recipients}
            activeRecipientIndex={activeRecipientIndex}
            onSelectRecipient={handleSelectRecipient}
            onAddRecipient={handleAddRecipient}
            onRemoveRecipient={handleRemoveRecipient}
            onSetRecipients={handleSetRecipients}
          />

          <CertificateEditor
            data={data}
            onChange={handleDataChange}
            onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
            onResetToDefaults={handleResetToDefaults}
          />
        </div>

        {/* Right Column: Live A4 Preview Deck (7 cols on lg) */}
        <div className="lg:col-span-7 xl:col-span-8 sticky top-20">
          <PreviewDeck
            data={data}
            activeRecipientIndex={activeRecipientIndex}
            isZeissFontActive={isZeissFontActive}
            onOpenFontModal={() => setIsFontModalOpen(true)}
            onOpenDiagnosticModal={() => setIsDiagnosticModalOpen(true)}
            onSelectRecipient={handleSelectRecipient}
            onExportCurrent={handleExportCurrent}
            onExportBatchZip={handleExportBatchZip}
            onExportCombinedPdf={handleExportCombinedPdf}
            onPrint={handlePrint}
          />
        </div>
      </main>

      {/* Signature Authentication Modal */}
      <SignaturePadModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        currentSignature={data.signatureImage}
        onSaveSignature={handleSaveSignature}
      />

      {/* Font Manager Modal */}
      <FontManagerModal
        isOpen={isFontModalOpen}
        onClose={() => setIsFontModalOpen(false)}
        isZeissFontActive={isZeissFontActive}
        loadedFontNames={loadedFontNames}
        onFontsUpdated={refreshFontStatus}
      />

      {/* Diagnostic Console Modal */}
      <DiagnosticModal
        isOpen={isDiagnosticModalOpen}
        onClose={() => setIsDiagnosticModalOpen(false)}
      />

      {/* Batch Export Progress Modal */}
      <ExportProgressModal
        isOpen={exportModalState.isOpen}
        type={exportModalState.type}
        current={exportModalState.current}
        total={exportModalState.total}
        currentRecipientName={exportModalState.currentRecipientName}
        isComplete={exportModalState.isComplete}
        onClose={() => setExportModalState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Validation Error Modal */}
      {validationErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-rose-200 w-full max-w-md p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Export Pre-Flight Validation Check Failed
                </h3>
                <div className="text-xs text-slate-600 font-mono whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2 max-h-56 overflow-y-auto">
                  {validationErrorModal}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setValidationErrorModal(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Dismiss & Correct
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Off-screen capture staging area */}
      <div ref={offscreenContainerRef} className="no-print" />
    </div>
  );
}
