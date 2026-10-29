# Handoff — Round 2 edits (inputs, rotating placeholder, annotated hero, canvas command palette, privacy)

**Date:** 2026-06-14
**Branch:** `rebrand/concrete-and-signal`
**Scope:** Frontend. Builds clean (`npx vite build`). Not committed.

## What

Five client-requested changes, on top of the same-day editorial-serif elevation.

1. **Killed the blue input outlines sitewide.** Text fields had a resting Klein-blue
   border and a 3px blue focus ring nested inside it (a "rectangle within a rectangle").
   - `tokens.css`: `--focus-ring` is now **neutral ink** (was blue) + a `--focus-ring-on-dark`;
     global `:focus-visible` ring dropped 3px→2px; new form-field rule shows focus via a
     **border-darken** and suppresses the ring on inputs (and neutralizes the compiled
     Tailwind `--tw-ring-*` vars). Signal blue is no longer used for any focus.
   - Hero + FinalCTA search wells: removed the Signal resting/resolve border and the blue
     focus glow → neutral hairline that brightens to a light ink edge on focus.
   - `ui/input.tsx`, `ui/textarea.tsx`: focus now `deboss + inset 1px ink`, no blue.
   - (Note: shadcn ring default was already neutral grey `oklch(.708 0 0)`, not blue.)

2. **Rotating hero placeholder.** 20 real precedent queries in `landingShared.SEARCH_EXAMPLES`
   cycle every 3s with a crossfade (`useRotatingIndex` hook + an AnimatePresence overlay in
   `HeroAssembly`). Pauses once the visitor types; reduced-motion swaps without the fade.
   The native `placeholder` is emptied; `aria-label` carries the description.

3. **Hero is now an explicit annotated-precedent diagram.** New `AnnotatedSubject` +
   `data/heroPrecedentMap.ts`. One famous SUBJECT (Salk Institute, Kahn) with pins on its
   formal moves, each pointing to the precedent it resembles — board-formed concrete →
   Church of the Light (Ando); the axis → Court of the Lions, Alhambra; the travertine court
   → Getty Center (Meier). One pin auto-highlights at a time; hover locks it. Framed as
   "resembles" (honest to the engine's visual-proximity model, not asserted citation).
   **Images** are high-res openly-licensed Wikimedia Commons photos (subject via upload-CDN
   thumb; pin sources via the stable `Special:FilePath?width=` accessor — all verified to
   resolve). Replaced the old `LivingGraph` decorative overlay in the hero stage.
   Data-driven — add pins or swap to in-house R2 assets when they exist at this resolution.

4. **Canvas: Fuser-style command palette + minimal floating rail (interaction rethink).**
   - New `AddNodeModal` — searchable, categorized (INPUT/OPERATOR/GENERATE/OUTPUT) click-to-add
     palette, plus starter templates. Opens from the rail (+), the `/` key, or double-clicking
     empty canvas. Adds nodes at viewport centre (offset-stacked). Matches the uploaded
     Fuser screenshot. Verified rendering.
   - New `CanvasRail` — minimal floating left icon-rail (Add / Templates / Fit), replacing the
     old fat tabbed `Palette` overlay → cleaner, more canvas.
   - `nodeFactory.createNodeFromType(type, pos)` — one factory map shared by the drag-drop
     pane handler and the palette (the drop switch was refactored down to it).
   - `Palette.tsx` is now unused (kept on disk; can be deleted).

5. **Privacy policy.** New `PrivacyPolicyPage` at `/privacy` (route added in `App.tsx`; link
   added to the footer STUDIO column). Brand-matched; content grounded in the real stack
   (Clerk—currently disabled, PostHog analytics, Cloudflare R2 image CDN, Gemini generation,
   FastAPI search; uploaded images are not persisted). Includes a not-legal-advice disclaimer.

## Left (canvas — the deeper rethink, next pass)

The command palette + rail are done and verified, but the **full canvas re-architecture** the
client described is only partly delivered:
- ResultsPage still uses the **75/25 split with an always-on research panel** on the right.
  Next: full-bleed canvas + move search into the palette/rail, and replace the always-on
  panel with a **contextual inspector** (the dormant, complete `NodeInspector.tsx` can be wired
  to `canvasStore.selectedNodes[0]` + `updateNode`).
- **Named frames/groups** bounding node clusters (Fuser's titled regions): grouping data
  exists in the store (`nodeGroups`, `groupId`) and an unused `ChildNodeGroup` renders a box —
  but no titled frame node exists yet. Needs a frame node type added to `nodeTypes`.
- Consider a darker canvas ground to match the Fuser reference (risk: node components are
  styled for the light surface — would need a node restyle pass).

## Files

- New: `frontend/src/components/Canvas/AddNodeModal.tsx`, `CanvasRail.tsx`,
  `frontend/src/components/landing/AnnotatedSubject.tsx`, `frontend/src/data/heroPrecedentMap.ts`,
  `frontend/src/pages/PrivacyPolicyPage.tsx`, this handoff.
- Edited: `tokens.css`, `ui/input.tsx`, `ui/textarea.tsx`, `HeroAssembly.tsx`, `FinalCTA.tsx`,
  `landingShared.ts`, `NarrativeSection.tsx` (prior), `ProofStrip.tsx` (prior),
  `Canvas/NodeCanvas.tsx`, `lib/nodeFactory.ts`, `App.tsx`,
  `components/landing/LandingFooter.tsx`, `BRAND.md`, `fonts.ts` (prior).

## Verify
```
cd frontend && npm run dev   # 5173
```
- Hero: rotating placeholder; no blue on the search well; Salk subject with 3 precedent pins.
- `/canvas`: press `/` or click the rail + (or double-click empty canvas) → command palette.
- Any text input: focus shows a neutral border-darken, never a blue double-rectangle.
- `/privacy`: renders; linked from the footer.
- Headless screenshots need `--force-prefers-reduced-motion` (framer staggered reveals).
