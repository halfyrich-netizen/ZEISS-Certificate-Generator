export interface CertificateData {
  recipientName: string;
  recipients: string[];
  institutionLines: string[];
  statementLines: string[];
  qualificationLines: string[];
  locationLines: string[];
  disclaimerLines: string[];
  signatoryName: string;
  signatoryTitle: string;
  signatoryDepartment: string;
  signatoryCompany: string;
  signatureImage: string | null;
}

export interface OverflowValidationError {
  element: string;
  type: 'overflow_width' | 'overflow_height' | 'missing_content' | 'font_unloaded' | 'asset_missing';
  message: string;
  scrollWidth?: number;
  clientWidth?: number;
  scrollHeight?: number;
  clientHeight?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: OverflowValidationError[];
  warnings: string[];
}
