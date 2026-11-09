import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import JSZip from 'jszip';
import { CertificateData, ValidationResult } from '../types';
import { validateCertificateDom } from './overflowValidation';

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/__+/g, '_');
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getEncryptionConfig(data: CertificateData) {
  if (!data.pdfSecurity?.isProtected) return undefined;
  return {
    userPassword: '', // Empty: recipients open and view freely without password prompt
    ownerPassword: data.pdfSecurity.ownerPassword || 'ZeissCert#2026',
    userPermissions: ['print' as any], // Permits high-res printing; disables modifying/copying/tampering
  };
}

/**
 * Capture an HTML element into a jsPDF A4 page
 */
export async function captureElementToPdf(
  element: HTMLElement,
  data: CertificateData,
  pdfInstance?: jsPDF
): Promise<jsPDF> {
  // Ensure all fonts are completely ready before rasterization
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready;
  }

  // Perform strict overflow & asset validation
  const validation: ValidationResult = await validateCertificateDom(element, data);
  if (!validation.isValid) {
    const errorMsgs = validation.errors.map((e) => e.message).join('\n• ');
    throw new Error(`Certificate validation failed before PDF generation:\n• ${errorMsgs}`);
  }

  // Ensure all images are fully loaded and decoded before rasterization
  const imgElements = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    imgElements.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );

  // Capture at 3x scale: 210mm x 297mm converts to 2382px x 3369px (true 300+ DPI print grade)
  const canvas = await html2canvas(element, {
    scale: 3.0,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    allowTaint: true,
    imageTimeout: 8000,
    onclone: (_clonedDoc: Document, clonedEl: HTMLElement) => {
      clonedEl.style.left = '0px';
      clonedEl.style.top = '0px';
      const vTitle = clonedEl.querySelector('.vertical-title') as HTMLElement | null;
      if (vTitle) {
        vTitle.style.transform = 'none';
        vTitle.style.transformOrigin = 'initial';
      }
    },
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const encryption = getEncryptionConfig(data);
  const pdf =
    pdfInstance ||
    new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      encryption,
    });

  // Exactly fit A4 (210mm x 297mm) with 0 margin
  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  return pdf;
}

/**
 * Export current certificate directly as PDF
 */
export async function exportCurrentCertificate(
  element: HTMLElement,
  data: CertificateData,
  recipientName: string
): Promise<void> {
  const pdf = await captureElementToPdf(element, data);
  const filename = `Certificate_${sanitizeFilename(recipientName || 'Training')}.pdf`;
  pdf.save(filename);
}

/**
 * Render batch of recipients into separate PDFs and package them into a single ZIP file
 */
export async function exportBatchAsZip(
  recipients: string[],
  data: CertificateData,
  renderRecipientNode: (name: string) => Promise<HTMLElement>,
  cleanupNode: (node: HTMLElement) => void,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const zip = new JSZip();
  const total = recipients.length;

  for (let i = 0; i < total; i++) {
    const recipient = recipients[i];
    if (onProgress) onProgress(i + 1, total);

    const node = await renderRecipientNode(recipient);
    const pdf = await captureElementToPdf(node, data);
    cleanupNode(node);

    const pdfArrayBuffer = pdf.output('arraybuffer');
    const filename = `Certificate_${i + 1}_${sanitizeFilename(recipient)}.pdf`;
    zip.file(filename, pdfArrayBuffer);
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  downloadBlob(zipBlob, `ZEISS_Certificates_${recipients.length}_Recipients.zip`);
}

/**
 * Render all recipients into a single combined multi-page PDF document
 */
export async function exportCombinedPdf(
  recipients: string[],
  data: CertificateData,
  renderRecipientNode: (name: string) => Promise<HTMLElement>,
  cleanupNode: (node: HTMLElement) => void,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const total = recipients.length;
  let combinedPdf: jsPDF | null = null;

  for (let i = 0; i < total; i++) {
    const recipient = recipients[i];
    if (onProgress) onProgress(i + 1, total);

    const node = await renderRecipientNode(recipient);

    if (i === 0) {
      combinedPdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        encryption: getEncryptionConfig(data),
      });
      await captureElementToPdf(node, data, combinedPdf);
    } else if (combinedPdf) {
      combinedPdf.addPage('a4', 'portrait');
      await captureElementToPdf(node, data, combinedPdf);
    }

    cleanupNode(node);
  }

  if (combinedPdf) {
    combinedPdf.save(`ZEISS_Certificates_Combined_${recipients.length}_Recipients.pdf`);
  }
}
