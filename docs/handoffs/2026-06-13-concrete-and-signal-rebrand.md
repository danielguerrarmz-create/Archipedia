# Handoff — "Concrete & Signal" brand rebrand + animated splash

**Date:** 2026-06-13
**Branch:** `rebrand/concrete-and-signal`
**Scope:** Frontend only (`frontend/`). Nothing in `navigator/` (backend) changed.

## What

A full visual rebrand of the Archipedia frontend to a new brand identity — **"Concrete & Signal"** (light Swiss-brutalist; matte concrete + true ink + one International Klein Blue "Signal"; Archivo / Hanken Grotesk / Spline Sans Mono; emboss-deboss materiality; a node→connector→union motif) — plus a completely redesigned, motion-rich **splash/landing page** with a dark cinematic "studio" hero, and a consistency pass that unifies the **index (search), canvas, and boards** under one app shell.

Highlights:
- **Design foundation:** `frontend/src/styles/tokens.css` (the whole token system + a `--studio-*` dark family; imported last, also aliases legacy vars so untouched components rebrand for free) and `frontend/src/components/motif/` (Node, Connector, Union, ConnectorLoader, AxisTick, NodeField, MatchStamp). Fonts self-hosted via Fontsource (`src/lib/fonts.ts`). Playbook in **`frontend/BRAND.md`**.
- **Splash** (`src/pages/SearchLandingPage.tsx` + `src/components/landing/*`): dark studio hero with a self-assembling precedent-graph of real buildings, a scroll narrative (Search→Compare→Compose→Cite), proof strip, atmosphere marquee, dark CTA + footer. Real imagery from a frozen manifest, `src/data/heroPrecedents.ts`.
- **App consistency:** one shared dark header `src/components/AppHeader.tsx` used by index/canvas/boards; canvas decluttered (legacy "how-to" overlay + redundant palette removed); match stamps render ink (not blue) on the index; boards chrome de-candied.

This was developed iteratively with artificial user studies benchmarked against Fuser (fuser.studio) and Flora (flora.ai); the dark hero was the change that delivered "depth of feeling" (study scores 3.6 → 4.5/5).

## Why

The original frontend read generic (Space Grotesk + Inter, yellow `#FFC800`, glassmorphism, inconsistent per-page chrome, a WCAG-failing color-only match badge, candy-colored nodes, a blank-void canvas). The client wanted a premium, minimal, ownable identity and a splash that stands next to Fuser/Flora — then asked to remove "AI-slop tells" (scattered blue dots, `01/02` section numbering, throwaway chips) and to apply the identity consistently to the board, canvas, and index.

## Verify

```
cd frontend
npm install          # adds @fontsource-variable/archivo, hanken-grotesk, spline-sans-mono
npm run dev          # http://localhost:5173
npx vite build       # must succeed
```
- Splash `/`: dark hero assembles, scroll the narrative → dark CTA + footer. Header is consistently black; Signal blue only on the search button.
- Index (in-app nav from header → Search): dark header, real thumbnails, ink "STRONG nn%" match stamps.
- Canvas `/canvas`: dark header, clean palette + empty-canvas templates, docked research panel, RUN = the one Signal.
- Backend (optional, for live search): Python **3.12** venv in `navigator/` + `scripts/run_backend.ps1` (3.13/3.14 lack faiss/torch wheels). Dev proxy forwards `/search/*` + `/boards/*` to the backend, so those routes only resolve via in-app SPA navigation, not direct URL.
- Grep guards: zero `Space Grotesk`, zero `#FFC800`, zero stray `var(--signal)` decoration in `src/components/landing`.

## Left (follow-ups, not blocking)

- **No `/boards` index route** exists (only `/boards/:id…`); the "Boards" nav link falls through to the landing fallback. A boards-list page is a separate task.
- ~64 inline `backdrop-filter`s remain in source — neutralized at runtime by the glass kill-switch in `tokens.css`, but not source-clean.
- Hero/index imagery is capped at **528px** (the R2 bucket's max; no higher-res exists to pull). Curated for contrast/composition in `heroPrecedents.ts`.
- A few now-unused lucide imports / one unused `addNodeToCanvas` callback in `ResultsPage` (harmless under esbuild) can be swept.
- Tailwind is **not** in the build (`globals.css`/`index.css` are static compiled dumps) — style via CSS custom properties, not new utility classes. No `tsconfig.json` (types unchecked).
- Backend items out of scope here (from the initial review): CORS `*`, SSRF on `/search/url`, the model-dim footgun, `/projects` 500 on NaN JSON.

## Files (key)

- New: `frontend/BRAND.md`, `frontend/src/styles/tokens.css`, `frontend/src/lib/fonts.ts`, `frontend/src/data/heroPrecedents.ts`, `frontend/src/components/motif/*`, `frontend/src/components/landing/*`, `frontend/src/components/AppHeader.tsx`, `frontend/src/components/ErrorPanel.tsx`, `frontend/src/components/Canvas/AnEdge.tsx`, `frontend/src/components/Canvas/Palette.tsx`, `frontend/src/components/Canvas/EmptyCanvas.tsx`, `frontend/src/lib/canvasTemplates.ts`.
- Heavily edited: `frontend/src/pages/SearchLandingPage.tsx`, `ClassicSearchPage.tsx`, `ResultsPage.tsx`, board pages; `frontend/src/components/ui/*`, `Nodes/*`, `Canvas/*`; `frontend/index.html`, `package.json`.
- ~97 files total; all under `frontend/`.
