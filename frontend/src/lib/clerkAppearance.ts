/**
 * clerkAppearance — single source of truth for the Clerk widget's "Concrete &
 * Signal" theme, shared by SignInPage and SignUpPage so any future fix lands
 * once (this object was previously duplicated byte-for-byte across both pages).
 *
 * What it does:
 * - debossed fields (`--concrete-sunken` + `--deboss`) with NEUTRAL ink-border
 *   focus and NO blue ring (see the focus note below)
 * - lone `--signal` primary action; everything else flat concrete
 * - mono-caps field labels; wordmark/headers in ink (never Signal)
 * - flat-concrete social buttons (`--emboss`), no glass
 *
 * ── FOCUS / "no decorative blue" (STYLE-GUIDE-SPLASH §0.4, §5) ───────────────
 * Clerk's `appearance.elements` style-object API does NOT reliably honor nested
 * `'&:focus'` / `'&:hover'` keys, so a focused input would fall back to Clerk's
 * DEFAULT focus ring — a box-shadow derived from `colorPrimary` (= `--signal`),
 * i.e. a blue Klein ring. We keep `colorPrimary: var(--signal)` because the
 * primary button fill needs it, and instead neutralize the input ring with a
 * REAL CSS rule (with `!important`) targeting Clerk's stable light-DOM
 * `.cl-formFieldInput` class. That rule lives in the "CLERK" section of
 * `src/styles/tokens.css` (alongside the existing react-flow theming) so it
 * loads globally and last — see that file. Hence: NO `'&:focus'`/`'&:hover'`
 * keys in this object (they are dead in Clerk's API and were removed).
 */
import type React from 'react';
/**
 * Local structural type for the Clerk `appearance` prop. We intentionally do
 * NOT import `Appearance` from `@clerk/types` — that package is not installed in
 * this tree (it is only a transitive type re-export of `@clerk/clerk-react`),
 * so importing it would dangle. This loose shape is all the prop needs: Clerk
 * accepts a plain `{ variables, elements }` object.
 */
type ClerkAppearance = {
  variables?: Record<string, string>;
  elements?: Record<string, React.CSSProperties>;
};

export const clerkAppearance: ClerkAppearance = {
  variables: {
    colorPrimary: 'var(--signal)', // primary button fill ONLY; input ring is neutralized in tokens.css
    colorText: 'var(--ink-900)',
    colorTextSecondary: 'var(--ink-500)',
    colorBackground: 'var(--concrete-100)',
    colorInputBackground: 'var(--concrete-sunken)',
    colorInputText: 'var(--ink-900)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-body)',
  },
  elements: {
    rootBox: { width: '100%', maxWidth: '400px' },
    // The card IS the centered concrete --raised surface
    card: {
      background: 'var(--concrete-100)',
      boxShadow: 'var(--raised)',
      borderRadius: 'var(--radius-lg)',
    },
    headerTitle: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      color: 'var(--ink-900)',
    },
    headerSubtitle: {
      fontFamily: 'var(--font-body)',
      color: 'var(--ink-500)',
    },
    formFieldLabel: {
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      fontWeight: 500,
      letterSpacing: '0.14em',
      textTransform: 'uppercase' as const,
      color: 'var(--ink-700)',
    },
    // Flat focus styles only. The neutral ink-border focus state is applied via
    // a real `.cl-formFieldInput:focus` rule in tokens.css (nested '&:focus'
    // here is not honored by Clerk and would leave the default blue ring).
    formFieldInput: {
      fontFamily: 'var(--font-body)',
      background: 'var(--concrete-sunken)',
      border: '1px solid var(--hairline-strong)',
      boxShadow: 'var(--deboss)',
      color: 'var(--ink-900)',
    },
    // The lone Signal action. Its hover/focus states are also handled by real
    // CSS rules in tokens.css (focus uses neutral --focus-ring, not Signal).
    formButtonPrimary: {
      backgroundColor: 'var(--signal)',
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      textTransform: 'none' as const,
      borderRadius: 'var(--radius-md)',
      boxShadow: 'none',
    },
    // Neutral social buttons — flat concrete, no glass
    socialButtonsBlockButton: {
      background: 'var(--concrete-100)',
      border: '1px solid var(--hairline-strong)',
      boxShadow: 'var(--emboss)',
      color: 'var(--ink-900)',
      borderRadius: 'var(--radius-md)',
    },
    dividerText: {
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      letterSpacing: '0.14em',
      textTransform: 'uppercase' as const,
      color: 'var(--ink-500)',
    },
    footerActionLink: {
      color: 'var(--ink-900)',
      fontFamily: 'var(--font-body)',
      fontWeight: 500,
    },
  },
};

export default clerkAppearance;
