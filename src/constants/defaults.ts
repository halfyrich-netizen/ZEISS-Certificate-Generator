import { CertificateData, ProcedurePreset, SavedSignatureProfile } from '../types';

export const DEFAULT_HARY_DESTIANTO_SIGNATURE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="320" height="180">
  <path d="M 60 135 C 75 125, 95 105, 110 80 C 118 68, 126 50, 128 35 C 129 25, 126 22, 120 28 C 110 40, 102 70, 98 105 C 95 130, 94 150, 92 165 C 91 172, 94 175, 98 170 C 108 150, 120 115, 128 85 C 132 70, 134 60, 138 65 C 144 75, 146 100, 150 115 C 153 125, 158 130, 163 122 C 168 114, 172 98, 175 90 C 178 82, 183 80, 186 85 C 190 92, 192 110, 195 118 C 198 125, 204 125, 208 118 C 214 108, 220 92, 226 90 C 230 88, 235 94, 238 102 C 242 112, 246 120, 252 115 C 258 110, 265 95, 270 92" fill="none" stroke="%231e293b" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 105 100 C 120 98, 145 92, 170 94 C 185 95, 200 102, 215 102" fill="none" stroke="%231e293b" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M 125 45 C 140 40, 155 38, 170 42" fill="none" stroke="%231e293b" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M 55 140 C 90 120, 140 100, 190 90 C 220 85, 250 82, 280 84" fill="none" stroke="%231e293b" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

export const DEFAULT_PROCEDURE_PRESETS: ProcedurePreset[] = [
  {
    id: 'smile',
    name: 'SMILE',
    lines: [
      'ReLEx® SMILE® using ZEISS VisuMax®',
      'Femtosecond Laser System',
    ],
  },
  {
    id: 'smile-pro',
    name: 'SMILE pro',
    lines: [
      'SMILE® pro using ZEISS VISUMAX® 800',
      'Femtosecond Laser System',
    ],
  },
  {
    id: 'femtolasik',
    name: 'Femtolasik',
    lines: [
      'Femtosecond LASIK using VISUMAX® 800',
      'Femtosecond Laser System',
    ],
  },
  {
    id: 'mel90',
    name: 'MEL90',
    lines: [
      'MEL® 90 Excimer Laser System',
    ],
  },
  {
    id: 'presbyond',
    name: 'PRESBYOND',
    lines: [
      'PRESBYOND® using MEL® 90 Excimer Laser System',
    ],
  },
  {
    id: 'transprk',
    name: 'TransPRK',
    lines: [
      'Transepithelial PRK using',
      'ZEISS MEL® 90 Excimer Laser System',
    ],
  },
  {
    id: 'atlas500',
    name: 'ATLAS 500',
    lines: [
      'ATLAS® 500 Application',
    ],
  },
];

export const DEFAULT_SIGNATURE_PROFILES: SavedSignatureProfile[] = [
  {
    id: 'default-hary-destianto',
    label: 'Hary Destianto (Application Specialist REF)',
    signatoryName: 'Hary Destianto',
    signatoryTitle: 'Application Specialist REF',
    signatoryDepartment: 'Medical Technology Business Group',
    signatoryCompany: 'Carl Zeiss Pte. Ltd. - Representative Office in Indonesia',
    signatureImage: DEFAULT_HARY_DESTIANTO_SIGNATURE,
    isDefault: true,
  },
];

export const INITIAL_CERTIFICATE_DATA: CertificateData = {
  recipientName: 'Andreas S. Anugrah, MD',
  recipients: [
    'Andreas S. Anugrah, MD',
  ],
  institutionLines: [
    'EyeQu LASIK & Eye Center',
    'Bekasi Timur',
  ],
  statementLines: [
    'We hereby certify that the above-named has',
    'successfully completed the training and is a',
    'qualified user for',
  ],
  qualificationLines: [
    'Transepithelial PRK using',
    'ZEISS MEL® 90 Excimer Laser System',
  ],
  locationLines: [
    'EyeQu LASIK & Eye Center Bekasi Timur',
    'Indonesia, 9 Feb 2026',
  ],
  disclaimerLines: [
    'This certificate does not authorize treatment of patients in any state or country where',
    'the certificate holder is not otherwise licensed to perform refractive surgery.',
  ],
  signatoryName: 'Hary Destianto',
  signatoryTitle: 'Application Specialist REF',
  signatoryDepartment: 'Medical Technology Business Group',
  signatoryCompany: 'Carl Zeiss Pte. Ltd. - Representative Office in Indonesia',
  signatureImage: DEFAULT_HARY_DESTIANTO_SIGNATURE,
  selectedProcedureId: 'transprk',
  selectedSignatureId: 'default-hary-destianto',
  pdfSecurity: {
    isProtected: true,
    ownerPassword: 'ZeissCert#2026',
  },
};

export const SAMPLE_RECIPIENTS = [
  'Andreas S. Anugrah, MD',
  'Dr. Budi Santoso, Sp.M(K)',
  'Clara Wijaya, MD',
  'Dr. Hendra Gunawan, Sp.M',
  'Maya Indrawati, MD',
  'Dr. Reza Pratama, Sp.M(K)',
];
