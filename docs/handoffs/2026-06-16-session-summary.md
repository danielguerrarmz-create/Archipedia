# Handoff — Session summary (2026-06-16)

Branch: `rebrand/concrete-and-signal` → pushed to fork `danielguerrarmz-create/Archipedia`.
This rolls up a full working session. Per-task handoffs in this folder carry the detail;
this is the index + state-of-play.

## What

Three streams of work landed this session:

**1. Splash deliverables (5).**
- **Backend revived** — `navigator` FastAPI on :8000; text + image search verified end-to-end
  through the :5173 Vite proxy. Corpus is **669 indexed projects** (the earlier 13,411 was the
  image-vector count). See `2026-06-16-backend-revive.md`.
- **ProofStrip** — corrected the headline number to 669; later restructured to a compact band of
  three **centered** statistics (the pinned evidence card + prose were removed for height; the
  provenance line moved to the footer).
- **Mobile hero** (`EclecticHero`) — single 768px breakpoint seam; static 2-card pinned pair on
  phones; ≥44px touch targets; hero now fills the viewport (`calc(100svh - 60px)`) so the stat
  bar no longer peeks under it on tall displays.
- **Drag-and-drop search well** (`FinalCTA`) — dropping an image runs a real image search via a
  transient `lib/pendingImageSearch.ts` singleton into the working `ClassicSearchPage` flow; the
  image button now opens a native picker (was routing to a dead page). See
  `2026-06-16-search-well-dragdrop.md`.
- **Polish + a11y sweep** — contrast, focus rings (neutral ink), drop-rejection `aria-live`,
  landmark labels, decorative pins `aria-hidden`; the "tape" detail was dropped. See
  `2026-06-16-polish-a11y-sweep.md`.

**2. Splash visual edits (screenshot-driven).**
- Compose vignette: renamed "UNTITLED BOARD" → "PRECEDENT STUDY — 01"; rebuilt the geometry so the
  three precedents no longer overlap and **fan cleanly into one signal-accented Generate button**
  (matches the real app's Generate node); fixed a latent framer-motion `transform`-vs-`y` centering bug.
- Removed the stray `IntroConnector` tick on narrative 01 (`reveal: "plain"`).
- **Pushpin** redesigned — more 3D/prominent (cast + contact shadow, layered glass speculars,
  brushed-steel shaft), colourless; added a deterministic optional `seed` prop; threaded distinct
  seeds into every pin cluster so the wall reads hand-tacked, not stamped.
- **`heroPrecedents`** replaced with **real, image-verified, in-corpus** projects by major
  contemporary firms (SANAA, Zaha Hadid, Herzog & de Meuron, Renzo Piano, MAD, Sou Fujimoto,
  Adjaye, RSHP, Perkins&Will, Grant Associates, etc.) spanning architecture / landscape / urbanism.
  NOTE: the corpus is a recent ArchDaily *article* index, so literal icons (Bilbao, Heydar Aliyev,
  the High Line, Gardens by the Bay) are NOT present as records — substitutes are genuine corpus
  hits with verified images (kept the "a real result, not a render" promise honest).

**3. Brand rebrand — document the splash, apply to every page.**
- **`docs/STYLE-GUIDE-SPLASH.md`** — canonical "as-built" splash style guide (companion to
  `frontend/BRAND.md` + `tokens.css`). Reviewed by an agent role-playing the user; corrected on
  load-bearing facts (hero is a custom light gradient, NOT `--concrete-50`; hero headline is
  Archivo + one Fraunces swell, not full serif; dark studio ground frames BOTH the sticky top bar
  and footer; lead body is `--ink-500`; `AtmosphereMarquee` is a sanctioned motion exception;
  `Header` vs `LandingTopBar` are different components). Includes a per-page application checklist
  and a 0–3 review rubric.
- **Page audit** of all 25 pages → grouped by shell/off-brand pattern. Rollout = shared-components-
  first, batch-by-batch, each batch reviewed by an agent acting as the user against the rubric.
- **Batch 1 — Contact, SignIn, SignUp (3/3, shipped).** Glass-blur headers → shared
  `LandingTopBar` + `LandingFooter`; killed accent boxes; debossed wells, neutral focus, lone
  Signal submit. Review caught two real issues, both fixed: Contact faked "message sent" → now an
  honest `mailto:` submit; the Clerk auth focus ring was dead config falling back to a blue ring →
  re-implemented neutral via a shared `lib/clerkAppearance.ts` + a Clerk CSS section in `tokens.css`.
  See `2026-06-16-rebrand-batch1-auth-contact.md`.
- **Batch 2 — LandingPage (`/enterprise`) + DemoPage (`/demo`) — implemented + self-reviewed;
  INDEPENDENT review in flight at push time.** All glassmorphism (`glass`/`glass-hover`/
  `backdrop-filter`) removed → deboss/emboss/raised + hairlines; shared shell; Fraunces openers;
  one Signal CTA per view; mono stats. See `2026-06-16-rebrand-batch2-glass.md`.

## Why
Daniel asked to (a) ship the 5 splash deliverables, (b) apply the specific screenshot edits and
make precedents famous/real, and (c) document the splash brand and roll it out to every page with
an agent-as-user review loop. "Concrete & Signal" rules enforced throughout: one functional Signal
blue, zero decorative blue, neutral-ink focus, emboss/deboss materiality, real cited precedents.

## Verify
- `cd frontend && npx vite build` → clean (only the pre-existing >500 kB chunk advisory).
- Frontend dev: `cd frontend && npm run dev` (:5173). Backend (for live search) must be run from a
  real terminal so it isn't reaped: `cd navigator && .\scripts\run_backend.ps1` (:8000).
- Splash `/`: pin-up hero fills the viewport; stats centered; precedents are famous real projects;
  compose board has no overlap and a proper Generate button; pins vary and read 3D.
- Rebranded pages: `/contact`, `/signin`, `/enterprise`, `/demo` — no glass, no decorative blue,
  shared dark top-bar + footer, neutral focus.

## Left / open
- **Batch 2 independent review** was still running at push time — reconcile its findings, then it
  closes at 3/3.
- **Remaining live pages to rebrand:** the shared search/result-card → pinned grammar; the
  minimal-header search pages (`/empty`, `/search/image`, `/search/text`); mixed/partial
  (`ProjectDetailPage`, `EnterprisePage` at `/enterprise-details`, `BoardSharePage`).
- **Dead code (excluded):** `Homepage.tsx`, `SignUpPage.tsx` (unreachable — see routing bug),
  `BoardCanvasPage`, `BoardCanvasPrint`. Print sheets + anonymous study pages intentionally left
  off-brand.
- **Routing bug:** `/signup` renders `SearchLandingPage`, not `SignUpPage` — sign-up is unreachable.
  Awaiting a decision to fix the route.
- **Content decisions for Daniel:** email domain is inconsistent app-wide (`@archipedia.ai` vs
  `.app`); whether to add real cited precedent imagery to `/enterprise` for pin-up recognizability;
  Clerk-themed auth needs a live `VITE_CLERK_PUBLISHABLE_KEY` for final visual confirmation.

## Files (high level)
- New: `docs/STYLE-GUIDE-SPLASH.md`, `frontend/src/lib/clerkAppearance.ts`,
  `frontend/src/lib/pendingImageSearch.ts`, `docs/handoffs/2026-06-16-*.md`.
- Changed: `frontend/src/components/landing/*` (Pushpin, PinnedCard, EclecticHero, ProofStrip,
  FinalCTA, ComposeCanvasVignette, narrativeVisuals, LandingFooter), `frontend/src/data/heroPrecedents.ts`,
  `frontend/src/pages/*` (SearchLandingPage, ClassicSearchPage, ContactPage, SignInPage, SignUpPage,
  LandingPage, DemoPage), `frontend/src/styles/tokens.css`.
