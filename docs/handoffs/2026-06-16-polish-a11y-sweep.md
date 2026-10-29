# Handoff — Final polish + accessibility sweep (2026-06-16)

Branch: `rebrand/concrete-and-signal`. Surfaces audited: `ProofStrip`, `EclecticHero`,
`FinalCTA`, `PinnedCard` (shared helper), `landingShared`.

## What

Full WCAG 2.2 AA audit of the three new landing surfaces plus the shared Pushpin/PinCard
helpers, with all high-confidence fixes applied directly. Design decision on the "tape"
detail resolved.

## Why

Deliverable #5 in the rebrand sprint: accessibility sweep before the branch is considered
done. Issues found ranged from marginal contrast on very small mono text to a keyboard
accessibility gap in the drag-and-drop image upload, and a missing aria-live region that
left screen-reader users unaware of drop-rejection errors.

## What was fixed

### Contrast — 7 call sites upgraded from ink-500 to ink-700

All instances of 9.5 px mono-caps attribution text (`--ink-500` / `#6b6e76`) on white or
near-white backgrounds were upgraded to `--ink-700` (`#3a3c42`). At 9.5 px, `ink-500` on
`concrete-50` is ~4.72:1 — passing the 4.5:1 threshold by a hair, but with no safety
margin and no tolerance for rendering variation. `ink-700` on `concrete-0` is ~10.5:1;
on `concrete-50` it is ~8.4:1. Changes:

- `ProofStrip` — "A REAL RESULT — NOT A RENDER" eyebrow (9.5 px), Stat metric label
  ("INDEXED PROJECTS" etc., 11 px mono-caps), EvidenceCard figcaption attribution line
  (9.5 px), body copy "Every result carries its source…" (13 px).
- `EclecticHero` — PinCard figcaption attribution span (9.5 px).
- `PinnedCard` — shared card component `meta` span (9.5 px); carries through to every
  NarrativeSection usage.
- `FinalCTA` — "READY TO START?" eyebrow (11 px mono-caps on concrete-50).

The design hierarchy is preserved: numbers and titles stay in `ink-900`, secondary prose
moves to `ink-700`, and `ink-500` remains appropriate for decorative hairline-level label
text at ≥14 px (e.g. the `.eh-skip` button and secondary body paragraphs at normal size).

### Keyboard operability — FinalCTA file input

The hidden file input previously had `aria-hidden="true"` and was triggered only by mouse
drag-and-drop or by a button's `click()`. The input was entirely invisible to assistive
technology. Fixed:

- Removed `aria-hidden` from the `<input type="file">`.
- Replaced `display: none` with the standard visually-hidden clip technique
  (`position: absolute; width: 1px; height: 1px; clip: rect(0,0,0,0)`). This keeps it
  out of the visual layout while remaining programmatically present.
- Added a `<label htmlFor={fileInputId}>` (also visually hidden) that gives the input an
  accessible name: "Search by image: choose a reference image file".
- `tabIndex={-1}` is retained — the sequential tab stop is the visible image-search
  button (42×42 px, `aria-label="Search by image: choose or drop a reference image"`),
  which calls `fileInputRef.current?.click()`. Keyboard users can tab to the button, press
  Enter or Space, and the OS file-picker opens.

### Screen-reader announcements — FinalCTA drop rejection

The non-image drop-rejection error was previously announced only as a visual toast
(`sonner`). Screen readers using ARIA live regions would miss it entirely. Fixed:

- Added a `role="status" aria-live="assertive" aria-atomic="true"` visually-hidden div.
- On drop of a non-image file, `liveMsg` state is set to the rejection text; the live
  region announces it immediately. The state clears after 4 s so the same rejection can
  be re-announced on a second bad drop.

### Focus rings — all interactive elements

The global `:focus-visible` rule in `tokens.css` applies a 2 px ink ring to most elements,
but several components defined their own `box-shadow` in hover/active states that could
mask it. Explicit `:focus-visible` rules added to:

- `.eh-scroll` — ink ring composed additively with the button's elevation shadow, so both
  are visible simultaneously.
- `.eh-skip` — 2 px ink ring with a small border-radius match.
- `.cta-img-btn` — 2 px offset ink ring (offset by a 2 px white spacer so the ring reads
  against the concrete-100 background).
- `.cta-search-btn` — same 2 px offset ink ring; non-blue per brand rule.
- `.cta-secondary` — 2 px ink ring.

No Signal blue appears in any of these focus states.

### Semantic structure — section labels

- `EclecticHero` `<section>` given `aria-label="Archipedia — precedent search for the
  built environment"`. Screen reader landmark navigation now surfaces this section by name.
- `ProofStrip` `<section>` given `aria-label="Corpus metrics and a real search result"`.
- `FinalCTA` already has `id="ready-to-start"` and an `<h2>` — no change needed.

### Decorative cards — EclecticHero PinCards

All seven `PinCard` figures in EclecticHero are decorative illustration. Their content
(title, architect, country) is not the primary content path and is not relied upon by AT
users — it is surfaced via search results and the ProofStrip evidence card. Each
`motion.figure` now carries `aria-hidden="true"` so screen readers skip the entire card
subtree. The Pushpin SVG already had `aria-hidden` at the component level.

The decorative string web SVG already had `aria-hidden`.

### Submit button aria-label removed

The Search submit button had `aria-label="Search the index"`, duplicating the text input's
label. With visible "Search" text in the button, the aria-label was redundant and caused
double-announcement in some screen readers. Removed; the button's visible text is
sufficient.

### Reduced-motion

All entry animations in the three surfaces gate on `motionOn` (derived from
`useReducedMotion()` at the page level). The count-up in ProofStrip runs through
`useCountUp`, which already returns the final value immediately when `!motionOn`. The
drag-well `transition` in FinalCTA uses CSS `transition` properties, which are globally
killed by the `prefers-reduced-motion` rule in `tokens.css`. No additional changes needed.

### Touch targets

- `cta-img-btn`: 42×42 px — passes WCAG 2.5.8 minimum (24 px) and is within 2 px of the
  project's 44 px target. Left as-is; bumping to 44 px would affect the overall well
  height and is a visual taste call rather than a compliance fix.
- `.eh-scroll` mobile: `padding: 13px 18px` (mobile override) — effective height ~43 px
  at 14 px font. Passes.
- `.eh-skip` mobile: `padding: 13px 0` — effective height ~43 px. Passes.

## Tape design decision — DROPPED

The "tape" detail referenced in the 2026-06-15 handoff (washi/masking tape strip on pinned
cards) was never implemented in code. Grepping the entire `frontend/src` tree finds zero
instances of any tape-related CSS, class name, or DOM element. The studio-principal note
was raised during a design review before implementation.

Decision: **drop it.** Reasoning — the pin-up board already carries three distinct
materiality signals: the glass pushpin (physical anchor), the tilted polaroid frame (surface
and rotation), and the string web (connection). Adding a fourth texture (tape) risks
competing with the pushpin as the primary "pinned" metaphor. The glass pushpin is clean,
unusual, and consistent across every card on the page. Tape would read as a cheaper
version of the same idea. The system is coherent without it; implementing tape just to
earn an open bullet adds noise without earning meaning.

If a future pass wants to revisit: a narrow `::before` strip (3–4 px tall, 32 px wide,
`background: rgba(255,248,210,0.55)`, slight `rotate`) positioned at the top edge of the
figure could suggest translucent masking tape without competing with the pin. But it should
only be added if the cards themselves feel unanchored without the pushpin — they currently
do not.

## Verify

- Tab through FinalCTA: text input → image button → Search button → "Or open the canvas"
  button. Each should show a visible ink ring (not a blue ring) on focus.
- With a screen reader (VoiceOver or NVDA): navigate to the FinalCTA section. Hear the
  form label "Search the index". Tab to the image button: hear "Search by image: choose
  or drop a reference image". Drop a non-image file: hear "File rejected: not an image.
  Please drop a JPG, PNG, or WebP." within one second.
- Tab into EclecticHero: the note heading "Press your idea against everything ever
  designed" is reachable; the pinned card figures are skipped by the screen reader.
- ProofStrip: the count-up numbers and metric labels are readable at their new ink-700
  color. Under reduced-motion, numbers show the final value immediately.
- `npx vite build` in `frontend/` — confirm clean with no TypeScript or import errors.

## Left / open (human decision)

- `cta-img-btn` is 42 px tall (2 px short of the 44 px project target). Bumping to 44 px
  changes the well height and is a visual taste call.
- The `mono-caps` utility class in `tokens.css` sets `color: var(--ink-500)` globally.
  All overrides in this session were done inline. Consider updating the class default to
  `--ink-700` if 11 px mono-caps at `--ink-500` should never appear anywhere. (Waiting
  on a full audit of non-landing usages first.)
- The `ProofStrip` body copy "Every result carries its source…" is now `--ink-700`.
  If this reads as heavier than intended in the column layout, `--ink-500` would still
  pass 4.5:1 on `concrete-0` (card background) at 13 px — the only concern is when it
  sits on the `concrete-50` page background in the stacked tablet/mobile layout where the
  card doesn't render. Currently fixed to ink-700 to be safe.

## Files changed

- `frontend/src/components/landing/FinalCTA.tsx`
- `frontend/src/components/landing/EclecticHero.tsx`
- `frontend/src/components/landing/ProofStrip.tsx`
- `frontend/src/components/landing/PinnedCard.tsx`
