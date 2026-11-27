# Handoff — Splash / landing eclectic overhaul (2026-06-15)

Branch: `rebrand/concrete-and-signal`. Route `/` → `SearchLandingPage`.

## What
Reworked the homepage splash into a compressed, single-viewport hero plus a
Spacelab-style intro, then ran a design + user-research pass and applied the
high-confidence fixes.

- **Preloader** (`components/landing/Preloader.tsx`, new): the letters of
  "archipedia" assemble (settle onto a baseline from just above) then travel +
  shrink to land on the real header wordmark (`[data-wordmark]`), measured before
  paint with a `document.fonts.ready` correction. ~2.2s, once per tab
  (sessionStorage), skipped under reduced motion.
- **EclecticHero** (`components/landing/EclecticHero.tsx`, replaces the dark
  `HeroAssembly` on `/`): cool-neutral concrete ground lit from a single
  upper-left rake; drawing-sheet **titleblock** label (no orange square); Archivo
  headline + Fraunces-italic "everything"; a three-voice pitch
  (Archivo → Fraunces-light lead → Hanken body); **no search** — a pressed
  "See how it works" button scrolls to the tutorial, with a quiet
  "or skip to search" express-lane link. Right column = the **annotated subject**
  (`AnnotatedSubject`) — one real project with precedent pins pointing at its
  formal moves — now shown from ≥768px (was desktop-only).
- **FinalCTA**: reframed eyebrow to **"READY TO START?"** (`id="ready-to-start"`),
  added image-search button + Signal-arrival feedback on the search button. This
  is now the only search entry on the page.
- Removed the `IndexTicker` ("desert museum / stadium roof" scroller).
- Added **The High Line** (Field Operations + DS+R) as a non-building subject in
  the hero rotation, with verified precedent pins (Promenade plantée,
  Landschaftspark Duisburg-Nord, Seoullo 7017).
- Accessibility: visible keyboard focus + `aria-pressed` on the annotated pins.

## Why
User direction across two rounds: imitate a refreshing/eclectic splash (Eindhoven
DD / Spacelab refs) for **design professionals, not students or B2B SaaS**;
remove the hero search and guide visitors to scroll a tutorial first; drop the
orange accent and warm off-white; relocate the page label; restore the annotated
main-project composition. A 2-designer (Apple principles) + 3-persona user study
flagged: weak pitch typography, buried search, the diagram hidden on mobile, and
"built/buildings + only-a-building example" reading architecture-only. User chose
to keep the hero search-free but add a **skip-to-search** link, and keep "built"
but add a **non-building subject** (the High Line).

## Verify
- `npm run dev` in `frontend/`, open a NEW tab at http://localhost:5173/ (intro is
  per-tab). Watch: letters assemble → fly to header; hero has no search; titleblock
  label; cool-neutral bg; Signal only on the word "genuinely" + the CTA.
- Hover the hero diagram; it rotates through Salk → Sydney → **High Line**
  (non-building). Tab to the pins → visible focus ring.
- Click "See how it works" → scrolls to the 4-step tutorial. Click "or skip to
  search" → jumps to "Ready to start?" and focuses the field.
- `npx tsc --noEmit` is clean. Backend (`:8000`) is OFF, so the hero's live
  precedent enhancement degrades to the frozen manifest (expected).

## Left / open (await user decision)
- **Corpus proof / real result near top** (architect persona wanted a number +
  one real cited result to build trust). Content/product, not done.
- Optional: a lighter simplified diagram for <768px phones (currently hidden).
- Drag-and-drop on the search well (placeholder says "drop a reference image").
- Tighten/earn the "tape" detail or drop it (studio-principal note).

## Update — inspiration-board pivot (same day)
The hero is now an **interactive pin-up wall** (replaces the annotated subject):
- Real precedents pinned with a shared **clear glass `Pushpin`** (3D, tilted, no
  colour) used across the whole page (hero cards + note, FinalCTA card, each
  narrative visual).
- **No-overlap guarantee**: 9 dedicated `SLOTS`, pick 7 per refresh; random 7 of a
  **26-project pool** (`heroBoardPrecedents.ts`, arch + landscape + urbanism).
- **Decorative string web** (`EDGES`) between cards — crime-board connections, not
  a literal intersection knot; threads follow live drag via motion values.
- Dragging kept but the "drag the precedents" hint text removed.
- North-star changed to **"Every design leaves a mark."** (footer, marquee,
  tokens, BRAND.md). All decorative blue marks removed (Signal = functional only;
  see memory `feedback-no-decorative-blue-marks`).
- **FinalCTA** is now a **white pinned panel** (not the dark footer) and was moved
  **above** the AtmosphereMarquee (less scrolling to the search).
- **ComposeCanvasVignette** rebuilt as a **product mock-up** of the canvas
  (precedent nodes → Generate node → generated output, app bar, ports, step wires).

## Files
- `frontend/src/components/landing/EclecticHero.tsx` (rewritten)
- `frontend/src/components/landing/Preloader.tsx` (new)
- `frontend/src/components/landing/IndexTicker.tsx` (new, now unused — left in tree)
- `frontend/src/components/landing/FinalCTA.tsx`
- `frontend/src/components/landing/LandingTopBar.tsx` (`data-wordmark`, seam shadow)
- `frontend/src/components/landing/AnnotatedSubject.tsx` (focus a11y)
- `frontend/src/components/landing/index.ts`
- `frontend/src/data/heroPrecedentMap.ts` (High Line subject)
- `frontend/src/pages/SearchLandingPage.tsx` (composition, `#how-it-works`)
