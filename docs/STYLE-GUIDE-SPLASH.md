# Archipedia — Splash Style Guide ("Concrete & Signal", as built)

> Companion to [`frontend/BRAND.md`](../frontend/BRAND.md) and
> [`frontend/src/styles/tokens.css`](../frontend/src/styles/tokens.css).
> BRAND.md is the system of record for tokens, color, and the node–connector–union
> grammar. **This document captures how the splash page (`SearchLandingPage`)
> actually expresses that system today**, reconciles where the live splash has
> moved past BRAND.md, and gives a concrete checklist for bringing every other
> page to the same identity. When this doc and BRAND.md agree, BRAND.md wins on
> tokens; this doc wins on *layout grammar and as-built patterns*.

---

## 0. The deltas — read this first (where the splash moved past BRAND.md)

The splash evolved through the "eclectic overhaul." If you port the *old* BRAND.md
literally you will rebuild a page that no longer matches the splash. The live
deltas:

1. **The hero is LIGHT — but it is NOT `--concrete-50`.** BRAND.md describes a
   dark "studio ground" cinematic hero. The live hero ground is a **custom,
   hand-tuned light radial gradient**, hardcoded in `EclecticHero.tsx` (not a
   token):
   `radial-gradient(118% 92% at 28% 6%, #f2f3f3 0%, #e8e9e9 50%, #dddede 100%)` —
   lighter and cooler than `--concrete-50` (#f4f4f2). **Do not paint a section
   `--concrete-50` "to match the hero"** — it reads flatter and greyer. There is
   no `--studio-light` rake on the hero (that lives only on the dark ground). The
   Final-CTA is a **white pinned panel** (`--concrete-0`), not the dark band.
2. **Dark studio ground frames the page TOP and BOTTOM — not "the footer."** The
   `--studio-*` tokens live in BOTH the sticky **`LandingTopBar`** (a persistent
   dark nav, by design, so the wordmark never disappears against the light hero)
   and the **`LandingFooter`** — a deliberate dark → light → dark sandwich. Treat
   dark grounds as the **top-bar + footer chrome**; never a content-section
   background, and never "fix" the dark nav as a stray legacy ground.
3. **The pin-up board is THE signature motif** (see §3). Precedents are pinned to
   a wall with a clear-glass thumbtack; cards are white "polaroid" frames; a
   decorative string web connects them. This is the literal expression of "press
   your idea against everything ever built." It did not exist when BRAND.md was
   written and is now the single most recognizable brand device.
4. **Focus rings are NEUTRAL INK, never Signal.** `--focus-ring` is
   `rgba(21,22,26,.32)`. Text fields show focus by *darkening their own border*,
   not a ring. Signal is reserved strictly for the functional Search/Generate
   control. (BRAND.md's older "focus = signal ring" line is superseded by
   tokens.css.)
5. **No decorative blue, ever** — not a dot, line, bullet, underline, or stamp
   accent. The only blue on a page is the one functional control (Search submit /
   Generate). `MatchStamp` is used with `noSignal`. This is a hard rule.
6. **The hero headline is Archivo with ONE serif swell — not a Fraunces display
   line.** The hero headline (`EclecticHero` `.eh-note-head`) is **Archivo
   (`--font-display`) weight ~680**, with only a single word set in Fraunces italic
   via `.editorial-em`. The full `.display-editorial` Fraunces headline lives in
   **`FinalCTA`**, and section openers use Fraunces roman ~420. So: marketing
   *display* = Fraunces; the *hero line specifically* = grotesk + one serif accent
   (a deliberate contrast — don't set page heroes in full Fraunces). App chrome
   stays Archivo throughout.

---

## 1. Essence — what the splash *is*

Archipedia is the **index of the built world** — an instrument for the *messy
middle* of design (searching, comparing, connecting, collecting), not a gallery
of finished renders. The splash dramatizes one idea: **you pin real precedents to
a wall and press your half-formed idea against them.**

- **Surface = concrete.** Cool, neutral, matte, structural, quiet. Light rakes
  across it; nothing floats on glass.
- **Intelligence = one Signal.** A single International Klein Blue (`--signal
  #1f3fff`) that appears only at the functional moment of action.
- **Everything is pressed, pinned, or stamped.** Depth is emboss/deboss, not
  drop-shadow glow. Precedents are physically *pinned up*. Saves are *stamped*.
- **North-star: "Every design leaves a mark."** Inclusive of architecture,
  landscape, and urbanism — never "buildings" only.

**Voice — Precise · Grounded · Quietly confident.** Speak like a monograph
caption: declarative, specific, metric. The provenance promise is core:
*"A real result — not a render." "Every result carries its source — architect,
project, location, year. Real, cited buildings; never invented."* Never: hype,
exclamation marks, "✨ AI magic," anthropomorphizing the engine, or the word
*"inspiration"* (Pinterest's word).

---

## 2. Foundations (use the tokens — do not invent values)

All values live in `tokens.css`. The ones a page port touches most:

- **Background:** `--concrete-50`. **Cards/surfaces:** `--concrete-100`. **Image
  wells / polaroids:** `--concrete-0`. **Inset wells:** `--concrete-sunken`.
- **Text:** `--ink-900` = primary headings + emphasis. **Lead & long-form body on
  light = `--ink-500`** (≈4.7:1 — fine at ≥15px; this is the splash's actual body
  tone, e.g. `NarrativeSection` leads). **Small mono meta / micro-labels (<14px) =
  `--ink-700`** (the contrast floor at small sizes — ProofStrip labels, card
  captions). Use `--ink-500` only at ≥14px; never `--ink-400/300` on body text.
- **Signal:** `--signal` only on the functional control. **Focus:** `--focus-ring`
  (neutral ink). **Hairlines:** `--hairline` / `--hairline-strong` — real 1px
  borders, never shadow.
- **Radius:** `--radius-sm 2px` (chips/stamps/tags), `--radius-md 4px`
  (buttons/inputs/cards), `--radius-lg 8px` (panels/modals/tiles). **No pills.**
- **Spacing:** 4px base (`--space-1..10`). Section rhythm uses
  `clamp(64px, 11vh, 128px)` vertical padding; `--container-max 1320px`; page
  gutter `clamp(20px, 5vw, 48px)`.
- **Elevation:** `--deboss` (inputs/wells/saved), `--emboss` (resting tactile),
  `--raised` (cards), `--elev-modal` (modals). No `box-shadow` blur >12px outside
  the modal token.

---

## 3. The pin-up board grammar (the signature — get this right)

This is what makes a page read as *Archipedia* rather than generic concrete UI.

- **Pushpin** (`components/landing/Pushpin.tsx`) — a **clear-glass thumbtack**,
  colourless (white speculars over translucent grey), now noticeably 3D with a
  cast + contact shadow. Props: `size`, `tilt`, and an optional **`seed`**
  (integer) that deterministically varies head shape, specular placement, shaft
  lean, and perceived angle. **Within a visible cluster, give each pin a distinct
  `seed`** (the splash grids pass `seed={i+1}`) so a wall of pins reads
  hand-tacked, not stamped; a lone decorative pin can use any fixed seed
  (`seed={9}`, `seed={4}`…). Anchored at the top edge of whatever it pins, at a
  tilt; `aria-hidden`.
- **PinnedCard** (`components/landing/PinnedCard.tsx`) — the shared **"project
  template"**: a white (`--concrete-0`) polaroid frame, 8px padding, image well
  over `--concrete-200`, `--raised`-class shadow + 1px hairline ring, rotated a
  few degrees, pinned with a `Pushpin`. **Only project imagery / visual artifacts
  use this frame — never text blocks.** Title = display 650; meta = mono 9.5px
  uppercase `--ink-700`; optional `MatchStamp` badge (with `noSignal`). Prop
  defaults (most call sites override only one or two): `tilt=-18`, `pinSize=32`,
  `aspect=1.5`, `pinXPct=50`, `seed=0`.
- **String web** — decorative threads between pinned cards (crime-board
  connections), `--hairline-strong`, that follow live drag. Desktop only;
  `aria-hidden`; never on touch.
- **Titleblock label** — a drawing-sheet style mono-caps label block (like an
  architectural sheet's titleblock), used instead of a generic page eyebrow.
- **Window/sheet mockups** are themselves *pinned to the wall* (the Compose
  canvas window and the Cite PDF sheet each carry a Pushpin) — the product is
  shown as an artifact on the same board.

**When a page shows precedents/projects, it must use `PinnedCard` + `Pushpin`
(seeded), not a plain `<img>` card.** That single substitution does most of the
rebrand.

---

## 4. Typography in practice

| Where | Class / face | Notes |
|---|---|---|
| **Hero** headline | **Archivo** (`--font-display`) ~680, sentence case | grotesk + **one** Fraunces `.editorial-em` italic swell (e.g. "everything") — NOT a full serif line |
| Marketing display (e.g. `FinalCTA`) | `.display-editorial` (Fraunces, opsz 144, wt ~380, −0.018em, lh ~1.0) | the true editorial display headline; one `.editorial-em` swell allowed |
| Section title | Fraunces, wt ~420, **roman** (not italic), clamp(27–42px) | subordinate to hero scale |
| Page/app heading | Archivo (`--font-display`), 600, sentence case | app chrome stays grotesk |
| Lead / body | Hanken Grotesk (`--font-body`), 15–18px, lh 1.6, `--ink-500` (lead) / `--ink-900` (emphasis) | never <13px |
| Eyebrow / micro-label | `.mono-caps` (Spline Mono, 11px, +0.14em, UPPERCASE) | labels only, `--ink-700` on light for small sizes |
| Counts / IDs / coords / meta | `.mono` / `.mono-meta`, **`tabular-nums`** | **every number is mono** |

Rules: headings are **display, sentence case**. Caps are reserved for **mono
eyebrows + mono micro-labels** (a labeling texture, never body voice). **Every
number, count, coordinate, ID, dimension, % and tag is mono.** This one rule
delivers most of the instrument feel.

---

## 5. Color & Signal discipline in practice

1. **One Signal-meaning per view.** The single functional control (Search submit /
   Generate node) is the only blue. Resting UI is monochrome.
2. **Remove every blue pixel and the screen should still work and look
   intentional.** Aim <5% Signal pixels; on most splash sections it is exactly
   one element.
3. **No decorative blue** (dots/lines/bullets/underlines/borders-at-rest/stamps).
   `MatchStamp` → `noSignal`. Match strength is encoded by **count + tier word +
   mono %**, never a colored dot.
4. **Focus = neutral ink ring** (`--focus-ring`); text fields darken their own
   border (no ring rectangle). Visible focus is mandatory, just not blue.
5. **Status is redundantly encoded** — glyph/shape + word, never color alone.
   Errors are honest: a broken-connector panel + Retry; **never fabricated
   results on failure.**

---

## 6. Materiality & motion in practice

- **Materiality:** matte concrete that gets pressed. Inputs/wells/saved =
  `--deboss`. Resting chips/controls = `--emboss`. Cards = `--raised`. Dividers =
  real 1px hairlines, often carrying a mono-caps label (axis-tick). No
  glass/blur/glossy shadow. Optional static `.grain` (opacity .035, never
  animated) and `.modular-grid` background on canvas/empty/marketing bands.
- **Motion** ("die pressing into material — settle, don't slide"): allowed =
  stamp/press feedback, connector wires *drawing* point-to-point, results
  emerging in a short stagger (≤40ms step, cap ~8), focus/hairline-label reveals,
  pinned cards settling onto the wall, count-ups. Forbidden = parallax, blur/glass
  transitions, bounce/overshoot, anything that moves *within a reading column*.
  **Always honor `prefers-reduced-motion`** (drop draws/staggers; keep
  opacity/state). Eases: `--ease-press`, `--ease-emerge`; durations `--dur-1/2/3`.
- **Sanctioned exception — `AtmosphereMarquee`.** The splash's closing full-bleed
  band (the "Every design leaves a mark" precedent ticker, two continuously
  translating rows, ~40s loop) is the one allowed continuous-loop. It is permitted
  ONLY as a full-bleed *atmospheric* band (never beside reading copy), **must
  pause on hover**, and **must render static under `prefers-reduced-motion`**.
  Don't generalize it into other moving decoration.

---

## 7. Component reuse map (port these, don't reinvent)

| Need on a page | Reuse |
|---|---|
| Pin a precedent / project | `PinnedCard` + `Pushpin` (seeded) |
| Project/precedent grid | grid of `PinnedCard` (see `SearchGridVisual`) |
| Match strength | `MatchStamp` from `components/motif`, `noSignal` |
| Eyebrow / divider | `.mono-caps`, `AxisTick`/`Node` from `components/motif` |
| Section beat (copy + visual) | `NarrativeSection` pattern (5fr/7fr, alternating) |
| Loader (no spinners) | `ConnectorLoader` (connector draws, union blinks) |
| Empty state | `NodeField` — sparse nodes + connectors, one neutral union |
| Closing atmospheric band | `AtmosphereMarquee` (pause-on-hover, static under reduced motion) |
| **Marketing** search well | `FinalCTA` recipe: debossed trough; focus = **2px `--ink-900` box-shadow ring** (not blue); image button + lone `--signal` Search submit; disabled = `--concrete-200`; drag-drop image |
| **App** search well | the app `Header` default-variant well (rotating placeholder + camera ghost) — a *different* component from the marketing well |
| Canvas node | `BaseNode`/`NodeFrame`; Generate is the only signal node |
| **Nav / chrome** | **`LandingTopBar`** = dark-studio marketing nav, sticky 60px, **no search field**. **`Header`** = the in-app light header (default variant has the search well; `variant="minimal"` = back-button only, for canvas). **These are different components — never an "or," never swap one for the other.** Footer = `LandingFooter` (dark studio). |

---

## 8. Application playbook — bring ANY page to brand

For each page, walk this checklist. A page is "on brand" only when every box is
true.

**A. Shell & ground**
- [ ] Content background `--concrete-50`; no leftover glass/blur grounds. Dark
      `--studio-*` is allowed ONLY on the `LandingTopBar` and `LandingFooter`
      chrome (the intentional dark→light→dark sandwich) — do not "fix" the dark nav.
- [ ] Correct shell for the zone: **marketing/content pages → `LandingTopBar` +
      `LandingFooter`; in-app pages → `Header`** (default or `variant="minimal"`).
      These are different components — pick by zone, don't swap.
- [ ] Container `--container-max`, gutter `clamp(20px,5vw,48px)`, section padding
      `clamp(64px,11vh,128px)`.

**B. Type**
- [ ] Marketing display lines → Fraunces (`.display-editorial` / section serif);
      app headings → Archivo display, sentence case.
- [ ] Body → Hanken, ≥13px: lead `--ink-500`, emphasis `--ink-900`, small meta
      `--ink-700`. Eyebrows → `.mono-caps`. Hero line stays Archivo + one swell.
- [ ] Every number/ID/count/% → mono + `tabular-nums`.

**C. Color & Signal**
- [ ] Exactly one Signal element (the primary action), or none. **Zero
      decorative blue.** Audit every blue pixel.
- [ ] Focus rings neutral ink; inputs darken border on focus.
- [ ] Contrast floors met (`--ink-700`+ for small text; `--ink-500` only ≥14px).

**D. Materiality & motion**
- [ ] Inputs/wells `--deboss`; cards `--raised`; chips `--emboss`. Hairline
      dividers, not shadow. No glass/blur.
- [ ] Any precedent/project imagery uses `PinnedCard` + seeded `Pushpin`.
- [ ] Motion settles (press/draw/stagger), honors reduced motion, nothing moves
      while reading.

**E. Voice & integrity**
- [ ] Copy is precise/grounded; provenance shown where results appear
      (architect · project · location · year, or "unrecorded — never invented").
- [ ] No fabricated/mock data on error; honest broken-connector + Retry.
- [ ] a11y: visible focus, redundant status encoding, ≥40px hit areas,
      `aria-hidden` on decorative pins/threads/grain.

### Per-page-type recipes

- **Search / results (`ClassicSearchPage`, `ResultsPage`, `StudyResultsPage`,
  `TextSearchPage`, `ImageSearchPage`, `EmptyResultsPage`):** debossed search
  well with the lone Signal Search button + drag-drop image; results as
  `PinnedCard` grid with `MatchStamp(noSignal)`; provenance on each result; empty
  state = `NodeField`; loader = `ConnectorLoader`; honest error panel.
- **Boards (`BoardsIndexPage`, `BoardViewPage`, `BoardEditPage`, `BoardSharePage`,
  print/canvas variants):** boards are *the wall*; saved precedents are pinned/
  stamped; index = pinned tiles; print/PDF = the Cite sheet grammar (mono sources,
  hairline rules, `PRECEDENT SHEET` titleblock).
- **Canvas (`BoardCanvasPage`):** uses `Header variant="minimal"` (back-button
  only — do NOT drop the full search well here); react-flow already tokenized in
  tokens.css; ensure Generate is the only signal node; ports/wires use
  node–connector–union; empty canvas uses `.modular-grid`.
- **Auth (`SignInPage`, `SignUpPage`):** centered concrete card (`--raised`),
  debossed fields with ink-border focus, lone Signal submit, mono-caps labels,
  the wordmark in `--ink-900` (never Signal). No social-glass buttons.
- **Content / legal (`PrivacyPolicyPage`, `ContactPage`, `HowItWorksPage`,
  `enterprise`, `DemoPage`, `LandingPage`, `Homepage`):** monograph prose
  (Hanken, generous measure ≤70ch), serif section openers, mono-caps eyebrows,
  hairline dividers carrying labels, any imagery pinned.
- **Project detail (`ProjectDetailPage`):** the project as the hero artifact
  (large, can bleed/cast); full provenance block in mono; "similar precedents"
  as a `PinnedCard` row; "press to board" = stamp action.

**Out of scope (intentionally left off-brand):** the print sheets
(`BoardPrintPage`, `BoardCanvasPrint`) keep their print-reliable styling (Georgia
fallback, no web chrome), and the anonymous study pages (`StudySearchPage`,
`StudyResultsPage`) stay deliberately neutral so they don't bias a live user
study. Do not rebrand these unless product scope changes.

---

## 9. Review rubric (for the agent acting as the user)

Score each page 0–3 on each axis; <3 means "not done — list the exact fixes":

1. **Recognizably Archipedia** — would a designer landing here cold know it's the
   same product as the splash? (pin-up grammar, concrete ground, serif voice)
2. **Signal discipline** — exactly one (or zero) functional blue; zero decorative
   blue; neutral focus rings.
3. **Type system** — serif/grotesk/mono used per role; every number mono;
   sentence-case headings.
4. **Materiality** — deboss/emboss/raised correct per element; hairlines not
   shadows; no glass/blur.
5. **Precedent treatment** — projects pinned (`PinnedCard` + seeded pin), not
   plain cards; `MatchStamp(noSignal)`.
6. **Voice & integrity** — precise monograph copy; provenance present; no
   fabricated data; honest errors.
7. **Accessibility** — visible (neutral) focus, redundant status, contrast
   floors, hit areas, reduced-motion, decorative elements `aria-hidden`.
8. **Polish** — spacing rhythm, alignment to grid, no orphaned legacy styles.

A page ships only at 3/3 across all eight axes, reviewed by an agent role-playing
the actual user (a practicing designer at a small architecture firm) who is
skeptical, detail-obsessed, and allergic to generic AI-SaaS aesthetics.
