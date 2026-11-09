# Mobile & Tablet (iPhone/iPad) Ergonomic Responsive Redesign

Upgrade the mobile and tablet user experience on iPhone and iPad with dedicated touch ergonomics, a floating preview sheet toggle, and a sticky bottom export action bar—while keeping the laptop/desktop layout 100% intact.

## User Review & Critical Decisions

> [!IMPORTANT]
> The desktop layout on laptop screens (`lg:` breakpoint and above) will remain strictly untouched as a side-by-side two-column workspace. All mobile-specific additions (floating preview toggle, mobile drawer sheet, sticky bottom bar) only activate on smaller screens (`< 1024px` iPad portrait and iPhone).

- **Confirmed Decision (Mobile Preview UX)**: Floating button to quickly toggle a full-screen/bottom preview sheet on iPhone and iPad, eliminating the need to scroll past long editing forms.
- **Confirmed Decision (Mobile Action Bar)**: Sticky bottom action bar on mobile viewports for one-tap PDF export, batch processing, and printing within the natural thumb reach zone.
- **Zero Desktop Regressions**: Desktop viewports (`>= 1024px`) retain the exact existing side-by-side split layout with the sticky A4 live preview deck.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms the editing experience on iPhone and iPad into a touch-first mobile workflow where users can comfortably edit recipients, procedures, and signatures without visual clutter, tap a floating button at any time to inspect the live A4 certificate sheet, and tap one-touch export buttons anchored at the bottom of the screen.
- **Target Devices**: Apple iPhone (all viewports 375px–430px), iPad mini/Air/Pro in portrait and split-screen orientations, while maintaining desktop fidelity.
- **Key Value**: Eliminates the frustration of endless vertical scrolling on phones and tablets and prevents distorted scaling of the A4 canvas on touchscreens.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Form Editing Flow (iPhone & iPad)**:
   - User opens the app on mobile. The screen is clean, focused on Recipient Management and Certificate Editor cards with comfortable `min-h-[44px]` touch targets.
   - At the bottom of the screen, a compact sticky action bar provides instant access to "Export PDF", "Batch", and a prominent Floating Preview FAB: `[ 👁️ Preview Certificate ]`.
2. **Instant Preview Inspection**:
   - Tapping the floating preview button slides up a full-screen mobile preview modal / bottom sheet (`z-50`).
   - The preview modal contains:
     - Header with close button `[ ✕ ]` and recipient selector / page indicator (`Certificate 1 of 6`).
     - Pinch/touch friendly A4 preview auto-fitted to the mobile screen width with quick `100%` and `Fit` buttons.
     - Direct "Download PDF" CTA button right inside the preview header.
   - Tapping `[ ✕ ]` or swiping down instantly dismisses the sheet and returns the user back to the exact form field they were editing.
3. **One-Tap Export Flow**:
   - Whether in the form view or inside the preview sheet, the primary "Export PDF" action is always within the thumb reach zone at the bottom of the screen.

### Mobile Touch Ergonomics & Visual Tokens

- **Natural Reach Zone**: Sticky bottom bar anchored at `bottom-0` with safe area padding (`pb-[env(safe-area-inset-bottom)]`).
- **FAB Ergonomics**: High-contrast blue pill button (`bg-blue-700 text-white shadow-xl hover:bg-blue-800 active:scale-95`) positioned at bottom-right or center-bottom.
- **Auto-Fit Spatial Math**:
  - On screens `< 768px`, the preview scale automatically calculates:
    $$\text{scale} = \min\left(1.0, \frac{\text{viewportWidth} - 32}{794}\right)$$
    ensuring the A4 canvas fits edge-to-edge with 16px margins, never clipped horizontally.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Mobile Overlay Preview Sheet vs. Two-Tab Switcher**
  - *Chosen Approach*: Floating Action Button (FAB) toggling a dedicated preview sheet/modal on mobile, as selected by the user.
  - *Why*: Allows rapid "peek-and-return" without losing form scroll position or forcing stateful tab switches.
  - *Desktop Behavior*: The FAB and modal are hidden (`hidden lg:flex` / `lg:hidden`), leaving the desktop layout unaltered.

- **Decision 2: Mobile Sticky Action Bar**
  - *Chosen Approach*: A fixed bottom bar with `backdrop-blur-md bg-white/95 border-t border-slate-200` capped at 60px height to respect the 15% sticky surface rule.
  - *Why*: Solves reachability on iPhone and iPad so users don't have to scroll all the way to find the download button.

---

## 4. Technical Architecture & System Layout

```
+-------------------------------------------------------------------------+
|                        DESKTOP VIEWPORT (>= 1024px)                     |
|                                                                         |
|  [ Header: ZEISS Logo + Title -------------------- (Install App) ]      |
|  +-----------------------------------+-------------------------------+  |
|  | LEFT: Form Controls               | RIGHT: Sticky A4 Preview Deck |  |
|  | • Recipient Manager               | • Recipient Carousel          |  |
|  | • Section 2: Procedure & Device   | • Zoom Controls (Fit / 100%)  |  |
|  | • Section 3: Institution & Date   | • Download Bar (PDF, ZIP, p)  |  |
|  | • Section 4: Signature Profiles   | • Live A4 Canvas (210x297mm)  |  |
|  | • Section 5: PDF Protection       |                               |  |
|  +-----------------------------------+-------------------------------+  |
+-------------------------------------------------------------------------+

+-------------------------------------+
|      MOBILE VIEWPORT (< 1024px)     |
|                                     |
| [ Header: ZEISS Logo + Install App ]|
|                                     |
| +---------------------------------+ |
| | Form Controls (Full Width)      | |
| | • Recipient Manager (Touch)     | |
| | • Procedure Dropdown + Lines    | |
| | • Institution & Signatures      | |
| | • PDF Security Protection       | |
| +---------------------------------+ |
|                                     |
| [ 👁️ Preview Certificate (1/1) ]   | <-- Floating FAB (Toggles Sheet)
|                                     |
| +---------------------------------+ |
| | [Export PDF] [Batch] [Print]    | | <-- Sticky Bottom Thumb Bar
| +---------------------------------+ |
+-------------------------------------+

               |  (Tap FAB)
               v
+-------------------------------------+
|        MOBILE PREVIEW SHEET         |
| [✕ Close]  Cert 1 of 1  [Export PDF]|
| +---------------------------------+ |
| |                                 | |
| |    Auto-Fitted Live A4 Canvas   | |
| |    (Pinch & Touch Zoomable)     | |
| |                                 | |
| +---------------------------------+ |
+-------------------------------------+
```

### Component Implementation Mapping

1. **`src/components/MobileBottomBar.tsx`**:
   - Fixed at `bottom-0 left-0 right-0 z-30 lg:hidden` with safe-area insets.
   - Houses primary "Export PDF", "Batch ZIP", and the Floating "Preview Certificate" toggle button.
2. **`src/components/MobilePreviewModal.tsx`**:
   - Full-screen / high-elevation bottom sheet overlay (`z-50 lg:hidden`).
   - Renders `CertificateView` with auto-calculated scale for mobile screens (`0.38` to `0.70`).
   - Includes zoom buttons (`Fit`, `100%`, `+`, `-`), recipient pagination arrows, and a direct download button.
3. **`src/App.tsx`**:
   - Maintains the desktop two-column grid (`lg:grid-cols-12`) without changes.
   - On `< lg`, hides the inline right-column preview deck (`hidden lg:block`) to eliminate redundant vertical scroll.
   - Renders `MobileBottomBar` and `MobilePreviewModal`.
