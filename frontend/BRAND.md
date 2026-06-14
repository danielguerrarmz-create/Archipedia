# Archipedia — Brand Identity Playbook
### "Concrete & Signal"

> **North-star — "Every building leaves a mark."**
> Archipedia is the *index of the built world*: a place where a half-formed idea gets pressed against thousands of real, standing buildings until the relevant ones surface. Not a gallery of finished renders — an instrument for the **messy middle**: the searching, comparing, connecting, and collecting that happens *before* a design is resolved.

This is the single source of truth for the Archipedia interface. The system tokens live in [`src/styles/tokens.css`](src/styles/tokens.css); the reusable brand grammar lives in [`src/components/motif/`](src/components/motif/). Build to the names here verbatim.

---

## 1. Concept & positioning

The surface is **concrete** — cool, neutral, structural, quiet. The intelligence is a single **Signal** — one sharp blue line that appears only at the moment of meaning: a match found, a connection made, a mark stamped. The interface behaves like a well-made architectural instrument: matte, precise, weighty, and almost entirely monochrome until the system has something to *say*.

The **emboss** is the core device (Fuser DNA): ideas and matches don't float on glass — they are *pressed into* the material. A saved precedent is stamped. A search is impressed. Every primary action carries physical consequence.

**Taglines**
- Primary — **"The index of the built world."**
- Action-led — **"Press your idea against everything ever built."**
- Short — **"Precedent, on demand."**

**Voice & tone — *Precise · Grounded · Quietly confident.***
- **Do:** speak like an architectural monograph caption — declarative, specific, metric. *"412 precedents. Sorted by visual proximity." "Pressed to board."*
- **Don't:** hype, exclamation marks, AI-magic language ("✨ supercharge your designs"), or anthropomorphizing the engine. The system is an instrument, not a personality. Never use the word *"inspiration"* (it's Pinterest's word).

---

## 2. Logo & wordmark

- **Wordmark:** `archipedia`, set in **Archivo 600**, **all-lowercase**, tracking **−0.02em**, color `--ink-900`. An uppercase tracked variant (`ARCHIPEDIA`, +0.04em) is the formal/footer lockup. The wordmark is *structure* — never set it in Signal blue.
- **Logomark / favicon — the debossed "A":** a square tile (`--concrete-100`, `--radius-sm`) holding an "A" built from the modular motif — the diagonal stroke is a *connector* bridging two *nodes*; the crossbar is the *union*, the one place the mark carries Signal. The "A" is **debossed** (pressed into concrete) — the literal "leaves a mark." See [`index.html`](index.html) favicon.
- **Clear space:** the height of the lowercase "a" on all sides. **Min** wordmark width 96px; min mark 16px (drop the deboss at 16px, render a flat 1.5px ink "A").

---

## 3. Typography

Self-hosted via **Fontsource** (see [`src/lib/fonts.ts`](src/lib/fonts.ts)) — no render-blocking Google Fonts.

| Role | Face | Token | Use |
|---|---|---|---|
| **Editorial** | Fraunces Variable (opsz) | `--font-editorial` | **Hero + landing section display lines only** — high-contrast old-style serif; the "architecture monograph" voice that gives the Swiss-grotesk shell its editorial character |
| **Display** | Archivo Variable | `--font-display` | App/page headings, wordmark, sub-heads — Swiss neo-grotesk |
| **Body** | Hanken Grotesk Variable | `--font-body` | UI + prose — humane, legible |
| **Mono** | Spline Sans Mono | `--font-mono` | Metadata, counts, IDs, coordinates — instrument annotation |

**Editorial serif usage.** Reserved for the *marketing/landing* display register, NOT the app chrome (which stays Archivo grotesk for its instrument feel). Apply via `.display-editorial` (opsz 144, weight ~380, tracking −0.018em, leading ~1.0). One italic swell per dark band is allowed via `.editorial-em` — the hero ("*everything*") and the FinalCTA ("*a feeling*") use it as a deliberate matching bracket. Section titles use the serif at weight ~420, roman (not italic), clearly subordinate to the hero scale. Rationale: an all-grotesk page read as generic tech; editorial/architecture/premium products need serif↔sans contrast (validated against the `ui-ux-pro-max` design-intelligence skill — "Classic Elegant / Luxury Minimalist" pairings, "Exaggerated Minimalism").

**Type scale** (px / line-height / weight / tracking; rem base 16px):

| Token | Use | Face | Size / LH | Wt | Tracking | Case |
|---|---|---|---|---|---|---|
| editorial-hero | Landing hero | **editorial** | clamp(38–68) / 1.02 | 380 | −0.018em | sentence |
| editorial-section | Landing section title | **editorial** | clamp(27–42) / 1.1 | 420 | −0.012em | sentence |
| display-1 | App hero | display | 72 / 1.02 | 600 | −0.03em | sentence |
| display-2 | Section hero | display | 52 / 1.05 | 600 | −0.025em | sentence |
| h1 | Page title | display | 36 / 1.1 | 600 | −0.02em | sentence |
| h2 | Section | display | 28 / 1.15 | 500 | −0.015em | sentence |
| h3 | Card title | display | 20 / 1.25 | 500 | −0.01em | sentence |
| h4 | Eyebrow | **mono** | 13 / 1.3 | 500 | +0.12em | UPPERCASE |
| body-lg | Lead | body | 18 / 1.6 | 400 | 0 | sentence |
| body | Default | body | 15 / 1.6 | 400 | 0 | sentence |
| body-sm | Helper | body | 13 / 1.55 | 400 | 0 | sentence |
| label | Buttons/inputs | body | 14 / 1.2 | 500 | +0.005em | sentence |
| mono-meta | Counts, coords, IDs, tags | mono | 12 / 1.4 | 400 | +0.02em | as-is |
| mono-caps | Micro-labels, ticks, stamps | mono | 11 / 1.3 | 500 | +0.14em | UPPERCASE |

**Rules.** Headings are **display, sentence case**. Caps are reserved for **mono eyebrows + mono micro-labels** — caps is a labeling texture, never body voice. **Every number, count, coordinate, ID, dimension, and tag is mono** (`font-variant-numeric: tabular-nums`) — this one rule does most of the architectural-software feel. Body never below 13px; display never below 20px (use mono-caps as a label instead).

---

## 4. Color

Cool concrete + true ink + **one** Signal. The Signal is **International Klein Blue.** (Rationale: red/vermilion reads as "error/destructive" in software and would fight every convention; IKB is iconic, art-historical, unmistakably premium, and on a concrete field reads as a single perfect line of pigment. A separate muted brick `--error` stays clean.)

```
CONCRETE   --concrete-0  #FFFFFF   images / modal sheets only
           --concrete-50 #F4F4F2   PAGE BACKGROUND
           --concrete-100 #ECECE9  surface / cards
           --concrete-200 #E2E2DE  raised (toolbar, popover)
           --concrete-300 #D4D4CF  heavy dividers
           --concrete-sunken #E8E8E4  inset wells
INK        --ink-900 #15161A  primary text / wordmark   (≈15:1 on concrete-50)
           --ink-700 #3A3C42  strong secondary / icons
           --ink-500 #6B6E76  secondary text             (≈4.7:1 — body-secondary OK)
           --ink-400 #989BA2  tertiary / placeholder      (labels/disabled only)
           --ink-300 #BFC1C5  disabled / faint
           --hairline rgba(21,22,26,.12)   --hairline-strong rgba(21,22,26,.22)
SIGNAL     --signal #1F3FFF   interactive / focus / active mark   (≈6:1 on white)
           --signal-deep #002FA7   pressed / large fills (true IKB)
           --signal-hover #1733E0  --signal-tint #E7EAFF  --signal-tint-2 #CFD6FF
           --focus-ring rgba(31,63,255,.45)
SEMANTIC   --success #2F6B4F   --warn #8A6A1F   --error #B23A28   (+ -tint each)
```

**The Signal rule — the most important rule in the system.**
1. **One signal-*meaning* per view.** The blue carries exactly one meaning at a time — the single most important interactive moment (primary CTA **or** active selection **or** live match), not all three.
2. **Signal is for state & meaning, never decoration.** Allowed: primary button, link hover/active, focus ring, active nav item, "strong match," an *active* connector wire, the stamped-mark fill. Forbidden: section backgrounds, large fills "for color," icons-at-rest, headings, resting card borders.
3. **Resting UI is monochrome.** Remove every blue pixel and the screen should still work and look intentional. Aim for **< ~5% of pixels** carrying Signal.

**Redline swap (documented alternate).** To ship "redline mode," set `--signal:#FF3B1D; --signal-deep:#C42E14; --signal-hover:#E5341A; --signal-tint:#FFE7E2; --signal-tint-2:#FFCEC4; --focus-ring:rgba(255,59,29,.45)` and recolor `--error` to a distinct brick (`#8A4B2A`) so error ≠ brand. Everything else holds.

---

## 5. Materiality & texture

The whole system reads as **matte concrete that gets pressed**. No glassmorphism, no blur, no glossy drop shadows. Depth comes from light raking across a surface (top highlight + inset shadow), like an embossing die.

```css
--deboss: inset 0 1px 2px rgba(21,22,26,.18), inset 0 -1px 0 rgba(255,255,255,.85);  /* pressed IN  */
--emboss: 0 1px 0 rgba(255,255,255,.9), inset 0 1px 0 rgba(255,255,255,.6),
          0 1px 2px rgba(21,22,26,.10), 0 0 0 1px var(--hairline);                    /* raised OUT  */
--raised: 0 0 0 1px var(--hairline), 0 1px 1px rgba(21,22,26,.05), 0 4px 10px rgba(21,22,26,.06);
--elev-modal: 0 0 0 1px var(--hairline-strong), 0 24px 48px -12px rgba(21,22,26,.22);
```

- **Deboss** = inputs, wells, saved/stamped items, active toggles, the "A" mark.
- **Emboss** = resting tactile elements (chips, segmented controls, key buttons).
- **Stamp** (`.stamp`) = a debossed mark — *"this has been pressed to board."*
- **Grain** (`.grain`) — a static SVG fractal-noise at opacity .035, `mix-blend-mode:multiply`, so flat areas aren't dead-digital. **Never animated.**
- **Modular grid** (`.modular-grid`) — 24px hairline grid + node-dots on the 4× interval (canvas, empty states, marketing bands).
- **Hairlines** — all dividers are real 1px borders (`--hairline` / `--hairline-strong`), never box-shadow. Signature move: a hairline carrying a mono-caps label (axis-tick divider, see `AxisTick`).

---

## 6. Spatial system

- **Spacing** — 4px base: `--space-1..10` = 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Whitespace is **generous**; section rhythm uses `--space-8/9/10`.
- **Grid** — 12 columns, 24px gutter, 48px page margin (≥1024px), `--container-max: 1320px`. Canvas snaps to the 24px unit.
- **Radius** — `--radius-sm 2px` (chips/stamps/tags/mark), `--radius-md 4px` (buttons/inputs/cards — workhorse), `--radius-lg 8px` (panels/modals/tiles), `--radius-pill` **dots/avatars only — no pill buttons.**
- **Elevation** — prefer a hairline frame + deboss/emboss over any drop shadow. Drop shadow only at `--raised` (subtle) and `--elev-modal`. No `box-shadow` blur > 12px except the modal token.

---

## 7. Motion

**North-star:** *Motion feels like a die pressing into material — things arrive by settling into place and leaving a mark, never by sliding, bouncing, or fading like glass.*

```
--ease-press  cubic-bezier(.2,.8,.2,1)   default — decisive settle
--ease-emerge cubic-bezier(.16,1,.3,1)   content reveal
--dur-1 120ms   micro (hover, focus, toggle)
--dur-2 220ms   standard (enter/exit, stamp press)
--dur-3 420ms   deliberate (connector draw, collect, sections)
```

**Allowed:** stamp/press feedback, connector wires *drawing* point-to-point, results emerging in a short stagger (≤40ms step, cap ~8), focus rings, hairline-label reveals. **Forbidden:** parallax, blur/glass transitions, decorative loops, bounce/overshoot springs, anything that moves while the user reads, animating the grain/grid. Always honor `prefers-reduced-motion` (drop draws/staggers; keep opacity/state only).

---

## 8. The modular motif — node → connector → union

A single generative geometry runs through the whole brand (Fuser's base + connector + union):

- **NODE** — a small filled square (`--radius-sm`). A building / precedent / point. `--ink-700` at rest; `--signal` when active.
- **CONNECTOR** — a 1.5px line joining nodes. A relationship / visual proximity. `--hairline-strong`; `--signal` when live.
- **UNION** — the 3px nub where connector meets node. A *confirmed connection* — the one resting place (with the stamp) where Signal may sit.

**Construction rule:** every brand graphic is `NODE — CONNECTOR — NODE`, snapped to the 24px grid, right-angles preferred (the logo "A" is the licensed diagonal exception). This is literally the grammar of a precedent graph — which *is* the product.

**Where it appears** (all in [`src/components/motif/`](src/components/motif/)):
| Surface | Component |
|---|---|
| Logo mark | the debossed "A" |
| Checkbox / selection | `Node` (filled square) |
| Loaders (replaces spinners) | `ConnectorLoader` — connector draws between two nodes, union blinks |
| Dividers / eyebrows | `AxisTick` — hairline + node + mono-caps label |
| Empty states | `NodeField` — sparse nodes + connectors, one signal union |
| Match strength | `MatchStamp` — filled/hollow node count + tier word + mono % |
| Canvas wires | `AnEdge` — step routing, union nub flashes signal on connect |
| Save/stamp | a node pressed into the board (deboss) + connector drawn |

---

## 9. Component usage — do / don't

- **Buttons:** one primary (Signal) per view, stamp-press on `:active`. Secondary = ink + emboss. Never a pill. Loading = `ConnectorLoader`.
- **Inputs / search:** debossed wells. Focus = deboss + 3px focus-ring + inset signal hairline. The search bar is one well; the Search button is the lone Signal.
- **Cards:** concrete-0, `--raised`, no blur. Selected = 2px signal ring. Title display, metadata mono.
- **Match indicator:** always `MatchStamp` — redundant encoding (count + word + %), never a color-only dot.
- **Status (toast / data-quality / errors):** glyph/shape + word, never color alone. Errors are honest — never render fabricated/mock results on failure; show a broken-connector panel + Retry.
- **Nav:** one persistent app shell (Search · Boards · Canvas · Account); active = mono-caps ink + signal underline.
- **Canvas nodes:** debossed seat + embossed die; type signaled by mono-caps label + debossed category glyph + geometry — **never by fill color**. Generate is the only signal-bearing node.

---

## 10. Accessibility floors

- `--ink-900` on `--concrete-50` ≈ **15:1**; `--ink-500` on `--concrete-50` ≈ **4.7:1** (body-secondary OK); `--signal` on white ≈ **6:1** (AA text + non-text). Never put `--ink-400`/`--ink-300` on body text (labels/disabled only).
- Every status **redundantly encoded** — word + glyph/shape/position, never color alone (WCAG 1.4.1).
- Focus ring (`0 0 0 3px var(--focus-ring)`) is never removed without replacement.
- `prefers-reduced-motion` drops connector draws and staggers; keep only opacity/state changes.
- Min hit area 40×40 (transparent padding on small icon-buttons).

---

*Concrete & Signal expresses "every building leaves a mark" by making the entire instrument matte, monochrome, and physically pressed — reserving a single International Klein Blue for the exact moments meaning appears. Swiss precision (Archivo + strict grid + small radii), Fuser materiality (the emboss/stamp + node-connector-union grammar), and Flora flow (generous space, humane body, settle-don't-slide motion), married into one system.*
