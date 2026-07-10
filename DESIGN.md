# Design System Specification: Al-Haq Portfolio

## 1. Overview & Identity
**Creative North Star: The Al-Haq Developer**

This design system aligns the personal portfolio website with the official brand languages of **Al-Haq Studio** and the **Al-Haq Initiative**. It merges the commercial precision of the Studio with the research-oriented authority of the Initiative. The UI focuses on a **Compact, Flat, Polished, and Modern Sleek Layout** with sharp borders, subtle spacing, and the corporate color scheme (Deep Blue and Gold) matched with classic serif typography.

## 2. Colors & Tonal Depth

The palette relies on corporate Deep Blue (`#0A2540`) as the primary tone, with warm Gold (`#D4AF37`) as the secondary accent, structured over warm off-whites and dark space surfaces.

### Light Mode Variables
*   **Primary (`--brand`):** `210 73% 15%` (Deep Blue `#0A2540`) — Navigation logo background, headers, primary buttons.
*   **Secondary/Accent (`--brand-2`):** `46 65% 52%` (Gold `#D4AF37`) — Interactive states, tags, highlight bars.
*   **On-Primary (`--on-brand`):** `0 0% 100%` (White) — Text sitting on primary backgrounds.
*   **Background Base (`--bg`):** `228 30% 98%` (`#f8f9fc`) — Main body canvas.
*   **Surface Lowest (`--surface`):** `0 0% 100%` (`#ffffff`) — Content sheets and card containers.
*   **Surface Low (`--overlay`):** `220 20% 95%` (`#edf0f6`) — Low-contrast alternating panels.
*   **Text Primary (`--text`):** `220 38% 11%` (`#111827`) — High-contrast primary reading text.
*   **Text Secondary (`--text-2`):** `220 9% 34%` (`#4b5563`) — Muted gray for metadata.
*   **Outline-Variant (`--outline-variant`):** `220 14% 83%` (`#d1d5db`) — Used at 15% opacity for soft bounds.

### Dark Mode Variables
*   **Primary (`--brand`):** `46 65% 52%` (Gold `#D4AF37`) — Contrast swap: primary button fill and links become Gold.
*   **Secondary (`--brand-2`):** `210 73% 15%` (Deep Blue `#0A2540`) — Dark container fills.
*   **On-Primary (`--on-brand`):** `210 73% 15%` (Deep Blue) — Dark blue text sitting on gold buttons.
*   **Background Base (`--bg`):** `220 48% 6%` (`#0b1220`) — Midnight Navy background.
*   **Surface Lowest (`--surface`):** `220 30% 10%` (`#111827`) — Dark slate card bases.
*   **Surface Low (`--overlay`):** `220 30% 8%` (`#0f172a`) — Inner panel layouts.
*   **Text Primary:** `210 20% 98%` (`#f8fafc`) — White text.
*   **Text Secondary:** `220 6% 70%` (`#94a3b8`) — Muted slate text.

## 3. Typography
The typography matches the official sites' serif and sans-serif pairings:

*   **Display & Headlines (`Source Serif 4`):** Used for titles, hero text, and section headers (`h1`, `h2`, `h3`, `h4`, `.display`).
*   **Body & Labels (`Inter`):** Used for paragraphs, lists, chips, and buttons.
*   **Arabic Text (`Amiri`):** Fallback font for Pashto and Dari script overlays.

## 4. Spacing & Structure
*   **Border Radius:** Strictly limited to Al-Haq Initiative's sharp parameters:
    *   Default Radius (`--radius`): `2px` (`0.125rem`) for flat card boundaries and buttons.
    *   Mockups/Thumbs: `4px` (`0.25rem`) for slight corner structure.
*   **Shadows:** Ambient soft shadows representing paper-like elevation:
    *   `--shadow-2`: `0 4px 16px rgba(10, 37, 64, 0.04)` (soft lift).
    *   `--shadow-3`: `0 8px 32px rgba(10, 37, 64, 0.08)` (hover state elevation).
*   **Border Rules:** No heavy lines. Active boundaries use `outline-variant` at 15% opacity.

## 5. Component Styling

### Buttons
*   **Primary:** Solid `--brand` (Deep Blue in light mode, Gold in dark mode). Border radius `2px`. Text in `--on-brand`.
*   **Secondary:** Outline `--brand` border with transparent background.
*   **Tertiary:** Underlined text, underline offset by 4px.
*   **Interactions:** Hover lifts the button by `-2px` on the Y-axis and transitions the background slightly.

### Windows (Cards)
*   Flat white container sheets with subtle `2px` border radius.
*   On hover, cards lift by `-4px` with a transition duration of `300ms` using `--ease-editorial`.

### Bars (Header Navigation)
*   Sticky Glassmorphism navbar with a bottom border using `outline-variant` at 15% opacity.
*   Navigation links feature an expanding center-out underline slide on hover.

## 6. Motion & Animations
*   **Easing Curve:** `--ease-editorial` (`cubic-bezier(0.25, 1, 0.5, 1)`).
*   **Micro-interactions:** `0.25s` transition durations for colors, underlines, and button hovers.
*   **Structural Reveals:** `0.8s` fade-up transitions for sections as they enter the viewport.