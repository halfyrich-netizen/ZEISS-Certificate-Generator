# ZEISS Training Certificate - Exact Layout Specification

## Purpose

Use this file as the **single source of truth** for a Certificate Generator. The target is a near-pixel-identical recreation of the supplied one-page ZEISS training certificate, not a generic certificate inspired by it.

The generator must use **absolute positioning on an A4 portrait canvas**. Do not use a normal document flow, auto-centering, responsive reflow, decorative borders, gradients, shadows, or additional certificate ornaments.

---

## 1. Reference canvas

- Page: **A4 portrait**
- Physical size: **210 x 297 mm**
- PDF coordinate size: **595.276 x 841.890 pt**
- Recommended browser-print canvas: **794 x 1123 px at 96 CSS dpi**
- Background: **pure white** (`#FFFFFF`)
- Bleed: none
- Border: none
- Main layout: asymmetric, with a narrow vertical title column on the left and a content column on the right

### Coordinate convention

All positions below use PDF points with origin at the top-left:

- `x`: distance from left edge
- `y`: distance from top edge
- `w`: width
- `h`: height

For CSS in millimetres:

```text
mm = pt x 0.352778
```

---

## 2. Visual grammar

The design is minimalist and typographic:

- large, pale-grey vertical word `CERTIFICATE`
- black right-side content
- generous white space
- no horizontal rule except the signature line
- compact signature credentials
- ZEISS logo centered near the lower portion of the page

### Color palette

| Token | Value | Use |
|---|---:|---|
| `paper` | `#FFFFFF` | Page background |
| `primary-text` | approximately `#1D1D1F` | Main text |
| `vertical-title` | approximately `#929395` | Vertical `CERTIFICATE` |
| `rule` | approximately `#4A4A4A` | Signature line |
| `zeiss-blue` | use official supplied logo asset | ZEISS logo |

Do not recolor the official logo by CSS filters.

---

## 3. Typography

### Required font family

The reference PDF uses the proprietary **ZEISS Frutiger Next W1G** family:

- `ZEISSFrutigerNextW1G-LtCn` - light condensed
- `ZEISSFrutigerNextW1G-MdCn` - medium condensed
- `ZEISSFrutigerNextW1G-BoldCn` - bold condensed
- `ZEISSFrutigerNextW1G-Reg` - regular

The generator should load licensed font files with `@font-face`. Font substitution will noticeably change line length, wrapping, and alignment.

Fallback only when ZEISS fonts are unavailable:

```css
font-family: "Arial Narrow", "Roboto Condensed", Arial, sans-serif;
```

Fallback output must be labelled **approximate**, not exact.

### Font rendering rules

- Use explicit font sizes and line heights.
- Disable synthetic bold when actual bold font is available.
- Do not use text justification.
- Use left alignment for all content-column text.
- Preserve specified line breaks. Do not let the browser choose different wraps.
- Use optical-looking spacing, but no extra tracking unless specified.

---

## 4. Master layout zones

### 4.1 Left vertical title

Text: `CERTIFICATE`

Reference appearance:

- orientation: reads from bottom to top
- rotation: `-90deg`
- uppercase
- light-weight sans-serif
- pale grey
- very wide letter spacing
- occupies almost the full page height
- positioned close to the left edge

Recommended bounding region:

```text
x: 36 pt
visual centreline: approximately x = 74 pt
vertical span after rotation: y = 52 pt to 759 pt
```

Recommended CSS:

```css
.vertical-title {
  position: absolute;
  left: 12.5mm;
  top: 267.5mm;
  transform: rotate(-90deg);
  transform-origin: left top;
  white-space: nowrap;
  font-family: "ZEISS Frutiger Next W1G Light Condensed", "Arial Narrow", sans-serif;
  font-size: 15.5mm;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 7.2mm;
  color: #929395;
}
```

Fine-tune `left`, `top`, and `letter-spacing` after rendering. The word must not touch or clip against any page edge.

### 4.2 Main content column

Common left anchor:

```text
x = 192 pt = 67.73 mm
```

Most content starts within `x = 192-196 pt`. Maintain this precise vertical alignment.

Usable content width:

```text
approximately 315 pt = 111.1 mm
```

Do not horizontally center the content column on the page.

---

## 5. Element-by-element specification

### A. Recipient name

Example content:

```text
Andreas S. Anugrah, MD
```

Geometry:

```text
x = 192.0 pt
y = 87.2 pt
w = 314.2 pt
h = 39.1 pt
```

Style:

```text
font = ZEISS Frutiger Next W1G Bold Condensed
size = 30 pt
weight = bold
line-height = approximately 39 pt
color = primary-text
```

Rules:

- one line in the reference
- no salutation
- preserve professional suffixes
- if the name is too long, first reduce to 27 pt, then 24 pt
- never wrap to more than two lines
- do not move elements below unless a two-line name variant is intentionally supported by a separate layout template

### B. Recipient institution

Example content and required line break:

```text
EyeQu LASIK & Eye Center
Bekasi Timur
```

Geometry:

```text
x = 192.0 pt
y = 139.2 pt
w = 287.5 pt
h = 60.8 pt
```

Style:

```text
font = ZEISS Frutiger Next W1G Regular
size = 24 pt
line-height = 28.8 pt
color = primary-text
```

Rules:

- maximum two lines
- line break is data-controlled, not automatically inferred
- maintain approximately 13 pt vertical gap from the recipient-name box

### C. Certification statement

Exact reference text and line breaks:

```text
We hereby certify that the above-named has
successfully completed the training and is a
qualified user for
```

Geometry:

```text
x = 195.6 pt
y = 234.5 pt
w = 274.1 pt
h = 66.3 pt
```

Style:

```text
font = ZEISS Frutiger Next W1G Light Condensed
size = 16 pt
line-height = 24 pt
color = primary-text
```

Rules:

- always three lines for this template
- do not rewrite, center, or justify the sentence
- maintain approximately 34.5 pt gap below the institution block

### D. Qualification / procedure title

Example content and required line break:

```text
Transepithelial PRK using
ZEISS MEL® 90 Excimer Laser System
```

Geometry:

```text
x = 195.6 pt
y = 328.3 pt
w = 250.7 pt
h = 44.8 pt
```

Style:

```text
font = ZEISS Frutiger Next W1G Bold Condensed
size = 16 pt
line-height = 24 pt
color = primary-text
```

Trademark handling:

- render `®` as a smaller raised glyph, approximately 10.5 pt
- keep `MEL® 90` visually continuous
- do not insert a visible extra space before the registration symbol

Rules:

- procedure text is bold
- prefer author-controlled line breaks
- maximum three lines for variable qualifications
- if a third line is required, use a dedicated compact template rather than allowing downstream overlap

### E. Training location and date

Example content and required line break:

```text
EyeQu LASIK & Eye Center Bekasi Timur
Indonesia, 9 Feb 2026
```

Geometry:

```text
x = 195.6 pt
y = 420.7 pt
w = 179.7 pt
h = 31.1 pt
```

Style:

```text
font = ZEISS Frutiger Next W1G Light Condensed
size = 12 pt
line-height = 16 pt
color = primary-text
```

Rules:

- first line: training site
- second line: country, comma, date
- date format: `D MMM YYYY`, for example `9 Feb 2026`
- use English three-letter month names unless localization is explicitly enabled

### F. Legal disclaimer

Exact reference text and line breaks:

```text
This certificate does not authorize treatment of patients in any state or country where
the certificate holder is not otherwise licensed to perform refractive surgery.
```

Geometry:

```text
x = 195.6 pt
y = 502.8 pt
w = 263.3 pt first line
h = approximately 22 pt total
```

Style:

```text
font = ZEISS Frutiger Next W1G Light Condensed
size = 8 pt
line-height = 12.8 pt
color = primary-text
```

Rules:

- fixed two-line disclaimer in this template
- do not center
- do not reduce below 8 pt
- do not paraphrase without legal review

### G. Signature image

Asset requirement:

- transparent PNG preferred
- monochrome dark grey or black signature
- crop tightly around visible strokes
- preserve aspect ratio
- do not add a border, background, shadow, or caption

Reference placement:

```text
visual signature region approximately:
x = 207 pt to 336 pt
y = 541 pt to 612 pt
```

Recommended visible size:

```text
width = approximately 130 pt = 45.9 mm
height = approximately 79 pt = 27.9 mm
```

The reference signature source has a landscape aspect ratio. Use `object-fit: contain`. Position the visible signature so that the lowest long stroke approaches the signature line without covering the signatory text.

### H. Signature line

Geometry:

```text
x = 195.7 pt
y = approximately 609.5 pt
width = approximately 149 pt
stroke = approximately 0.6-0.8 pt
```

Style:

```css
.signature-line {
  position: absolute;
  left: 69.04mm;
  top: 215.02mm;
  width: 52.56mm;
  border-top: 0.25mm solid #4A4A4A;
}
```

### I. Signatory details

Exact reference structure:

```text
Hary Destianto
Application Specialist REF
Medical Technology Business Group
Carl Zeiss Pte. Ltd. - Representative Office in Indonesia
```

Geometry:

```text
x = 195.7 pt
y = 622.9 pt
w = 188.5 pt
h = 51.4 pt
```

Styles:

- line 1: `10 pt`, Medium Condensed
- lines 2-4: `9 pt`, Light Condensed
- line-height: approximately `12.8-14.4 pt`
- color: primary-text

Rules:

- signatory name is slightly heavier than credentials
- no blank line between signatory name and title
- keep organization wording exactly as the approved legal entity name

### J. ZEISS logo

Reference visual box:

```text
x = approximately 318 pt
y = approximately 736 pt
w = approximately 53 pt
h = approximately 53 pt
```

Recommended CSS dimensions:

```text
width = 18.7 mm
height = 18.7 mm
```

Rules:

- use the official ZEISS square logo asset
- center logo at approximately `x = 344.5 pt`, not at the physical page center
- the logo is visually centered under the right-side content system
- do not stretch, crop, recolor, round corners, or recreate the logo with text/CSS

---

## 6. Recommended data model

```json
{
  "recipient_name": "Andreas S. Anugrah, MD",
  "recipient_institution_lines": [
    "EyeQu LASIK & Eye Center",
    "Bekasi Timur"
  ],
  "certification_statement_lines": [
    "We hereby certify that the above-named has",
    "successfully completed the training and is a",
    "qualified user for"
  ],
  "qualification_lines": [
    "Transepithelial PRK using",
    "ZEISS MEL® 90 Excimer Laser System"
  ],
  "training_site": "EyeQu LASIK & Eye Center Bekasi Timur",
  "country": "Indonesia",
  "training_date_display": "9 Feb 2026",
  "disclaimer_lines": [
    "This certificate does not authorize treatment of patients in any state or country where",
    "the certificate holder is not otherwise licensed to perform refractive surgery."
  ],
  "signatory_name": "Hary Destianto",
  "signatory_title": "Application Specialist REF",
  "signatory_business_group": "Medical Technology Business Group",
  "signatory_legal_entity": "Carl Zeiss Pte. Ltd. - Representative Office in Indonesia",
  "signature_asset": "assets/signature.png",
  "logo_asset": "assets/zeiss-logo.svg"
}
```

Use arrays for lines whose wrapping must be deterministic. Do not rely on automatic line wrapping for institution, statement, qualification, or disclaimer.

---

## 7. HTML/CSS implementation skeleton

```html
<section class="certificate-page" aria-label="Training certificate">
  <div class="vertical-title">CERTIFICATE</div>

  <main class="content-column">
    <div class="recipient-name">{{recipient_name}}</div>

    <div class="recipient-institution">
      {{recipient_institution_line_1}}<br>
      {{recipient_institution_line_2}}
    </div>

    <div class="certification-statement">
      {{statement_line_1}}<br>
      {{statement_line_2}}<br>
      {{statement_line_3}}
    </div>

    <div class="qualification">
      {{qualification_line_1}}<br>
      {{qualification_line_2_with_superscript_mark}}
    </div>

    <div class="location-date">
      {{training_site}}<br>
      {{country}}, {{training_date_display}}
    </div>

    <div class="disclaimer">
      {{disclaimer_line_1}}<br>
      {{disclaimer_line_2}}
    </div>

    <img class="signature" src="{{signature_asset}}" alt="Authorized signature">
    <div class="signature-line"></div>

    <div class="signatory">
      <div class="signatory-name">{{signatory_name}}</div>
      <div>{{signatory_title}}</div>
      <div>{{signatory_business_group}}</div>
      <div>{{signatory_legal_entity}}</div>
    </div>

    <img class="zeiss-logo" src="{{logo_asset}}" alt="ZEISS">
  </main>
</section>
```

```css
@page {
  size: A4 portrait;
  margin: 0;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: #fff;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

.certificate-page {
  position: relative;
  width: 210mm;
  height: 297mm;
  overflow: hidden;
  background: #fff;
  color: #1d1d1f;
}

.content-column > * {
  position: absolute;
  margin: 0;
  padding: 0;
}

.recipient-name {
  left: 67.73mm;
  top: 30.76mm;
  font: 700 30pt/39pt "ZEISS Frutiger Next W1G Bold Condensed", "Arial Narrow", sans-serif;
  white-space: nowrap;
}

.recipient-institution {
  left: 67.73mm;
  top: 49.11mm;
  font: 400 24pt/28.8pt "ZEISS Frutiger Next W1G Regular", Arial, sans-serif;
}

.certification-statement {
  left: 69.00mm;
  top: 82.73mm;
  font: 300 16pt/24pt "ZEISS Frutiger Next W1G Light Condensed", "Arial Narrow", sans-serif;
}

.qualification {
  left: 69.00mm;
  top: 115.82mm;
  font: 700 16pt/24pt "ZEISS Frutiger Next W1G Bold Condensed", "Arial Narrow", sans-serif;
}

.location-date {
  left: 69.00mm;
  top: 148.41mm;
  font: 300 12pt/16pt "ZEISS Frutiger Next W1G Light Condensed", "Arial Narrow", sans-serif;
}

.disclaimer {
  left: 69.00mm;
  top: 177.38mm;
  font: 300 8pt/12.8pt "ZEISS Frutiger Next W1G Light Condensed", "Arial Narrow", sans-serif;
  white-space: nowrap;
}

.signature {
  left: 73.0mm;
  top: 190.8mm;
  width: 45.9mm;
  height: 27.9mm;
  object-fit: contain;
  object-position: center bottom;
}

.signature-line {
  left: 69.04mm;
  top: 215.02mm;
  width: 52.56mm;
  border-top: 0.25mm solid #4a4a4a;
}

.signatory {
  left: 69.04mm;
  top: 219.75mm;
  font: 300 9pt/12.8pt "ZEISS Frutiger Next W1G Light Condensed", "Arial Narrow", sans-serif;
  white-space: nowrap;
}

.signatory-name {
  font-family: "ZEISS Frutiger Next W1G Medium Condensed", "Arial Narrow", sans-serif;
  font-size: 10pt;
  font-weight: 500;
  line-height: 14.4pt;
}

.zeiss-logo {
  left: 112.18mm;
  top: 259.64mm;
  width: 18.7mm;
  height: 18.7mm;
  object-fit: contain;
}
```

Important: the `.vertical-title` CSS is defined in Section 4.1 because it requires a final render-based adjustment after the exact font file is loaded.

---

## 8. Responsive and overflow behavior

This is a fixed-print template, not a responsive web card.

### Allowed adaptations

- recipient name: reduce from 30 pt to 27 pt, then 24 pt
- qualification: allow a controlled third line in a separate compact variant
- institution: exactly one or two supplied lines

### Forbidden adaptations

- shrinking the entire page
- moving the main content column left or right
- reducing disclaimer below 8 pt
- auto-scaling logo or signature disproportionately
- letting content push later elements downward
- using `flex`, `grid`, or flow layout to determine vertical positions
- auto-hyphenation

### Validation thresholds

Before export, the generator must reject or flag:

- recipient name wider than `315 pt` at 24 pt
- any institution line wider than `290 pt`
- any qualification line wider than `285 pt`
- missing font asset
- missing logo or signature asset
- empty recipient, qualification, location, or date
- unsupported image format

---

## 9. PDF generation requirements

Recommended engines:

1. **Playwright or Puppeteer using Chromium print-to-PDF**, with `preferCSSPageSize: true`, `printBackground: true`, and zero margins.
2. **WeasyPrint**, after checking font and superscript rendering.
3. Direct PDF generation only if the implementation supports embedded fonts and absolute coordinates reliably.

Example Puppeteer settings:

```js
await page.pdf({
  path: outputPath,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
});
```

Embed all fonts and assets locally. Do not load fonts, signatures, or logos from public URLs at generation time.

---

## 10. Visual regression test

The certificate generator is acceptable only after a render comparison against the reference.

### Required test procedure

1. Render reference and generated PDFs at **200 dpi**.
2. Align page canvases without scaling.
3. Create a pixel-difference image.
4. Inspect all text baselines, line breaks, signature position, logo position, and vertical title.
5. Adjust coordinates, not global scaling.

### Pass criteria

- A4 page dimensions match exactly.
- Main content starts at approximately `x = 192-196 pt`.
- All prescribed line breaks match.
- Recipient name baseline and institution align to the reference.
- Certificate statement remains three lines.
- Qualification remains two lines for the example data.
- Disclaimer remains two lines at 8 pt.
- Signature crosses or approaches the signature-line region as in the reference.
- ZEISS logo has correct proportions and lower-page placement.
- No clipping, text overlap, substituted glyph boxes, or browser header/footer.

---

## 11. Instruction block for the coding AI

Copy this block into the implementation prompt:

> Build a fixed-layout A4 portrait certificate generator using the attached `Certificate_Style_Specification.md` as the authoritative design contract. Reproduce exact coordinates, fonts, font sizes, line breaks, colors, and asset proportions. Use absolute positioning in millimetres or PDF points. Do not redesign, beautify, center, or reflow the document. Load licensed ZEISS Frutiger Next W1G fonts locally and embed them in the generated PDF. Use supplied signature and official ZEISS logo assets, preserving aspect ratio. Use explicit arrays for controlled lines. Generate the output with Chromium print-to-PDF using zero margins, print backgrounds, and CSS A4 page size. Add input validation and a 200 dpi visual regression test against the reference PDF. If the exact font or official asset is unavailable, stop and report the missing dependency rather than silently substituting it.

---

## 12. Critical accuracy note

The spacing values in this specification were derived from the supplied PDF's A4 coordinate geometry and embedded text positions. The largest remaining visual variables are:

1. access to the exact licensed ZEISS font files,
2. the exact official ZEISS logo asset,
3. signature-image crop and transparency,
4. renderer differences in glyph metrics and superscript placement.

Without the exact fonts, an AI can match the composition but cannot guarantee identical line lengths or wrapping.
