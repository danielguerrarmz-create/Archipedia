# Handoff — Rebrand batch 1: Auth + Contact pages

Date: 2026-06-16
Branch: main (working tree)
Spec: `docs/STYLE-GUIDE-SPLASH.md` ("Concrete & Signal")

## What

Rebranded three off-brand pages to the splash identity, using the marketing
shell adopted by the already-on-brand `HowItWorksPage` / `PrivacyPolicyPage` as
the template:

- `frontend/src/pages/ContactPage.tsx`
- `frontend/src/pages/SignInPage.tsx`
- `frontend/src/pages/SignUpPage.tsx`

All three previously used a bespoke glass header (`backdropFilter: blur(12px)` +
`rgba(255,255,255,0.95)` background) and accent-colored chrome
(`rgba(182,68,36,…)` boxes, `var(--accent)` icon/box/link). Those are gone.

### ContactPage (content / monograph recipe)
- Shell: `LandingTopBar` + `LandingFooter`, `--concrete-50` ground.
- Removed the glass header and the decorative accent-colored Mail icon box
  entirely.
- `.mono-caps` eyebrow ("STUDIO · CONTACT"), Fraunces section opener
  (`--font-editorial`) "Get in touch", lead in `--ink-500` at 17px, measure
  ≤66ch, hairline dividers (`--hairline`).
- Form fields are debossed wells: `--concrete-sunken` bg, `--hairline-strong`
  border, `box-shadow: var(--deboss)`. Focus darkens the border to `--ink-700`
  (neutral) — no blue ring. Labels are mono-caps (`--ink-700`).
- Submit is the lone `--signal` button (disabled → `--concrete-200` /
  `--ink-500`, per the FinalCTA disabled convention). ≥48px min-height.
- "Prefer email" alt-contact is now hairline-quiet text with the address in
  `--ink-900` (was an accent-blue link in a soft card).
- Name/Email collapse to one column under 560px via a scoped `<style>` block.
- Email corrected to `hello@archipedia.app` (was `…@archipedia.ai`; the rest of
  the app uses `archipedia.app`). Flagging in case `.ai` was intentional.

### SignInPage / SignUpPage (auth recipe, §8)
- Shell: `LandingTopBar` + `LandingFooter`, `--concrete-50` ground, Clerk widget
  centered in the viewport.
- Wordmark "archipedia" rendered above the card in `--ink-900` (never Signal),
  plus a mono-caps eyebrow ("SIGN IN" / "CREATE ACCOUNT").
- Clerk `appearance` themed to tokens: `card` = `--concrete-100` + `--raised`
  (the centered concrete card); inputs = `--concrete-sunken` + `--deboss` with
  neutral `--ink-700` focus border (no blue ring); `formButtonPrimary` =
  `--signal` (hover `--signal-hover`, focus = neutral `--focus-ring`); field
  labels mono-caps; social buttons flat concrete + `--emboss` (no glass);
  `footerActionLink` = `--ink-900` (was `--accent`).
- The "Authentication not configured" fallback was rebuilt as a centered
  `--raised` concrete card with an ink-900 wordmark, a debossed `<code>` chip,
  and a lone `--signal` "Return to search" button (was an
  `rgba(182,68,36,…)` accent barrier box).
- Auth logic untouched: `routing`/`path`/`signUpUrl`/`afterSignInUrl` props and
  `isAuthEnabled()` gate are unchanged.

## Why

The three pages violated the Concrete & Signal system: glassmorphism
(`backdrop-filter`) is explicitly banned (tokens.css glass kill-switch + guide
§6), and the burnt-orange `rgba(182,68,36)` accent + `var(--accent)` (which now
aliases to Signal blue) created decorative non-functional accent color, breaking
the "one Signal per view, zero decorative blue" rule (guide §5).

## Verify

- `cd frontend && npx vite build` → clean (built in ~12s; only the pre-existing
  >500kB chunk-size advisory, no errors). SWC, no standalone tsc.
- Grep of the three files: zero `backdrop-filter`/`blur`/glass; zero
  `var(--accent)` / `rgba(182,68,36…)`; zero legacy `--font-primary` /
  `--font-secondary` / `--bg-primary`. The only "blur" string is a code comment.
- Dev server on :5173 (already running) — visually check:
  - /contact, /signin, /signup all show the dark `LandingTopBar` + dark
    `LandingFooter` sandwich on a `--concrete-50` body.
  - Form fields read as pressed wells; focusing one darkens its border with no
    blue ring; the only blue is the submit / Clerk primary button.

## Left / unsure (for reviewer)

- **Clerk `appearance` with CSS `var(--…)`:** Clerk's `variables` block and
  element styles accept CSS strings, so `var(--signal)` etc. should resolve at
  render. It builds fine, but this needs a live Clerk-enabled env (a real
  `VITE_CLERK_PUBLISHABLE_KEY`) to confirm the themed widget renders as intended
  — I could only exercise the `!isAuthEnabled()` fallback path locally. If any
  token doesn't take inside Clerk's shadow/styling, fall back to literal hex
  values pulled from tokens.css.
- **Contact email domain** changed `.ai` → `.app` for consistency; revert if the
  `.ai` address is real.
- **Contact form** is still the original simulated submit (1s `setTimeout` +
  toast) — unchanged; wire to a real endpoint separately.
- I did not touch `tokens.css`, the landing components, or any other page. No
  shared header component existed to delete — each page inlined its own glass
  header, which I replaced with `LandingTopBar`.

## Files

- `frontend/src/pages/ContactPage.tsx`
- `frontend/src/pages/SignInPage.tsx`
- `frontend/src/pages/SignUpPage.tsx`
- `docs/handoffs/2026-06-16-rebrand-batch1-auth-contact.md` (this file)

---

## Addendum (2026-06-16) — auth focus-ring bug fix + theme dedupe

**The bug (design-review finding).** Both auth pages passed a Clerk
`appearance.elements` object whose input focus used nested `'&:focus'` keys.
Clerk's style-object API does NOT honor nested `'&:focus'`/`'&:hover'` keys, so
a focused field silently fell back to Clerk's DEFAULT focus ring — a box-shadow
derived from `colorPrimary` (= `--signal`), i.e. a **blue Klein ring on focus**,
reintroducing the exact decorative blue the rebrand removed
(STYLE-GUIDE-SPLASH §0.4, §5). The global `input:focus` neutralizer in
tokens.css did not catch it because Clerk draws its own high-specificity
`box-shadow` ring.

**Fix 1 — deduped theme.** The `clerkAppearance` object (previously duplicated
byte-for-byte in both pages) now lives once in
**`frontend/src/lib/clerkAppearance.ts`** and is imported by both pages. Future
fixes land once. The dead `'&:focus'`/`'&:hover'` nested keys were removed; all
working flat styles are unchanged (card `--concrete-100`+`--raised`, inputs
`--concrete-sunken`+`--deboss`, wordmark/headers `--ink-900`, social buttons
flat `--emboss`, primary `--signal`). `colorPrimary` stays `--signal` (the
button fill needs it). The object is typed structurally — I deliberately do NOT
import `Appearance` from `@clerk/types` because that package is not installed in
this tree (only a transitive type re-export of `@clerk/clerk-react`); the
project has no `tsconfig.json` and builds via `vite build` (SWC, no type-check),
so a dangling type import is a latent IDE/`tsc` break that I avoided.

**Fix 2 — robust neutral focus via real CSS.** Added a small **"CLERK" section
to `frontend/src/styles/tokens.css`** (right after the existing react-flow
theming — same pattern: theming a third-party lib via its stable light-DOM `cl-`
classes; tokens.css is imported LAST in `main.tsx` so it wins the cascade). Key
rules:
- `.cl-formFieldInput:focus, :focus-visible { outline:none; border-color:var(--ink-700); box-shadow:var(--deboss); }` — all `!important`. Focus now = darken own border, debossed well, NO ring.
- `:-webkit-autofill` pinned back to the debossed concrete well + ink-900 text (autofill otherwise repaints/re-rings the field).
- `.cl-formButtonPrimary:focus-visible { box-shadow:0 0 0 2px var(--focus-ring); }` — keyboard focus on the lone Signal button uses **neutral ink**, never a Signal glow.

I chose tokens.css over a separate `clerkAppearance.css` because (a) it already
houses third-party (react-flow) theming, so a Clerk section is consistent and
in-scope, and (b) it is imported last and globally, guaranteeing both auth pages
get it with no extra import wiring. Rationale is documented in a comment in both
the CSS block and the shared module.

**Why a focused Clerk input now cannot show a blue ring (specificity reasoning).**
Clerk injects its own focus rule **without** `!important`. CSS resolves
`!important` declarations ahead of all non-`!important` ones regardless of
selector specificity or source order, so our `!important` box-shadow/border on
`.cl-formFieldInput:focus` wins unconditionally over Clerk's `colorPrimary`-
derived ring. (Even absent `!important`, tokens.css loads last, so source order
would still favor it.) The only blue path was that default ring; it is now
overridden to `--deboss` + `--ink-700` border with no ring.

**Build.** `cd frontend && npx vite build` → clean (2562 modules, built in
~8.5s; only the pre-existing chunk-size advisory). Verified the rules survive
into the production CSS bundle (`cl-formFieldInput:focus{…!important}` present).

**Honest verification caveat.** The Clerk widget only renders with a live
`VITE_CLERK_PUBLISHABLE_KEY`, which I do not have locally (only the
`!isAuthEnabled()` fallback path renders), so final *visual* confirmation is
pending a Clerk-enabled env. The CSS override is written to be correct
regardless of render state — it targets Clerk v5's documented stable `cl-`
classes and wins on `!important` + load order.

**Files (this addendum):**
- `frontend/src/lib/clerkAppearance.ts` (new — shared appearance object)
- `frontend/src/styles/tokens.css` (additive "CLERK" section only)
- `frontend/src/pages/SignInPage.tsx` (import shared theme; removed inline dup)
- `frontend/src/pages/SignUpPage.tsx` (import shared theme; removed inline dup)
