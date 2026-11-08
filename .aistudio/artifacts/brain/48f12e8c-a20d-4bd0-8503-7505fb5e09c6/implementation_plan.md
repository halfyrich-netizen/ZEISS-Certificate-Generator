# Carl Zeiss Medical Training Certificate Generator

A high-fidelity, client-side Certificate Generator engineered to replicate the exact typography, layout, and visual geometry of Carl Zeiss medical laser training certificates, supporting single and batch multi-recipient generation, digital signature capture, and PDF/ZIP export.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following design and workflow decisions incorporate your confirmed answers from Phase 1:
> - **Batch Export Options**: Supports both individual PDF downloads bundled into a ZIP archive and a single combined multi-page PDF document.
> - **Signer Defaults**: Pre-populated with Hary Destianto (Application Specialist REF, Medical Technology Business Group, Carl Zeiss Pte. Ltd. - Representative Office in Indonesia), fully editable for any custom authority.
> - **Signature Input**: Dual input support featuring an interactive digital signature drawing pad with smoothing and clear/undo, alongside PNG/JPEG image upload with signature background transparency handling.

---

### 1. Overview & Core Concept

- **What It Does**: Enables clinical application specialists and training administrators to rapidly generate authentic, professional medical certificates matching the Carl Zeiss layout. Users can input single or multiple recipient names (via manual entry or multi-line paste/CSV), configure training details, hospital/clinic information, training date, and attach a certified signature.
- **Target Audience**: Clinical training specialists, medical device application teams, hospital laser suite coordinators, and CME administrators.
- **Key Value**: Eliminates manual graphic design and formatting errors; ensures 100% brand-faithful certificates with vector typography, precise vertical margin branding, crisp ZEISS emblem, and instantaneous batch export in seconds.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Certificate Configuration**: 
   - Left-hand workspace contains structured configuration panels:
     - **Recipients**: Bulk name input with tag-chips, paste-from-clipboard (newline/comma separated), or quick doctor name entry.
     - **Training Details**: Course title (e.g., *Transepithelial PRK using*), device/laser system (e.g., *ZEISS MEL® 90 Excimer Laser System*), and certification statement.
     - **Hospital & Location**: Clinic/Hospital name, city/branch, country, and date formatted as per European/medical standard (e.g., *Indonesia, 9 Feb 2026*).
     - **Signer & Authentication**: Signer name, title, department, company affiliation, and signature management.
2. **Signature Authentication Studio**:
   - Tab 1: **Upload Signature**: Drag-and-drop or file picker for existing signature PNG/JPG, with automatic thresholding to remove off-white paper backgrounds.
   - Tab 2: **Digital Signature Pad**: HTML5 canvas drawing pad with smooth Bezier curve strokes, pen thickness selector, and clear/reset controls.
   - Tab 3: **Carl Zeiss Preset**: Quick-load default authentic specialist signature from the reference document.
3. **Interactive Pixel-Perfect Live Preview**:
   - Right-hand canvas presents a responsive, print-accurate A4 sheet preview (1:1.414 ratio) with zoom controls (Fit, 75%, 100%, 125%).
   - When multiple recipients are configured, a recipient selector bar lets the user flick through every recipient's certificate in real time before exporting.
4. **Export & Batch Generation**:
   - Primary action bar offering:
     - **Download Current PDF**: High-resolution print-ready single certificate.
     - **Download All (ZIP)**: Individual named PDFs (e.g., `Certificate_Andreas_S_Anugrah_MD.pdf`) packed in a standard ZIP archive.
     - **Download All (Combined PDF)**: Multi-page high-resolution PDF document containing all recipients.
     - **Print**: Direct browser print dialog with print CSS matching exact A4 dimensions with zero margins.

#### Visual Identity & Typography
- **Certificate Layout (100% Reference Match)**:
  - **Left Rail**: Spaced vertical "C E R T I F I C A T E" lettering in light slate geometric sans-serif running down the left boundary.
  - **Main Content**:
    - Recipient name set in bold high-contrast sans-serif (`28px`, font-bold).
    - Hospital/Clinic name and branch in clean medium weights (`17px`, font-normal).
    - Certification statement in clear, spacious prose.
    - Laser equipment and procedure highlighted in bold (`16px`).
    - Date and city location block.
    - Standard refractive surgery medical disclaimer footnote (`9px`, text-slate-500).
    - Professional signature line with title block and Carl Zeiss brand affiliation.
    - Deep Zeiss Blue (`#004F9E` / `#0050A0`) square mark in the bottom right corner.
- **Application Interface Theme**:
  - Clean, clinical studio aesthetic with 60% neutral slate background (`#F8FAFC` canvas), 30% crisp white cards with hairline borders (`#E2E8F0`), and 10% Zeiss Blue accent (`#004F9E`).
  - Strict typographic hierarchy using modern sans-serif typography (`Plus Jakarta Sans` / `Outfit` display, clean UI body fonts, and `tabular-nums` for counters and recipient counts).

---

### 3. Key Product Decisions & Trade-Offs

- **Client-Side High-DPI Canvas & jsPDF Engine**:
  - *Chosen Approach*: Direct client-side rendering combining HTML/CSS A4 print emulation with `jspdf` and high-density canvas rendering (`scale: 3` for 300+ DPI sharpness).
  - *Why*: Instant generation with zero server dependencies or sensitive doctor/patient data transmission; works completely offline with zero latency.
  - *Alternatives Considered*: Server-side Puppeteer (requires heavy headless Chrome infrastructure and introduces latency) or raw jsPDF manual coordinate calls (brittle to maintain vs styled CSS templates).
- **Dual Signature Acquisition**:
  - *Chosen Approach*: Support both direct transparent image uploads and interactive canvas stylus/mouse drawing, plus a preloaded default signature for instant demonstration.
  - *Why*: Clinical specialists often sign directly on touchscreen laptops/tablets or need to upload a pre-scanned transparent official signature.
- **Batch Export Strategy**:
  - *Chosen Approach*: Client-side `jszip` + `jspdf` to allow single combined PDF generation as well as individual PDFs in a ZIP archive with clean sanitized filenames.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────────┐
│                             Certificate Studio                             │
│                                                                            │
│  ┌───────────────────────────────┐     ┌────────────────────────────────┐  │
│  │     Configuration Sidebar     │     │      Live A4 Preview Deck      │  │
│  │                               │     │                                │  │
│  │  - Recipient Manager          │     │  - A4 Aspect Ratio Viewport    │  │
│  │    (Chips, Multi-line paste)  │     │  - Recipient Pagination Switch │  │
│  │  - Training & Equipment Form  │────▶│  - Zoom / Fit Controls         │  │
│  │  - Hospital / Location / Date │     │  - Pixel-perfect Zeiss Layout  │  │
│  │  - Signature Upload / Draw    │     │                                │  │
│  │  - Signer Authority Form      │     │                                │  │
│  └──────────────┬────────────────┘     └───────────────┬────────────────┘  │
│                 │                                      │                   │
│                 ▼                                      ▼                   │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     Export & Rendering Engine                        │  │
│  │                                                                      │  │
│  │  - 300 DPI Canvas Rasterizer (html2canvas)                           │  │
│  │  - High-Res Vector A4 PDF Builder (jsPDF)                            │  │
│  │  - Batch ZIP Packager (JSZip)                                        │  │
│  │  - Combined Multi-Page PDF Compiler                                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

#### Core Components & State Schema
- **Certificate Data Model**:
  ```typescript
  interface CertificateConfig {
    recipients: string[];
    trainingName: string;
    equipmentName: string;
    certificationText: string;
    hospitalName: string;
    hospitalBranch: string;
    location: string;
    trainingDate: string;
    disclaimerText: string;
    signerName: string;
    signerTitle: string;
    signerDepartment: string;
    signerCompany: string;
    signatureDataUrl: string | null;
  }
  ```
- **Interactive Controls**:
  - Multi-recipient manager with bulk paste modal and individual chip deletion.
  - Signature studio modal with canvas drawing, stroke width, color toggle, and file upload.
  - Live preview magnification controls (50%, 75%, 100%, Fit-to-screen).
  - Progress feedback modal during batch generation showing `Generating x of y...`.

---

### 5. Verification Plan

- **Layout Fidelity Test**: Verify that the generated PDF visually matches the Carl Zeiss example certificate in font weights, positioning, vertical left rail text, and emblem alignment.
- **Multi-Recipient Test**: Test batch entry of 5+ recipient names with comma or newline separation.
- **Export Verification**:
  - Test single PDF download.
  - Test multi-page combined PDF download.
  - Test ZIP download with clean filenames.
- **Signature Input Test**: Test both file upload (PNG/JPG) and drawing on the interactive canvas pad.
- **Responsiveness**: Verify smooth operation across desktop screen widths down to tablet viewport.
