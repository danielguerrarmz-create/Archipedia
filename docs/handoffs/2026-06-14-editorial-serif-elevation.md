# Handoff — Editorial serif elevation (landing creative pass)

**Date:** 2026-06-14
**Branch:** `rebrand/concrete-and-signal`
**Scope:** Frontend landing/splash only (`frontend/src/components/landing/*`, type system). No backend.

## What

Pressure-tested the "Concrete & Signal" landing against the installed **`ui-ux-pro-max`**
design-intelligence skill and acted on its strongest, cross-validated finding: the page
read as *generic dark SaaS* because it was **all-grotesk** (Archivo + Hanken). Every
editorial / architecture / premium match in the skill's database pairs a **high-contrast
editorial serif** against a clean sans ("Typography is the primary visual"), and its
auto-generated design system for this product literally lists **"Cheap visuals"** as the
anti-pattern to avoid.

Introduced an editorial serif display voice and applied it as the landing's creative spine:

- **New face:** Fraunces Variable (optical-size axis), self-hosted via Fontsource.
  Token `--font-editorial`; helpers `.display-editorial` (opsz 144 / wt 380 / −0.018em /
  leading ~1.0) and `.editorial-em` (the italic swell). Fraunces over the skill's literal
  "Playfair Display" suggestion — same elegant-editorial principle, more ownable, true
  variable + optical sizing.
- **Hero headline** → editorial serif, with an italic swell on *everything*:
  "Press your idea against *everything* ever built." Reveal changed from a per-line
  `overflow:hidden` clip (which sheared the serif's ascenders) to a clean rise+fade.
  Scale tuned to `clamp(38–68px)` so it sits as 2 lines and the search CTA stays above the
  1440×900 fold; hero min-height 880→`min(100svh,800)` + `paddingBlock` for safe centering.
- **FinalCTA** (dark bookend) → editorial serif with a matching italic swell on
  *a feeling*: "Start with a building in mind. Or *a feeling*." Deliberate bracket with the hero.
- **Narrative section titles** (×4) → editorial serif, roman, weight ~420, kept clearly
  subordinate to the hero. One coherent voice across the page.
- **ProofStrip** metric numerals 20→25px for more presence (still mono/tabular — the
  "instrument" data aesthetic is intact).
- Did **not** reintroduce visible `01/02` section indices (handoff record says those were
  killed as an AI-slop tell), and did **not** change the app chrome — the canvas/index/app
  stays Archivo grotesk for its instrument feel. Serif is the *marketing* register only.

## Why

Client feedback: the front-end "still feels cheap and non-creative, not as attractive as
we'd like." The all-grotesk type was the single biggest reason it looked like every other
dark template rather than an architectural instrument. Architecture publishing (El Croquis,
Domus, A+U) lives on exactly this serif↔sans contrast.

## Verify

```
cd frontend
npm install            # adds @fontsource-variable/fraunces
npm run dev            # http://localhost:5173
npx vite build         # succeeds (verified 2026-06-14)
```
- `/` hero: serif headline, italic "everything"; search CTA above the fold @1440×900.
- Scroll: 4 narrative beats in serif; dark FinalCTA with italic "a feeling".
- Headless verify tip: framer-motion's staggered reveal delays don't fully advance under
  Chrome `--virtual-time-budget`, so longer-delayed elements (subhead/search) look "missing"
  in a plain headless shot. Add `--force-prefers-reduced-motion` to force full immediate
  paint for screenshots. (Live browser is unaffected.)

## Left (follow-ups, not blocking)

- **Middle narrative visuals** (`CompareVisual`, `ComposeCanvasVignette`) render as large
  near-empty white panels in a static frame — the weakest remaining "cheap" spot. Worth a
  dedicated pass to make them feel populated/curated (they may rely on motion/data today).
- Fraunces ships latin + latin-ext + vietnamese subsets (normal+italic) — unicode-range
  gated so unused subsets don't download, but `opsz.css` could be trimmed if desired.
- Pre-existing: 2.8MB JS chunk warning (tldraw/reactflow/pdf), unchanged.
- Carryover from prior handoff still open (64 inline backdrop-filters source-cleanup,
  NodeFrame migration, `/projects` 500 on NaN, backend CORS/SSRF).

## Files

- New: `docs/handoffs/2026-06-14-editorial-serif-elevation.md`.
- Edited: `frontend/src/lib/fonts.ts`, `frontend/src/styles/tokens.css`,
  `frontend/src/components/landing/HeroAssembly.tsx`,
  `frontend/src/components/landing/NarrativeSection.tsx`,
  `frontend/src/components/landing/FinalCTA.tsx`,
  `frontend/src/components/landing/ProofStrip.tsx`, `frontend/BRAND.md`,
  `frontend/package.json` (+ lockfile).
