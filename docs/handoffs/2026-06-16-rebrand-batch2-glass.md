# Handoff — Rebrand Batch 2: Kill glassmorphism on LandingPage + DemoPage

Date: 2026-06-16
Branch: main (no commit made — left for review)
Scope: Two LIVE glassmorphism pages brought to "Concrete & Signal" splash identity.

## What

Rebranded the two remaining glassmorphism marketing pages per
`docs/STYLE-GUIDE-SPLASH.md`, calibrated against the on-brand
`HowItWorksPage` / `PrivacyPolicyPage` (content pattern) and the
`SearchLandingPage` + `components/landing/*` gold standard.

Edited ONLY:
- `frontend/src/pages/LandingPage.tsx` (the LIVE `/enterprise` page)
- `frontend/src/pages/DemoPage.tsx` (the LIVE `/demo` page)

No tokens.css, landing components, or other pages touched. `Homepage.tsx`
untouched (dead).

## Why

Both pages were heavy glassmorphism (`glass` / `glass-hover` classes,
`backdrop-filter: blur()`), used legacy `--text-*` / `--border-light` /
`--bg-primary` vars, decorative `var(--accent)` (which aliases to Signal blue),
pill radii (`borderRadius: 10–12px` + `rounded-full` circles), system-font
display type, and bespoke fixed blurred chrome — none of which match the splash.
The `.glass`/`.glass-hover` CLASSES are not auto-neutralized by the tokens.css
kill-switch (only `.blur` + inline `backdrop-filter` are), so they had to be
removed in markup.

## LandingPage.tsx (`/enterprise`) — changes

- **Shell swap:** removed `AnnouncementBar` + custom fixed-blur `LandingHeader`;
  replaced with shared `<LandingTopBar />` (dark studio nav) + `<LandingFooter />`
  (dark studio footer) — the intentional dark→light→dark sandwich, exactly as
  HowItWorks/Privacy. Dropped the announcement-dismiss state + `headerOffset`
  padding logic (the sticky top bar handles its own offset). The old custom dark
  contact-band footer + bespoke `<footer>` (with "Pear.Design" credit + Demo /
  Enterprise / Security links) are gone — `LandingFooter` already carries the
  Studio column (Enterprise, Contact, How it works, Privacy, Sign in) and the
  Pear Design credit, so no content was lost.
- **Glass removal:** every `glass` / `glass-hover` removed. Cards → `--concrete-100`
  + `--raised` + 1px `--hairline`. Step-number chips + the video frame → debossed
  wells (`--concrete-sunken` + `--deboss`). Alternating bands → `--concrete-100`
  with hairline edges (was `rgba(0,0,0,0.02/0.03)`).
- **Ground:** `--concrete-50` content background (was `--bg-primary`).
- **Type:** hero headline = Archivo display 680 + ONE Fraunces `.editorial-em`
  swell on the word "own" (per §0 delta 6 — NOT a full serif line). Section
  openers = Fraunces roman ~420. Eyebrows = mono-caps. Body = Hanken, lead
  `--ink-500` / emphasis `--ink-900` / small meta `--ink-400/700`. Step numbers
  are mono + `tabular-nums`.
- **Signal discipline:** exactly one functional blue per band — the hero primary
  "Try the demo" CTA, and the contact-form `Send` submit (shared `Button` default
  variant = Signal). All other CTAs (Book pilot, repeated Try-demo, Read security
  notes, Email, Book a pilot) are neutral emboss/ghost/text-link — zero decorative
  blue. Removed `hover:text-[var(--accent)]`.
- **Focus / radii:** neutral ink `--focus-ring` on all controls; no blue ring.
  No pills — all `--radius-md/sm`. Hit areas ≥44–48px.
- **Form:** dropped the dark-overlay inline field styling; now uses the shared
  `Input` / `Textarea` (native debossed light wells, ink-border focus). The
  `<select>` restyled to match the debossed well. Honest success state preserved
  ("Got it — we'll reply within 24 hours"); mailto fallback logic unchanged.
- **Copy/structure:** all 12 sections preserved (Hero, Social proof, Demo, How it
  works, Features, Use cases, Enterprise, Enterprise-CTA card, Security, About,
  Contact). Minor punctuation only (em-dashes, "neighbours", removed UPPERCASE
  shouting on subheads — caps now reserved for mono labels per §4).

## DemoPage.tsx (`/demo`) — changes

- **Shell swap:** removed the custom fixed `backdrop-filter: blur(12px)` header
  and the bespoke `<footer>`; replaced with `<LandingTopBar />` + `<LandingFooter />`.
- **Glass removal:** `glass rounded-2xl` / `glass rounded-xl` video + feature
  cards removed. Video → debossed concrete well (`--concrete-sunken` + `--deboss`).
  Feature cards → `--concrete-100` + `--raised` + hairline, with mono tabular-nums
  index (01/02/03).
- **Ground / type / Signal:** `--concrete-50` ground; Fraunces H1 (`.display-editorial`
  scale); mono eyebrow; ONE Signal CTA ("Try the live demo"); "Book an enterprise
  pilot" is neutral. The big circular `rounded-full` play button → a squared
  emboss play tile with mono caption.
- **Voice:** lead now says "real, cited precedents, not a render" (provenance
  promise from §1). Play button has an `aria-label`; decorative icons `aria-hidden`.

## Glass removal confirmation

Grep of both files for `glass | backdrop-filter | backdropFilter | rounded-full
| var(--accent) | var(--text-*) | var(--border-light) | var(--bg-primary) |
999px | blur(`:
- LandingPage.tsx: ONLY the doc-comment word "glassmorphism" matches.
- DemoPage.tsx: ONLY two doc-comment matches ("glassmorphism", "not a glass card").
- Zero style/class occurrences remain in either file.

## Shared components stopped using (NOT deleted)

`LandingHeader` and `AnnouncementBar` are now used ONLY by... nothing
(grep confirmed they were imported ONLY by LandingPage.tsx before this change).
Per instructions they were left in the repo (not deleted) — a follow-up cleanup
could remove `frontend/src/components/LandingHeader.tsx` and
`frontend/src/components/AnnouncementBar.tsx` if confirmed dead. Their imports
are removed from LandingPage.

## Build result

`cd frontend && npx vite build` → ✓ built in 9.58s, clean. (The pre-existing
">500 kB chunk" warning is unrelated to this change — single-bundle app.)
Re-verified clean after the review-round-2 fixes below (✓ 12.95s).

## Review round 2 — must-fixes applied (2026-06-16)

A user-review pass (role-playing the skeptical designer) found real defects. All
must-fixes are now applied; build re-verified clean:

1. **DemoPage hero typography (§0.6 violation).** The H1 was full Fraunces
   (`--font-editorial`, weight 400) — the exact trap §0.6 forbids for hero lines.
   Re-set to Archivo display weight 680 with ONE `.editorial-em` Fraunces swell on
   "action", matching LandingPage's hero. DemoPage now has zero full-serif hero.
2. **Missing keyboard focus rings on primary CTAs.**
   - DemoPage: `.signal-btn` and `.ghost-btn` had `:hover` but no `:focus-visible`.
     Their inline `boxShadow` overrode the global focus ring → invisible keyboard
     focus on both main actions. Added `:focus-visible` rings.
   - LandingPage contact "Send": uses the shared `Button`, whose inline `boxShadow`
     in `combinedStyle` always beats the stylesheet `:focus-visible` (root cause in
     `button.tsx` — out of edit scope). Wrapped the Button in a `.send-field` span
     with a `:focus-within` neutral ring so keyboard users get visible focus
     without touching the shared component.
3. **<14px labels below the contrast floor (§2).** Promoted from `--ink-400` /
   `--ink-500` to `--ink-700`:
   - LandingPage: `SectionLabel` eyebrow, hero "Private by default…" sub-caption,
     credibility-strip labels (was `--ink-500` at 11.5px), contact "Response time…".
   - DemoPage: "What you'll see" divider label, feature index numbers.
   (Remaining `--ink-400` occurrences are 4–6px decorative `aria-hidden`
   bullet/marker squares — not text — and are left as-is.)

Not changed (reviewer agreed these are not ship blockers):
- **PinnedCard motif.** Reviewer accepted n/a on `/demo` (precedents live inside
  the video) and flagged `/enterprise` as the page's recognizability soft spot —
  but adding a pinned precedent means introducing new content (out of scope).
  Logged as the top next-iteration item.
- **Two Signal CTAs across the LandingPage scroll** (hero + contact Send) —
  reviewer confirmed they are never co-visible and scored Signal discipline 3/3.

## Uncertain / for the reviewer

1. **Signal count across one scroll view.** The guide says "one Signal-meaning
   per view." LandingPage is one long scroll with two genuinely functional
   actions far apart: the hero primary "Try the demo" and the contact "Send"
   submit. I treated them as two separate bands (like the splash's hero well vs.
   FinalCTA well), so two Signal elements exist on the full page but never
   simultaneously in one viewport. If the reviewer wants strictly one blue on the
   whole page, demote the hero CTA to neutral and keep only the contact Send (or
   vice-versa).
2. **No PinnedCard usage.** Neither page renders project/precedent imagery — the
   only image is the demo video (a product artifact, not a precedent). Per §3
   ("only project imagery uses PinnedCard"), I did not force a pin-up grid. If the
   reviewer wants the pin-up motif represented for brand recognition, a sample
   `PinnedCard` precedent row could be added to LandingPage's Features/About band
   — but that would introduce new content, which was out of scope ("preserve
   content").
3. **Loom autoplay param.** DemoPage's Loom embed previously had `?autoplay=1`;
   kept as-is. The gdrive path is the active one (loomId is empty).
4. **Dead `LandingHeader` / `AnnouncementBar`** — see above; left for a separate
   cleanup PR.
