# Handoff — Round 3 (dark canvas overhaul, rotating hero, header consistency)

**Date:** 2026-06-14
**Branch:** `rebrand/concrete-and-signal`
**Scope:** Frontend. Build green (`npx vite build`). Not committed. Orchestrated with a
small agent team (node redesign, research panel, explainer page) + visual self-validation
against the Fuser / Flora references.

## What

### Site-wide
- **Header consistency** — `PrivacyPolicyPage` (and the new `HowItWorksPage`) now render the
  canonical `LandingTopBar` instead of a bespoke header. Same header on every page.

### Canvas — re-architected toward Fuser / Flora (the big one)
- **All-black studio ground** (`canvas.css` rewritten). The node system was light-surface
  emboss/deboss (depth from white highlights) — that's why it looked shallow. It's now the
  dark `--studio-*` family (same as hero/header): black ground + film grain + a faint raking
  light + a 1px-hairline / soft-cast-shadow / top-highlight depth model. Class names unchanged.
- **Cohesive node system** — every node type now renders through the shared dark `NodeFrame`
  (`BaseNode.tsx`). `TextNode` & `ImageNode` (previously bespoke light chrome — the main
  inconsistency) were rewritten onto it; `Precedent`/`Results`/`Generate`/operators/filters
  unified. Cryptic UI simplified: a real **Delete** (X) control, one Signal **Run / Generate /
  Validate** button per node, footer reads **"1 in · 1 out"** and **"N found"** (no bare `0`).
- **Command palette** is now a compact **dark popover anchored beside the rail +** (not a
  full-screen overlay) — open via rail +, `/`, or double-click. Canvas stays visible.
- **Research panel** — filters removed (fusion weights only); each weight has a **"?"** tooltip
  (Visual = image-embedding form; Spatial = massing_type; Regional = climate/`w_attr`) + a
  "How weighting works →" link; the **whole panel collapses/reopens**; restyled dark.
- **Chrome cleanup** — minimap removed, `react-flow` attribution hidden, zoom/fit controls
  minimized; dark grid (faint light lines on black).
- **`/how-it-works`** explainer page (fusion-weight optimization), footer-linked.

### Hero
- **Rotating multi-project annotated precedents** — `AnnotatedSubject` now cycles through
  `heroSubjects` (Salk Institute, Sydney Opera House) ~6.5s each with a crossfade + a position
  indicator, pausing on hover. Each pins the project's moves to precedents tagged **PAST /
  FUTURE** (Salk → Alhambra / Church of the Light / Getty; Sydney → Sagrada Família / Chichén
  Itzá / Oslo Opera House). All images verified high-res Wikimedia (`Special:FilePath?width=`).

## Verify
```
cd frontend && npm run dev   # 5173
```
- `/` hero rotates through 2 subjects (live browser; headless `--virtual-time` won't tick the interval).
- `/canvas`: black ground; press `/` → dark palette beside the rail; nodes share one dark frame;
  research panel collapses; fusion "?" tooltips; no minimap/attribution.
- `/privacy`, `/how-it-works`: canonical `LandingTopBar`.
- Headless screenshots need `--force-prefers-reduced-motion`.

## Left (follow-ups, not blocking)
- **Named frame/group regions** (Fuser's titled clusters) — still not built; grouping data
  exists in the store + an unused `ChildNodeGroup`. Highest-value remaining canvas feature.
- Footer node verbs render UPPERCASE (`.an-node__btn text-transform`) — cohesive; change to
  sentence-case is a one-line `canvas.css` tweak if desired.
- Operator/Filter/Scalar result counts are still mock (`34 - n*4`) — wire to real execution.
- `GenerateNode` dual handles use fixed offsets vs the registry's auto-distributed ports.
- A 3rd rotating hero subject can be added to `heroSubjects` (data-driven) when more verified
  imagery is sourced.
- Legacy `Palette.tsx` now unused (replaced by `CanvasRail` + `AddNodeModal`) — safe to delete.

## Files (key)
- New: `HowItWorksPage.tsx`, `docs/handoffs/2026-06-14-edits-round-3.md`.
- Rewritten: `styles/canvas.css`, `components/Canvas/AddNodeModal.tsx`,
  `components/landing/AnnotatedSubject.tsx`, `data/heroPrecedentMap.ts`, `Nodes/*` (13 files
  via the node agent: `BaseNode`, `TextNode`, `ImageNode`, `ValidateNode`, `StyleReferenceNode`,
  `AttributeFilterNode`, `ScalarNode`, `PrecedentNode`, `ResultsNode`, `GenerateNode`, 3 operators).
- Edited: `NodeCanvas.tsx`, `pages/ResultsPage.tsx` (panel), `PrivacyPolicyPage.tsx`, `App.tsx`,
  `LandingFooter.tsx`, `HeroAssembly.tsx`.
