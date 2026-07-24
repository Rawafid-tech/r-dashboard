# Rawafid (روافد) – Design System Handoff

Design reference extracted from the Landing Page for the separate Dashboard project.  
Primary source of truth in this repo: `src/styles/design-system.css` + `src/styles/global.css`.

**Goal:** Keep the same visual identity, tokens, and Light/Dark + AR/EN behavior across products.

---

## 1. Brand

| Item | Value |
|------|--------|
| Product name (EN) | Rawafid |
| Product name (AR) | روافد |
| Positioning | The Operating System for E-commerce Logistics |
| Style direction | Enterprise SaaS · Swiss minimalism · Clean, spacious UI |
| Inspiration | Stripe, Linear, Ramp, Vercel |
| Default locale | Arabic (`ar`) |
| Locales | `ar` (RTL) · `en` (LTR) |
| Theme storage key | `rawafid-theme` (`light` \| `dark`) |

### Logos (from Landing)

| Asset | Path |
|-------|------|
| Light logo | `src/assets/main-logo-light.webp` |
| Dark logo | `src/assets/main-logo-dark.webp` |
| Favicon | `public/favicon.svg` |

Use the light logo on light backgrounds and the dark logo on dark backgrounds (same pattern as the Navbar).

---

## 2. Design Direction (quick rules for Dashboard)

- Enterprise SaaS look — not consumer / playful.
- Layout based on an **8pt grid**.
- Generous spacing, clear hierarchy, low visual noise.
- Cards use light borders + subtle shadows (not heavy multi-layer stacks).
- Primary Blue for CTAs and focus; Accent Green for positive states (delivered / success).
- Full support for **RTL (ar)**, **LTR (en)**, and **Light / Dark**.

---

## 3. Color System

### Brand / Primary

| Token | Hex | Usage |
|-------|-----|--------|
| `--color-primary` | `#2563EB` | CTAs, links, focus rings, highlights |
| `--color-primary-light` | `#3B82F6` | Hover accents, dark-mode emphasis |
| `--color-primary-dark` | `#1D4ED8` | Primary button hover |
| `--color-primary-alpha-10` | `rgba(37, 99, 235, 0.1)` | Soft fills, selected rows |
| `--color-primary-alpha-20` | `rgba(37, 99, 235, 0.2)` | Selection, stronger fills |

### Secondary (Navy)

| Token | Hex | Usage |
|-------|-----|--------|
| `--color-secondary` | `#0F172A` | Dark surfaces, strong text |
| `--color-secondary-light` | `#1E293B` | Elevated dark surfaces |
| `--color-secondary-dark` | `#020617` | Deepest dark background |

### Accent (Green)

| Token | Hex | Usage |
|-------|-----|--------|
| `--color-accent` | `#22C55E` | Success CTAs, positive metrics |
| `--color-accent-light` | `#4ADE80` | Soft success accents |
| `--color-accent-dark` | `#16A34A` | Accent hover |
| `--color-accent-alpha-10` | `rgba(34, 197, 94, 0.1)` | Success backgrounds |

### Neutrals (Slate scale)

| Token | Hex |
|-------|-----|
| `--color-white` | `#FFFFFF` |
| `--color-light` / `--color-gray-50` | `#F8FAFC` |
| `--color-gray-100` | `#F1F5F9` |
| `--color-gray-200` | `#E2E8F0` |
| `--color-gray-300` | `#CBD5E1` |
| `--color-gray-400` | `#94A3B8` |
| `--color-gray-500` | `#64748B` |
| `--color-gray-600` | `#475569` |
| `--color-gray-700` | `#334155` |
| `--color-gray-800` | `#1E293B` |
| `--color-gray-900` | `#0F172A` |

### Semantic

| Token | Hex | Usage |
|-------|-----|--------|
| `--color-success` | `#22C55E` | Delivered, confirmed, positive deltas |
| `--color-warning` | `#F59E0B` | Pending, attention |
| `--color-error` | `#EF4444` | Failed, destructive |
| `--color-info` | `#3B82F6` | Informational states |

### Surfaces & Borders

| Token | Light | Dark (`[data-theme="dark"]`) |
|-------|-------|------------------------------|
| `--bg-primary` | `#FFFFFF` | `#0F172A` |
| `--bg-secondary` | `#F8FAFC` | `#1E293B` |
| `--bg-dark` | `#0F172A` | `#020617` |
| `--bg-dark-light` | `#1E293B` | `#1E293B` |
| `--border-primary` | `#E2E8F0` | `#334155` |
| `--border-secondary` | `#CBD5E1` | `#475569` |

### Dark mode text remaps

In dark mode, gray text tokens are remapped for contrast:

| Token | Dark value |
|-------|------------|
| `--color-gray-900` | `#F8FAFC` |
| `--color-gray-800` | `#E2E8F0` |
| `--color-gray-700` | `#CBD5E1` |
| `--color-gray-600` | `#94A3B8` |

> **Important:** Apply theme via `data-theme="light|dark"` on the root element (e.g. `html`), with storage key `rawafid-theme`.

---

## 4. Typography

### Font families

| Role | Font | Package / fallback |
|------|------|--------------------|
| EN (default) | **Inter Variable** | `@fontsource-variable/inter` → `'Inter Variable', 'Inter', system-ui, sans-serif` |
| AR | **Cairo Variable** | `@fontsource-variable/cairo` → `'Cairo Variable', 'Cairo', Tahoma, system-ui, sans-serif` |
| Mono (codes, IDs) | JetBrains Mono / Fira Code | `'JetBrains Mono', 'Fira Code', 'Courier New', monospace` |

### Switching fonts by locale

```css
body {
  font-family: var(--font-primary);
}

html[lang="ar"] {
  --font-primary: var(--font-arabic);
}
```

### Font sizes

| Token | Size |
|-------|------|
| `--text-xs` | 12px |
| `--text-sm` | 14px |
| `--text-base` | 16px |
| `--text-lg` | 18px |
| `--text-xl` | 20px |
| `--text-2xl` | 24px |
| `--text-3xl` | 30px |
| `--text-4xl` | 36px |
| `--text-5xl` | 48px |
| `--text-6xl` | 60px |
| `--text-7xl` | 72px |

### Weights

| Token | Value | Typical use |
|-------|-------|-------------|
| `--font-normal` | 400 | Body |
| `--font-medium` | 500 | Buttons, labels |
| `--font-semibold` | 600 | Subheadings, nav |
| `--font-bold` | 700 | Page titles, KPIs |

### Line height & tracking

| Token | Value |
|-------|-------|
| `--leading-tight` | 1.25 |
| `--leading-snug` | 1.375 |
| `--leading-normal` | 1.5 |
| `--leading-relaxed` | 1.625 |
| `--tracking-tight` | -0.025em (headings) |
| `--tracking-wide` | 0.025em (eyebrows / captions) |

### Type scale classes (from Landing)

| Class | Size | Weight | Notes |
|-------|------|--------|-------|
| `.text-display-1` | 72px | Bold | Marketing only |
| `.text-display-2` | 60px | Bold | Marketing only |
| `.text-h1` | 48px | Bold | Page titles |
| `.text-h2` | 36px | Semibold | Section titles |
| `.text-h3` | 30px | Semibold | Card / panel titles |
| `.text-h4` | 24px | Semibold | Subsections |
| `.text-body-large` | 20px | Regular | Emphasized body |
| `.text-body` | 16px | Regular | Default |
| `.text-body-small` | 14px | Regular | Secondary text |
| `.text-caption` | 12px | Medium | Uppercase + wide tracking |

**For Dashboard:** Prefer `h3/h4` + `body` + `body-small` + `caption`. Display sizes are for marketing surfaces only.

---

## 5. Spacing (8pt grid)

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |
| `--space-20` | 80px |
| `--space-24` | 96px |
| `--space-32` | 128px |

### Dashboard recommendations

- Page padding: `24px` → `32px` (desktop)
- Card padding: `24px`
- Gaps inside cards: `12px`–`16px`
- Gaps between cards / panels: `16px`–`24px`
- Sidebar item padding: `8px`–`12px` vertical, `12px`–`16px` horizontal

---

## 6. Radius

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 4px | Chips, tiny controls |
| `--radius-base` | 8px | Inputs, small buttons |
| `--radius-md` | 12px | Default buttons |
| `--radius-lg` | 16px | Cards, panels |
| `--radius-xl` | 24px | Feature panels, modals |
| `--radius-2xl` | 32px | Large shells |
| `--radius-full` | 9999px | Pills, avatars, toggles |

---

## 7. Shadows

| Token | Use |
|-------|-----|
| `--shadow-xs` | Subtle elevation |
| `--shadow-sm` | Buttons, inputs |
| `--shadow-base` | Default cards |
| `--shadow-md` | Dropdowns |
| `--shadow-lg` | Hover cards / popovers |
| `--shadow-xl` | Modals / command palette |
| `--shadow-glow-primary` | Primary CTA hover |
| `--shadow-glow-accent` | Success CTA hover |

In dark mode, shadows are darker (higher opacity) — copy values from `design-system.css` as-is.

---

## 8. Motion & Transitions

| Token | Value |
|-------|-------|
| `--transition-fast` | 150ms |
| `--transition-base` | 250ms |
| `--transition-slow` | 350ms |
| Easing (default) | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` |

Respect `prefers-reduced-motion: reduce` (disable non-essential transitions).

For Dashboard: keep motion light for hover / panel open / toast — avoid heavy marketing animations from the Landing.

---

## 9. Components (from Landing — keep the same language)

### Buttons

| Variant | Class | Notes |
|---------|-------|-------|
| Primary | `.btn.btn-primary` | Blue fill, white text |
| Secondary | `.btn.btn-secondary` | White / dark surface + border |
| Accent | `.btn.btn-accent` | Green fill (success actions) |
| Ghost | `.btn.btn-ghost` | Transparent |
| Large | `.btn-large` | Larger padding + 18px text |
| Small | `.btn-small` | Compact toolbar actions |

Default button: radius `12px`, weight `500`, transition `250ms`.  
Primary hover: darker blue + glow + `translateY(-2px)` (you can soften the lift in the Dashboard if it feels too marketing-heavy).

### Cards / Panels

- Background: `--bg-primary`
- Border: `1px solid --border-primary`
- Radius: `--radius-lg` (16px)
- Padding: `--space-6` (24px)

### Focus (Accessibility)

```css
outline: 2px solid var(--color-primary);
outline-offset: 2px;
```

### Selection

```css
::selection {
  background: var(--color-primary-alpha-20);
  color: var(--color-primary-dark);
}
```

### Scrollbar

- Width: `8px`
- Thumb: gray-400 → gray-500 on hover
- Track: gray-100 (light) / gray-800 (dark)

---

## 10. Layout tokens

| Token | Value |
|-------|-------|
| `--container-md` | 1024px |
| `--container-lg` / `--container-xl` | 1320px |
| `--container-2xl` | 1680px |

### Z-index scale

| Token | Value |
|-------|-------|
| `--z-dropdown` | 1000 |
| `--z-sticky` | 1020 |
| `--z-fixed` | 1030 |
| `--z-modal-backdrop` | 1040 |
| `--z-modal` | 1050 |
| `--z-popover` | 1060 |
| `--z-tooltip` | 1070 |

---

## 11. i18n & Direction

| Locale | `html lang` | `dir` | Path (Landing) |
|--------|-------------|-------|----------------|
| Arabic (default) | `ar` | `rtl` | `/` |
| English | `en` | `ltr` | `/en/` |

Important Dashboard rules:

- Prefer logical properties: `padding-inline`, `margin-inline-start`, `inset-inline-start` instead of left/right.
- Numbers, currencies, and logistics IDs may stay `dir="ltr"` inside Arabic contexts when needed.
- Font switches automatically with `lang="ar"`.

---

## 12. Theme behavior

1. Default: Light.
2. Persist user choice in `localStorage` under `rawafid-theme`.
3. Apply theme with `document.documentElement.setAttribute("data-theme", theme)`.
4. System preference is supported via `prefers-color-scheme` when no stored choice exists (Landing behavior).
5. Smooth transitions on `background-color` / `border-color` / `color`.

To unify Landing and Dashboard theme preference, reuse the same storage key: `rawafid-theme`.

---

## 13. CSS Variables — Copy/Paste starter

Use this block as the Dashboard foundation (Light + Dark):

```css
:root {
  /* Brand */
  --color-primary: #2563EB;
  --color-primary-light: #3B82F6;
  --color-primary-dark: #1D4ED8;
  --color-primary-alpha-10: rgba(37, 99, 235, 0.1);
  --color-primary-alpha-20: rgba(37, 99, 235, 0.2);

  --color-secondary: #0F172A;
  --color-secondary-light: #1E293B;
  --color-secondary-dark: #020617;

  --color-accent: #22C55E;
  --color-accent-light: #4ADE80;
  --color-accent-dark: #16A34A;
  --color-accent-alpha-10: rgba(34, 197, 94, 0.1);

  /* Neutrals */
  --color-white: #FFFFFF;
  --color-light: #F8FAFC;
  --color-gray-50: #F8FAFC;
  --color-gray-100: #F1F5F9;
  --color-gray-200: #E2E8F0;
  --color-gray-300: #CBD5E1;
  --color-gray-400: #94A3B8;
  --color-gray-500: #64748B;
  --color-gray-600: #475569;
  --color-gray-700: #334155;
  --color-gray-800: #1E293B;
  --color-gray-900: #0F172A;

  /* Semantic */
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  /* Surfaces */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8FAFC;
  --bg-dark: #0F172A;
  --bg-dark-light: #1E293B;

  --border-primary: #E2E8F0;
  --border-secondary: #CBD5E1;
  --border-dark: #1E293B;

  /* Typography */
  --font-primary: 'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-arabic: 'Cairo Variable', 'Cairo', 'Segoe UI', Tahoma, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Radius */
  --radius-sm: 0.25rem;
  --radius-base: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-2xl: 2rem;
  --radius-full: 9999px;

  /* Motion */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme="dark"] {
  --bg-primary: #0F172A;
  --bg-secondary: #1E293B;
  --bg-dark: #020617;
  --bg-dark-light: #1E293B;

  --color-gray-900: #F8FAFC;
  --color-gray-800: #E2E8F0;
  --color-gray-700: #CBD5E1;
  --color-gray-600: #94A3B8;

  --border-primary: #334155;
  --border-secondary: #475569;
  --border-dark: #64748B;
}

html[lang="ar"] {
  --font-primary: var(--font-arabic);
}

body {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-gray-900);
  background: var(--bg-primary);
  -webkit-font-smoothing: antialiased;
}
```

### Recommended packages

```bash
npm i @fontsource-variable/inter @fontsource-variable/cairo
```

```ts
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/cairo/wght.css";
```

---

## 14. Dashboard usage map

| UI element | Token / rule |
|------------|--------------|
| App shell background | `--bg-secondary` |
| Sidebar / topbar | `--bg-primary` + `--border-primary` |
| Primary action | `--color-primary` |
| Positive / delivered | `--color-success` / `--color-accent` |
| Warning / pending | `--color-warning` |
| Error / failed | `--color-error` |
| Muted labels | `--color-gray-500` (light) / `--color-gray-600` (dark) |
| Table borders | `--border-primary` |
| Input focus ring | `--color-primary` |
| KPI numbers | Bold + `--color-gray-900` |
| Tracking IDs / codes | `--font-mono` |

---

## 15. Source of truth in this repo

| File | Why |
|------|-----|
| `src/styles/design-system.css` | All tokens + buttons/cards |
| `src/styles/global.css` | Base styles, selection, scrollbar |
| `src/styles/fonts-en.css` | Inter Variable |
| `src/styles/fonts-ar.css` | Cairo Variable |
| `src/lib/theme.ts` | Theme storage key |
| `src/i18n/config.ts` | Locales + RTL/LTR |
| `src/assets/main-logo-*.webp` | Brand logos |
| `project-info.md` | Product / brand context |

If anything conflicts: **prefer values from `design-system.css`** — that is the live Landing implementation.

---

## 16. Checklist before building Dashboard UI

- [ ] Same Primary / Accent / Neutrals
- [ ] Inter (EN) + Cairo (AR)
- [ ] `data-theme` + `rawafid-theme`
- [ ] RTL-first logical CSS
- [ ] 8pt spacing
- [ ] Radius: 8–16px for operational UI
- [ ] Accessible blue focus rings
- [ ] Same Light/Dark logos
- [ ] Semantic colors for shipment statuses
