/**
 * ContactPage — monograph content page on the "Concrete & Signal" system.
 * Marketing shell (LandingTopBar + LandingFooter), --concrete-50 ground,
 * Fraunces section opener, mono-caps eyebrow, hairline dividers, debossed
 * form wells with neutral ink-border focus, and a lone --signal submit.
 *
 * Route: /contact
 */
import React, { useState } from 'react';
import { toast } from 'sonner';
import { LandingTopBar } from '../components/landing/LandingTopBar';
import { LandingFooter } from '../components/landing/LandingFooter';

// ─── Shared style constants ─────────────────────────────────────────────────

const PAGE: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: 'var(--concrete-50)',
  fontFamily: 'var(--font-body)',
};

const CONTAINER: React.CSSProperties = {
  maxWidth: 640,
  margin: '0 auto',
  padding: 'clamp(48px, 8vw, 96px) clamp(20px, 5vw, 40px) clamp(64px, 10vw, 120px)',
};

const EYEBROW: React.CSSProperties = {
  display: 'block',
  marginBottom: 16,
  color: 'var(--ink-700)',
};

const H1: React.CSSProperties = {
  fontFamily: 'var(--font-editorial)',
  fontWeight: 400,
  fontSize: 'clamp(32px, 5vw, 52px)',
  lineHeight: 1.15,
  color: 'var(--ink-900)',
  marginBottom: 16,
  marginTop: 0,
};

const INTRO: React.CSSProperties = {
  fontSize: 17,
  lineHeight: 1.7,
  color: 'var(--ink-500)',
  marginBottom: 40,
  maxWidth: '66ch',
  marginTop: 0,
};

const HAIRLINE: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid var(--hairline)',
  margin: '40px 0',
};

const LABEL: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  marginBottom: 8,
  color: 'var(--ink-700)',
};

// Debossed well: inset trough, neutral border. Focus darkens the border only.
const FIELD: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  color: 'var(--ink-900)',
  background: 'var(--concrete-sunken)',
  border: '1px solid var(--hairline-strong)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--deboss)',
  outline: 'none',
  transition: 'border-color var(--dur-1) var(--ease-press)',
};

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);

    // Honest submission: open the user's mail client with the message
    // pre-filled (same pattern as LandingPage). No backend yet — so we never
    // claim a message was "sent" when it wasn't (brand integrity rule).
    const subject = encodeURIComponent(
      formData.subject.trim() || `Contact from ${formData.name.trim() || 'Archipedia'}`,
    );
    const body = encodeURIComponent(
      `${formData.message.trim()}\n\n— ${formData.name.trim()}${
        formData.email.trim() ? ` (${formData.email.trim()})` : ''
      }`,
    );
    window.location.href = `mailto:hello@archipedia.ai?subject=${subject}&body=${body}`;
    toast('Opening your email app…');
    setIsSubmitting(false);
  };

  // neutral ink-border focus — no blue ring (handled inline so the well
  // border darkens rather than drawing a Signal rectangle)
  const onFieldFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--ink-700)';
  };
  const onFieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--hairline-strong)';
  };

  return (
    <div className="contact-page" style={PAGE}>
      {/* Placeholders sit at --ink-400 (the sanctioned placeholder tone), above
          the default UA grey which falls below the contrast floor. */}
      <style>{`
        .contact-page input::placeholder,
        .contact-page textarea::placeholder { color: var(--ink-400); opacity: 1; }
      `}</style>
      <LandingTopBar />

      <main style={CONTAINER}>
        <span className="mono-caps" style={EYEBROW}>
          Studio · Contact
        </span>
        <h1 style={H1}>Get in touch</h1>
        <p style={INTRO}>
          Questions about the index, feedback on a search, or a request for a
          pilot — we read every message. Tell us what you're working on and we'll
          reply directly.
        </p>

        <hr style={HAIRLINE} />

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: 20 }}>
            <div className="contact-row" style={{ display: 'grid', gap: 16 }}>
              <div>
                <label htmlFor="name" style={LABEL}>
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  style={FIELD}
                  onFocus={onFieldFocus}
                  onBlur={onFieldBlur}
                />
              </div>

              <div>
                <label htmlFor="email" style={LABEL}>
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  style={FIELD}
                  onFocus={onFieldFocus}
                  onBlur={onFieldBlur}
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" style={LABEL}>
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="How can we help?"
                style={FIELD}
                onFocus={onFieldFocus}
                onBlur={onFieldBlur}
              />
            </div>

            <div>
              <label htmlFor="message" style={LABEL}>
                Message *
              </label>
              <textarea
                id="message"
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us what you're working on…"
                style={{
                  ...FIELD,
                  resize: 'vertical',
                  minHeight: 132,
                  lineHeight: 1.6,
                }}
                onFocus={onFieldFocus}
                onBlur={onFieldBlur}
              />
            </div>

            {/* The lone Signal control on the page */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                minHeight: 48,
                padding: '14px 24px',
                fontFamily: 'var(--font-body)',
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: '0.01em',
                backgroundColor: isSubmitting ? 'var(--concrete-200)' : 'var(--signal)',
                color: isSubmitting ? 'var(--ink-500)' : '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background-color var(--dur-1) var(--ease-press)',
              }}
            >
              {isSubmitting ? 'Sending…' : 'Send message'}
            </button>
          </div>
        </form>

        <hr style={HAIRLINE} />

        {/* Alternative contact — hairline-quiet, no card glow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="mono-caps" style={{ color: 'var(--ink-700)' }}>
            Prefer email
          </span>
          <a
            href="mailto:hello@archipedia.ai"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              fontWeight: 500,
              color: 'var(--ink-900)',
              textDecoration: 'none',
              width: 'fit-content',
            }}
          >
            hello@archipedia.ai
          </a>
        </div>
      </main>

      <LandingFooter />

      <style>{`
        @media (min-width: 560px) {
          .contact-row { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default ContactPage;
