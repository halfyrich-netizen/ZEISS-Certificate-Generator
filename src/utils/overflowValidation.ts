import { CertificateData, ValidationResult, OverflowValidationError } from '../types';

/**
 * Validate every text box and element in the certificate DOM before PDF export
 */
export async function validateCertificateDom(
  rootElement: HTMLElement,
  data: CertificateData
): Promise<ValidationResult> {
  const errors: OverflowValidationError[] = [];
  const warnings: string[] = [];

  // 1. Check document fonts readiness
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      errors.push({
        element: 'fonts',
        type: 'font_unloaded',
        message: 'document.fonts.ready failed to resolve.',
      });
    }
  }

  // 2. Check required assets
  const logoEl = rootElement.querySelector('.zeiss-logo') as HTMLImageElement | null;
  if (!logoEl) {
    errors.push({
      element: 'zeiss-logo',
      type: 'asset_missing',
      message: 'Official ZEISS logo element is missing.',
    });
  } else if (!logoEl.complete || logoEl.naturalWidth === 0) {
    errors.push({
      element: 'zeiss-logo',
      type: 'asset_missing',
      message: 'Official ZEISS logo image failed to load.',
    });
  }

  const vTitleEl = rootElement.querySelector('.vertical-title') as HTMLImageElement | null;
  if (!vTitleEl) {
    errors.push({
      element: 'vertical-title',
      type: 'missing_content',
      message: 'Vertical CERTIFICATE title element is missing.',
    });
  } else if (vTitleEl.tagName === 'IMG' && (!vTitleEl.complete || vTitleEl.naturalWidth === 0)) {
    errors.push({
      element: 'vertical-title',
      type: 'asset_missing',
      message: 'Vertical CERTIFICATE title image failed to load.',
    });
  }

  const sigEl = rootElement.querySelector('.signature') as HTMLImageElement | null;
  if (!sigEl && data.signatureImage) {
    errors.push({
      element: 'signature',
      type: 'asset_missing',
      message: 'Signature image is configured but not rendered.',
    });
  }

  // 3. Expected lines check
  if (!data.recipientName || data.recipientName.trim().length === 0) {
    errors.push({
      element: 'recipient-name',
      type: 'missing_content',
      message: 'Recipient name is empty.',
    });
  }

  if (data.institutionLines.length === 0 || data.institutionLines.every((l) => !l.trim())) {
    errors.push({
      element: 'recipient-institution',
      type: 'missing_content',
      message: 'Recipient institution lines are missing.',
    });
  }

  if (data.statementLines.length === 0 || data.statementLines.every((l) => !l.trim())) {
    errors.push({
      element: 'certification-statement',
      type: 'missing_content',
      message: 'Certification statement lines cannot be empty.',
    });
  }

  if (data.qualificationLines.length === 0 || data.qualificationLines.every((l) => !l.trim())) {
    errors.push({
      element: 'qualification',
      type: 'missing_content',
      message: 'Qualification procedure lines cannot be empty.',
    });
  }

  if (data.disclaimerLines.length === 0 || data.disclaimerLines.every((l) => !l.trim())) {
    errors.push({
      element: 'disclaimer',
      type: 'missing_content',
      message: 'Legal disclaimer lines cannot be empty.',
    });
  }

  // 4. Element boundary & text clipping inspection
  // Elements that have explicit bounds or width constraints
  const elementsToCheck: { selector: string; name: string; allowWrap?: boolean; maxWidthPt?: number }[] = [
    { selector: '.recipient-name', name: 'Recipient Name', maxWidthPt: 315 },
    { selector: '.recipient-institution', name: 'Recipient Institution', maxWidthPt: 290 },
    { selector: '.certification-statement', name: 'Certification Statement' },
    { selector: '.qualification', name: 'Qualification' },
    { selector: '.location-date', name: 'Location and Date' },
    { selector: '.disclaimer', name: 'Legal Disclaimer' },
    { selector: '.signatory', name: 'Signatory Details' },
    { selector: '.vertical-title', name: 'Vertical Title' },
  ];

  for (const item of elementsToCheck) {
    const el = rootElement.querySelector(item.selector) as HTMLElement | null;
    if (!el) {
      errors.push({
        element: item.name,
        type: 'missing_content',
        message: `${item.name} element (.${item.selector}) was not found in the DOM.`,
      });
      continue;
    }

    const scrollW = el.scrollWidth;
    const clientW = el.clientWidth;
    const scrollH = el.scrollHeight;
    const clientH = el.clientHeight;

    // Check width overflow if clientWidth is constrained (> 0)
    if (clientW > 0 && scrollW > clientW + 1) {
      errors.push({
        element: item.name,
        type: 'overflow_width',
        message: `${item.name} text clipped horizontally (scrollWidth ${scrollW}px > clientWidth ${clientW}px).`,
        scrollWidth: scrollW,
        clientWidth: clientW,
      });
    }

    // Check height overflow if clientHeight is constrained (> 0)
    if (clientH > 0 && scrollH > clientH + 1) {
      errors.push({
        element: item.name,
        type: 'overflow_height',
        message: `${item.name} text clipped vertically (scrollHeight ${scrollH}px > clientHeight ${clientH}px).`,
        scrollHeight: scrollH,
        clientHeight: clientH,
      });
    }
  }

  // 5. Recipient name width evaluation
  const nameEl = rootElement.querySelector('.recipient-name') as HTMLElement | null;
  if (nameEl) {
    // 315 pt approx 111.1 mm (approx 420 px at 96dpi)
    const maxAllowedWidthPx = 425;
    if (nameEl.scrollWidth > maxAllowedWidthPx) {
      warnings.push(
        `Recipient name "${data.recipientName}" is wider than the standard 315pt bounding region at current font size.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
