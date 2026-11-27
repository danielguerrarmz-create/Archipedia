# Handoff: Search by Assembly demo, review round 1 (2026-10-28)

Branch `demo/static-mvp` (local, uncommitted). App: `demo-mvp/` (Vite + React + reactflow 11).
Run: `cd demo-mvp && npx vite build && npx vite preview --port 5191`, open http://localhost:5191/.
Data: `navigator/.venv/Scripts/python.exe navigator/scripts/build_demo_data.py`.

## What
A static portfolio demo of **Search by Assembly**: a node canvas (Building, Filter, Blend, Results)
ranking 267 real ArchDaily projects by weighted cosine over real DINOv2 index vectors, computed
in the browser. Plus a hero, a keyword index, a close-up view with 12 visual neighbours, and a
board with copyable citations. Five reviewer hats walked it (architect, product designer,
enthusiast, UX designer, software engineer); this round fixed what they found.

## Findings and what shipped
| Pri | Finding (hats) | Fix shipped |
|---|---|---|
| P0 | Whitney credited to Cooper Robertson only; 28 of 267 credits truncated (architect) | Full multi-firm credit taken from the ArchDaily title (`full_credit` in build script); 30 multi-firm credits |
| P0 | Canvas, the core idea, buried as section 3 (designer) | Page order hero, canvas, close-up, index, board; hero CTA "Try the canvas"; stats folded into one proof line |
| P0 | New nodes pile up unwired at the canvas edge (UX, SWE, architect) | Column layout by type, auto-wire to Blend/Results, refit on add and on resize |
| P0 | Two metrics: study "d" (L2, all images) vs canvas cosine (SWE, architect, enthusiast) | One measure everywhere: cosine, 2 decimals, legend with real anchors (closest-other median 0.79, random pair 0.19); `neighbors.json` dropped, close-up uses the same engine |
| P0 | Neighbours matched the camera angle (architect) | Close-up lets you choose the query photo; every card shows the photo that matched |
| P0 | "cabin in the woods" returns 0 of 0 (enthusiast) | Any-word keyword match ranked by matched words; a dead end offers six picture starting points |
| P1 | Slider position vs "%" disagree; "-19" for Unlike (all) | Raw weight shown, share as secondary text ("70% of the pull", "pushes away with weight 30") |
| P1 | Filter status wrong (architect, UX) | Status lists active filters ("Brazil · 2015 or later") |
| P1 | Long names push Like/Unlike off the node (architect) | Fixed 3-column row with ellipsis |
| P1 | Mobile hero overflow, Canvas link hidden, canvas unusable (UX, SWE) | `minmax(0,1fr)` hero, Canvas kept in nav, stacked 1:1 canvas on phones with page scroll |
| P1 | Wheel zoom traps page scroll (SWE) | `zoomOnScroll` off, `preventScrolling` off |
| P1 | Invisible focus (UX) | 2px solid ink outline, light outline on dark chrome |
| P1 | Footer said the full app "adds a canvas" and "L2" (all) | Footer rewritten |
| P1 | A host's index.html fallback would be read as vectors (SWE) | Size check against meta rows x dim |
| P2 | Quantisation noise near rank gaps (SWE) | Per-row int8 scale (`scales.bin`), max cosine error 0.002 |
| P2 | Starter recipe read as random (enthusiast) | Starts on "A cabin, with a little chapel in it" (Le Carrier Cabin + River Chapel) |
| P2 | Graph lost on reload; letters renumber on delete (UX) | Graph saved to localStorage; letters stored per node |
| P2 | Signal blue on two ports at rest (designer) | Ports are ink; Signal only while a wire is being drawn |
| P2 | Citations not deck-ready (architect) | Full credit, place, year, ArchDaily URL, accessed date, photo-credit pointer |
| P2 | Edge names were internal ids; NaN years; stale board count; re-render on every tick (UX, SWE) | Readable edge labels, digit-only year inputs, board counts live ids, results published only on change |
| P3 | Year truncated in captions; PIN chips float; placeholder contrast (designer, UX) | Year-first captions, chips at card edge with 40px targets, placeholder `--ink-500` |

## Left (deliberately)
- **Keyboard/tap wiring** ("Connect to..." menu). Auto-wire covers the common path; drag is still mouse-only.
- **Undo** for canvas edits.
- **Photographer credits**: the corpus has no photographer field; citations point to the ArchDaily page.
- **Material/typology tags**: typology is "unknown" for every curated row, so "timber" cannot be a filter yet.
- **Mini canvas in the hero** (designer). The hero links to the canvas instead.
- Server-only features: own-image upload, semantic text search, Generate.
- Backend (outside the demo): `/search/url` 500s on NaN metadata; local server needs `MODEL_NAME=vit_base_patch14_dinov2`; same id-map bug in dead `services/index_store.py`. The live id-map bug itself is fixed in `app/faiss_service.py` with `tests/test_faiss_row_mapping.py`.
- Deploy: mount the build at a path ending in "/" (base is "./").

# Round 2 (same day): same five hats on the fixed build

Round-1 fixes verified by the reviewers: full credits (checked against two ArchDaily pages), one
cosine scale, raw weight plus share, filter status, graph persistence, mobile hero, stacked phone
canvas, focus on buttons and sliders. SWE found no P0/P1; build and 35 tests green.

| Pri | Finding (hats) | Fix shipped |
|---|---|---|
| P0 | Clear, then +Building x2, +Filter, +Blend left Blend unwired (UX) | A new Blend collects every building and filter not already feeding a Blend, and claims Results |
| P0 | Canvas fit at ~0.52 zoom, node text ~5px (designer, UX, architect) | Measured-height layout: buildings in a 2-column grid, filters under, Blend then Results to the right; fit with min zoom 0.7; node text floor 11px; "Tidy" button |
| P1 | Board and close-up showed the cover, not the photo that made the argument (architect) | The matched photo travels: result, close-up (opens on it), pin, board |
| P1 | "0.79 typical" anchor made unusual buildings look broken (enthusiast) | Close-up states this photo's own best match next to the typical one; results legend says order matters |
| P1 | A 30% building won #1 with no explanation (enthusiast) | The building that carried each card is bold; Unlike streams read "not B" |
| P1 | Focus not visible on nodes, wires, search; focus left behind on add and close-up (UX) | Focus rings added; focus moves to the new node's search field and to the close-up heading |
| P1 | Clear destroyed the graph with no undo; blank canvas gave no hint (UX) | 10-second Undo; empty-canvas prompt |
| P1 | Close-up strings ran over the legend (designer) | Label sits above the strings |
| P2 | Counts disagreed (6 vs 12, 265 vs 266) (enthusiast) | "best 6 of N" on the node, "Top 12 of N ranked" under it; connected buildings always excluded so N is stable |
| P2 | Results said "connect a building" when an empty one was connected (SWE) | New "Pick a building" reason |
| P2 | Year filter removed 5 of 267 silently (architect) | Blend shows "N of M removed" |
| P2 | Citation "moss.." double period; "Sept" (SWE) | Trailing period stripped; full month names |
| P2 | Search jumped past the canvas with no next step; #assembly link ignored (enthusiast) | "Blend this" on index cards; picture starts also shown at 1-2 hits; hash scroll after load |
| P2 | Subhead competed with h1; Pinned chip heaviest object; credits truncated (designer) | Quieter subhead; debossed pinned state; credits wrap to two lines |
| P2 | Live re-rank not announced; label/name mismatches; Search idle contrast (UX) | Polite live region; names start with visible text; ink-700 idle text |
| P3 | Jargon: Precedent/Attributes/Assemble badges, stale canvas heading, "01" read as a count | Building / Filter / Blend; generic heading; "Your precedent study" |

Not done (and why): keyboard or tap wiring between ports; city and climate/material filters (city
and typology are "unknown" for every curated row); editable board title; per-node undo beyond Clear.
"[tp3] architekten", "[STRANG]", "(ab)NORMAL" are real firm names, not leaked data.

# Standalone canvas page (Daniel's request, same day)
The canvas moved off the home page to `./?view=canvas`, in the layout of the old `/canvas`
(`frontend/src/pages/ResultsPage.tsx` on `main` @ c83c972: NodePaletteSidebar left, Research panel
right) rebuilt in Concrete & Signal. Left: Add palette (Building, Filter, Blend, Results) and Tidy /
Reset / Clear. Right: study title, per-building weights (same state as the Blend node), country chips
(same state as the Filter node), ranked results with pins. Decision (Daniel): per-building weights,
NOT the old Visual/Spatial/Regional trio, whose per-result scores were `Math.random()` and whose
spatial/regional inputs are empty for all 267 demo projects. Home keeps a live teaser (starter blend
A 70 + B 30 and its top 3) linking to the canvas. Close-ups opened from the canvas carry the matched
photo and a "Back to the canvas" link.

# Canvas viability pass (same day)
Old canvas audit (Edward): in `main`'s `/canvas`, Attributes/Constraints/OR/NOT were engine pass-throughs
(`lib/workflowEngine.ts:195` default case), Fusion Weights re-ranked `Math.random` scores, the Actions
select had no handler. Ported the real interaction ideas: drag a result onto the canvas (new Building) or
onto a Building (replace), right panel follows the selected node and names which Blend/Results it shows,
minimap, × on every node, general undo (Ctrl+Z, 40 steps, covers add/delete/wire/tidy/reset/clear),
Esc deselects, Save as file / Open file (JSON), a "How to use" legend listing only real shortcuts.
Stress test (QA) fixes: adding a node no longer re-lays-out the graph (free-slot placement; Tidy is
explicit); Delete/Backspace only act when working in the canvas (a chip click + Backspace deleted a
selected node); empty canvas persists; a new Blend only takes over Results when it has buildings;
near-square Tidy grid for many buildings; wires drawn above cards; Blend rows in letter order; Reset
resets the title; picker no sideways scroll. Verified in the browser: all pass, 0 console errors.
Known limit: at 13 nodes the fit zoom is ~0.45; the right panel carries full-size controls.

## Session close, 2026-10-28

- **What:** demo committed on `demo/static-mvp` (`b731455`..`03e0772`) and pushed; PR #1 open into the fork's `main` (https://github.com/danielguerrarmz-create/Archipedia/pull/1). It also carries the 9 unmerged `rebrand/concrete-and-signal` commits. The portfolio page now shows this demo (portfolio PR #4, merged and live).
- **Verify:** 35 navigator tests pass; demo `tsc` clean; gitleaks clean on committed files (one false positive, a project id in `App.tsx`).
- **Left:** Daniel to merge PR #1. Fix the home teaser's third card overhanging its box. Daniel / Clay: was the FAISS row-mapping bug present when the CAADRIA benchmark ran? Commit author is the old utexas.edu address (global git config).
