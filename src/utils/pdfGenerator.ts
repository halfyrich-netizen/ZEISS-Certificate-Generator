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

  // Capture at 3x scale: 210mm x 297mm converts to 2382px x 3369px (true 300+ DPI print grade)
  const canvas = await html2canvas(element, {
    scale: 3.0,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    allowTaint: true,
    imageTimeout: 5000,
    onclone: (_clonedDoc: Document, clonedEl: HTMLElement) => {
      // Guarantee cloned node is stationed at 0,0 with 0 0 transform-origin for pristine rotation math
      clonedEl.style.left = '0px';
      clonedEl.style.top = '0px';
      const vTitle = clonedEl.querySelector('.vertical-title') as HTMLElement | null;
      if (vTitle) {
        vTitle.style.transformOrigin = '0 0';
        vTitle.style.transform = 'rotate(-90deg)';
      }
    },
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const pdf =
    pdfInstance ||
    new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
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
