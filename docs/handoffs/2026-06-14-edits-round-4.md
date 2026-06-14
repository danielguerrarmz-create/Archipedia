# Handoff — Round 4 (user personas + canvas honesty/fluidity)

**Date:** 2026-06-14
**Branch:** `rebrand/concrete-and-signal`
**Scope:** Frontend + docs. Build green. Not committed.

## What

### User personas (NEW — `docs/personas/`)
Four research personas + an index, written by the product-designer agent and used to drive
a P0/P1/P2 review of the product:
- `docs/personas/README.md` — index + how to use in design/QA + **consolidated P0/P1/P2 findings table**
- `01-architecture-student.md` — Maya Okonkwo, 3rd-year intern (extension of the Principal/mid-designer)
- `02-intermediate-designer.md` — Dev Raman, 3–5 yrs (has carried buildings into construction)
- `03-senior-architect.md` — Lena Vasquez, 10+ yrs
- `04-principal-owner.md` — Marcus Feldt, Principal/Owner

### Canvas fixes (from the personas' P0s + the client's notes)
- **F1 — honest failure (P0).** Removed the `mockProjects` fallback in `ResultsPage.performTextSearch`.
  A precedent tool must never invent buildings: on index failure it now clears results and shows a
  toast ("Couldn't reach the index"), matching the Classic page's honest contract.
- **F2 — RUN now relates to the canvas (P0).** Rebuilt the RUN button: **disabled/dim when the
  canvas is empty**, active Signal-blue when there's a graph, shows a **RUNNING…** state, and toasts
  **loading → success / error** (it inspects node `executionStatus` for failures). Toolbar restyled
  dark to sit on the black ground.
- **Fluidity / movement (client note).** ReactFlow nav is now Figma/Fuser-style: **pan-on-scroll**
  (trackpad two-finger), pinch / ⌘-scroll zoom, drag-to-pan, double-click opens the palette (no
  longer zooms). All **fit-view actions animate** (`duration: 700`). Nodes now **settle in** with a
  rise+fade entrance (`an-node-in`, reduced-motion-safe).
- **Stronger first appearance (client note).** `EmptyCanvas` rewritten: a small precedent-graph
  motif **assembles itself** (nodes settle, connector draws, a Signal union nub flashes), an editorial
  heading, a one-line "press `/` or `+` to add a node" with keycaps, and the **starter templates as
  the hero path**.

## Persona findings backlog (not yet done)
From `docs/personas/README.md` consolidated table — prioritized for the next passes:
- **F3 (P0, partial):** a single global "index unreachable" signal across splash/Classic/Canvas
  (currently per-surface toasts/errors). 
- **F4 (P1):** guarantee architect · project · location · year on **every** precedent representation
  (canvas precedent node + compact results row + export), not just hero/Classic cards.
- **F5 (P1):** default one-click path — land on Canvas with a pre-wired Text→Results graph already
  populated from the splash query (graph stays for power users).
- **F6 (P1):** reconcile the light-pages ↔ dark-canvas handoff (token systems, a narrated transition).
- **F7 (P1):** surface the "what happens to my uploads" assurance at the upload point (Principal's
  gating question), not only buried in the Privacy policy.
- **F8–F10 (P2):** reconcile documented vs actual fusion-weight defaults; consistent empty/loading/error
  states on the canvas + node-results; visible autosave / "my boards" / share-scope.

## Files
- New: `docs/personas/*` (5), `docs/handoffs/2026-06-14-edits-round-4.md`.
- Edited: `pages/ResultsPage.tsx` (mock removal, toast, RUN), `components/Canvas/NodeCanvas.tsx`
  (nav config, smooth fit), `components/Canvas/EmptyCanvas.tsx` (rewrite), `styles/canvas.css`
  (node entrance).

## Verify
```
cd frontend && npm run dev   # 5173
```
- `/canvas` empty: motif assembles; RUN is dim/disabled.
- `/canvas?q=civic concrete`: RUN turns active blue; with backend off, results stay empty + a toast
  fires (no fabricated matches); RESULTS node shows the real error.
- Pan with two-finger scroll; double-click empty canvas opens the palette; fit animates.
- Headless screenshots need `--force-prefers-reduced-motion`.
