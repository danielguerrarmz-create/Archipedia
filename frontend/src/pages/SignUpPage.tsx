/**
 * SignUpPage — Auth recipe on the "Concrete & Signal" system.
 * Marketing shell (LandingTopBar + LandingFooter), --concrete-50 ground, a
 * centered concrete card (--raised) holding the Clerk widget themed to the
 * tokens: mono-caps labels, debossed fields with neutral ink-border focus, a
 * lone --signal primary action, the wordmark in --ink-900 (never Signal), and
 * no social-glass buttons. Auth logic is untouched — only the shell is styled.
 *
 * Route: /signup
 */
import React from 'react';
import { useLocation } from 'wouter';
import { SignUp } from '@clerk/clerk-react';
import { LandingTopBar } from '../components/landing/LandingTopBar';
import { LandingFooter } from '../components/landing/LandingFooter';
import { isAuthEnabled } from '../lib/auth';
import { clerkAppearance } from '../lib/clerkAppearance';

// ─── Shared style constants ─────────────────────────────────────────────────

const PAGE: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: 'var(--concrete-50)',
  fontFamily: 'var(--font-body)',
  display: 'flex',
  flexDirection: 'column',
};

const MAIN: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'clamp(40px, 8vw, 80px) clamp(20px, 5vw, 40px)',
};

const WORDMARK: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: 20,
  letterSpacing: '-0.02em',
  color: 'var(--ink-900)', // never Signal
  textTransform: 'lowercase' as const,
  marginBottom: 24,
  textAlign: 'center' as const,
};

const EYEBROW: React.CSSProperties = {
  display: 'block',
  textAlign: 'center' as const,
  marginBottom: 24,
  color: 'var(--ink-700)',
};

// Clerk appearance (Concrete & Signal theme) is shared with SignInPage and the
// neutral-focus CSS lives in tokens.css — see src/lib/clerkAppearance.ts.

export function SignUpPage() {
  const [, setLocation] = useLocation();

  // If Clerk is not configured, show a placeholder card on the same shell.
  if (!isAuthEnabled()) {
    return (
      <div style={PAGE}>
        <LandingTopBar />
        <main style={MAIN}>
          <div style={{ maxWidth: 400, width: '100%' }}>
            <div style={WORDMARK}>archipedia</div>
            <div
              style={{
                padding: 32,
                background: 'var(--concrete-100)',
                boxShadow: 'var(--raised)',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
              }}
            >
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontWeight: 600,
                  marginTop: 0,
                  marginBottom: 12,
                  color: 'var(--ink-900)',
                }}
              >
                Authentication not configured
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: 'var(--ink-500)',
                  marginBottom: 24,
                }}
              >
                Set{' '}
                <code
                  className="mono"
                  style={{
                    background: 'var(--concrete-sunken)',
                    boxShadow: 'var(--deboss)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                    color: 'var(--ink-700)',
                  }}
                >
                  VITE_CLERK_PUBLISHABLE_KEY
                </code>{' '}
                in your environment to enable sign-up.
              </p>
              <button
                onClick={() => setLocation('/')}
                style={{
                  minHeight: 44,
                  padding: '12px 24px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 15,
                  fontWeight: 600,
                  backgroundColor: 'var(--signal)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'background-color var(--dur-1) var(--ease-press)',
                }}
              >
                Return to search
              </button>
            </div>
          </div>
        </main>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div style={PAGE}>
      <LandingTopBar />
      <main style={MAIN}>
        <div style={{ maxWidth: 400, width: '100%' }}>
          <div style={WORDMARK}>archipedia</div>
          <span className="mono-caps" style={EYEBROW}>
            Create account
          </span>
          <SignUp
            routing="path"
            path="/signup"
            signInUrl="/signin"
            afterSignUpUrl="/"
            appearance={clerkAppearance}
          />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

export default SignUpPage;
