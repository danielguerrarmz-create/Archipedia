/**
 * PrivacyPolicyPage — Archipedia privacy policy.
 * Pure presentational; no new dependencies.
 * Uses brand tokens from tokens.css (Concrete & Signal system).
 *
 * Route: /privacy
 * Last updated: 2026-06-14
 */
import { LandingTopBar } from "../components/landing/LandingTopBar";
import { LandingFooter } from "../components/landing/LandingFooter";

// ─── Shared style constants ─────────────────────────────────────────────────

const PAGE: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "var(--concrete-50)",
  fontFamily: "var(--font-body)",
};

const TOPBAR: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  background: "var(--studio-ground-solid)",
  borderBottom: "1px solid var(--studio-line)",
};

const TOPBAR_INNER: React.CSSProperties = {
  maxWidth: "var(--container-max)",
  margin: "0 auto",
  padding: "0 clamp(20px, 5vw, 48px)",
  height: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const WORDMARK: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 18,
  letterSpacing: "0.06em",
  color: "var(--studio-ink)",
  padding: 0,
};

const BACK_BTN: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "var(--font-body)",
  fontSize: 13,
  color: "var(--studio-stone)",
  padding: 0,
  letterSpacing: "0.03em",
};

const CONTAINER: React.CSSProperties = {
  maxWidth: 760,
  margin: "0 auto",
  padding: "clamp(48px, 8vw, 96px) clamp(20px, 5vw, 40px) clamp(64px, 10vw, 120px)",
};

const H1: React.CSSProperties = {
  fontFamily: "var(--font-editorial)",
  fontWeight: 400,
  fontSize: "clamp(32px, 5vw, 52px)",
  lineHeight: 1.15,
  color: "var(--ink-900)",
  marginBottom: 16,
  marginTop: 0,
};

const META: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "var(--ink-400)",
  marginBottom: 48,
};

const INTRO: React.CSSProperties = {
  fontSize: 17,
  lineHeight: 1.7,
  color: "var(--ink-700)",
  marginBottom: 40,
  maxWidth: "68ch",
};

const DISCLAIMER_BOX: React.CSSProperties = {
  border: "1px solid var(--hairline-strong)",
  borderRadius: "var(--radius-md)",
  padding: "16px 20px",
  background: "var(--concrete-100)",
  fontSize: 13,
  lineHeight: 1.6,
  color: "var(--ink-500)",
  marginBottom: 56,
};

const SECTION: React.CSSProperties = {
  marginBottom: 48,
};

const H2: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 14,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "var(--ink-900)",
  marginBottom: 14,
  marginTop: 0,
};

const P: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.7,
  color: "var(--ink-700)",
  marginBottom: 14,
  marginTop: 0,
  maxWidth: "72ch",
};

const UL: React.CSSProperties = {
  margin: "0 0 14px 0",
  padding: "0 0 0 20px",
  maxWidth: "70ch",
};

const LI: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.7,
  color: "var(--ink-700)",
  marginBottom: 6,
};

const TABLE: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: 14,
  marginBottom: 14,
};

const TH: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "var(--ink-400)",
  textAlign: "left" as const,
  padding: "8px 12px",
  borderBottom: "1px solid var(--hairline-strong)",
  fontWeight: 500,
};

const TD: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid var(--hairline)",
  verticalAlign: "top" as const,
  color: "var(--ink-700)",
  lineHeight: 1.55,
};

const TD_LABEL: React.CSSProperties = {
  ...TD,
  fontFamily: "var(--font-display)",
  fontWeight: 500,
  fontSize: 13,
  color: "var(--ink-900)",
  whiteSpace: "nowrap" as const,
};

const HAIRLINE: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid var(--hairline)",
  margin: "48px 0",
};

const CONTACT_LINK: React.CSSProperties = {
  color: "var(--signal)",
  textDecoration: "none",
};

// ─── Component ───────────────────────────────────────────────────────────────

export function PrivacyPolicyPage() {
  return (
    <div style={PAGE}>
      {/* The ONE canonical site header — consistent on every page */}
      <LandingTopBar />

      {/* Body */}
      <main style={CONTAINER}>
        <h1 style={H1}>Privacy Policy</h1>
        <p style={META}>Last updated: 2026-06-14</p>

        <p style={INTRO}>
          Archipedia is an architectural precedent search engine. This policy
          explains what information we collect when you use the service, how we
          use it, and your rights around it.
        </p>

        {/* Disclaimer */}
        <div style={DISCLAIMER_BOX}>
          <strong style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--ink-700)" }}>
            Notice
          </strong>
          {" "}This document is for informational purposes only and does not
          constitute legal advice. If you have specific legal questions about data
          privacy, please consult a qualified attorney.
        </div>

        {/* 1 — What we collect */}
        <section style={SECTION}>
          <h2 style={H2}>1. What We Collect</h2>

          <p style={P}><strong>Account information (Clerk)</strong></p>
          <p style={{ ...P, marginTop: -6 }}>
            Archipedia uses Clerk for user authentication. If you create an
            account or sign in, Clerk collects your email address, name, and
            authentication credentials on our behalf. Authentication is currently
            optional; unauthenticated use of the search interface is permitted.
            See Clerk's own privacy policy for full details of what Clerk stores.
          </p>

          <p style={P}><strong>Search queries</strong></p>
          <p style={{ ...P, marginTop: -6 }}>
            When you run a text search, your query string is transmitted to our
            FastAPI backend (/search/text) and used to retrieve results from our
            vector index. We may log queries server-side for performance
            monitoring and index improvement. Queries are not linked to your
            identity unless you are signed in.
          </p>

          <p style={P}><strong>Uploaded reference images</strong></p>
          <p style={{ ...P, marginTop: -6 }}>
            When you upload a reference image (for visual similarity search or
            hybrid search), the image is transmitted as a multipart form upload
            to our backend (/search/file, /search/hybrid, /search/multi-image).
            The backend converts the image to an embedding vector for the
            similarity search. We do not permanently store your uploaded images;
            they are processed in memory for the duration of the request and
            discarded. We may retain the derived embedding vector for a short
            period for debugging and latency measurement, not for identification.
          </p>

          <p style={P}><strong>Canvas and board content</strong></p>
          <p style={{ ...P, marginTop: -6 }}>
            If you build a board or canvas, the board layout, node positions,
            text annotations, and selected project references are stored in your
            browser (local storage or session state) and, where applicable, on
            our backend to enable sharing and PDF export. Shared boards are
            accessible to anyone with the share link.
          </p>

          <p style={P}><strong>Usage analytics (PostHog)</strong></p>
          <p style={{ ...P, marginTop: -6 }}>
            We use PostHog to collect product analytics. PostHog automatically
            captures page views, page-leave events, and session recordings. We
            also capture named events including:
          </p>
          <ul style={UL}>
            <li style={LI}>Landing-page interactions: demo clicks, pilot-booking clicks, Calendly link clicks, contact form submissions, video plays.</li>
            <li style={LI}>Enterprise-funnel events: demo booking, access requests, one-pager downloads.</li>
            <li style={LI}>User identification: if you are signed in, your Clerk user ID may be passed to PostHog to associate events with your account across sessions.</li>
          </ul>
          <p style={{ ...P }}>
            PostHog respects the browser Do Not Track (DNT) signal. Analytics
            are initialized only when a valid PostHog API key is configured in
            the deployment environment; they may not run in all environments.
            PostHog data is stored on PostHog's US-region infrastructure
            (us.i.posthog.com).
          </p>

          <p style={P}><strong>Cookies and local storage</strong></p>
          <p style={{ ...P, marginTop: -6 }}>
            PostHog uses localStorage (key prefix <code>ph_</code>) for
            anonymous device identification and session stitching. Clerk sets
            session cookies for authentication. We do not use advertising
            cookies or third-party tracking pixels beyond the sub-processors
            listed below.
          </p>

          <p style={P}><strong>Technical metadata</strong></p>
          <p style={{ ...P, marginTop: -6 }}>
            Standard server logs may include your IP address, browser user-agent,
            referring URL, and response times. These are used for security
            monitoring and infrastructure capacity planning and are rotated on a
            short schedule.
          </p>
        </section>

        <hr style={HAIRLINE} />

        {/* 2 — How we use it */}
        <section style={SECTION}>
          <h2 style={H2}>2. How We Use Your Information</h2>
          <ul style={UL}>
            <li style={LI}><strong>Providing the service</strong> — processing search queries, returning similar-project results, generating embedding vectors from uploaded images, and serving board/canvas content.</li>
            <li style={LI}><strong>Authentication</strong> — verifying identity when you sign in, gating features where access controls are enabled.</li>
            <li style={LI}><strong>Product improvement</strong> — understanding which search modes and features are used, diagnosing latency or error patterns, improving the vector index and relevance models.</li>
            <li style={LI}><strong>Communication</strong> — responding to support requests or demo inquiries submitted via the contact form.</li>
            <li style={LI}><strong>Security</strong> — detecting and blocking abuse, rate-limit violations, and unauthorized access.</li>
          </ul>
          <p style={P}>
            We do not sell your personal data. We do not use your data to train
            machine learning models on an individual basis. We do not share
            search queries or uploaded images with third parties for advertising.
          </p>
        </section>

        <hr style={HAIRLINE} />

        {/* 3 — Third parties */}
        <section style={SECTION}>
          <h2 style={H2}>3. Sub-Processors and Third Parties</h2>
          <p style={P}>
            We rely on the following third-party services ("sub-processors") to
            operate Archipedia. Each is bound by its own privacy and data-security
            obligations.
          </p>

          <table style={TABLE}>
            <thead>
              <tr>
                <th style={TH}>Provider</th>
                <th style={TH}>Purpose</th>
                <th style={TH}>Data involved</th>
                <th style={TH}>Privacy policy</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={TD_LABEL}>Clerk</td>
                <td style={TD}>User authentication and identity management</td>
                <td style={TD}>Email, name, session tokens</td>
                <td style={TD}>
                  <a href="https://clerk.com/privacy" style={CONTACT_LINK} target="_blank" rel="noopener noreferrer">clerk.com/privacy</a>
                </td>
              </tr>
              <tr>
                <td style={TD_LABEL}>PostHog</td>
                <td style={TD}>Product analytics, event tracking, session recording</td>
                <td style={TD}>Anonymous device ID, page views, named events, optional user ID</td>
                <td style={TD}>
                  <a href="https://posthog.com/privacy" style={CONTACT_LINK} target="_blank" rel="noopener noreferrer">posthog.com/privacy</a>
                </td>
              </tr>
              <tr>
                <td style={TD_LABEL}>Cloudflare R2</td>
                <td style={TD}>Image CDN — serving indexed project photographs via pub-*.r2.dev</td>
                <td style={TD}>No personal data; R2 serves static image files from our bucket</td>
                <td style={TD}>
                  <a href="https://www.cloudflare.com/privacypolicy/" style={CONTACT_LINK} target="_blank" rel="noopener noreferrer">cloudflare.com/privacypolicy</a>
                </td>
              </tr>
              <tr>
                <td style={TD_LABEL}>Google Gemini API</td>
                <td style={TD}>AI-assisted concept generation and image understanding (where enabled)</td>
                <td style={TD}>Text prompts or image data submitted to generation features</td>
                <td style={TD}>
                  <a href="https://policies.google.com/privacy" style={CONTACT_LINK} target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <hr style={HAIRLINE} />

        {/* 4 — Indexed images */}
        <section style={SECTION}>
          <h2 style={H2}>4. Indexed Architectural Images and Project Rights</h2>
          <p style={P}>
            Archipedia's database contains images of real built projects sourced
            from publicly available architectural publications and archives. These
            images are indexed for visual similarity search and are served from
            our Cloudflare R2 bucket. Each project record includes attribution
            metadata — architect name, project title, country, and typology —
            which is displayed in the search interface.
          </p>
          <p style={P}>
            We do not claim ownership of indexed project images. Copyright
            remains with the respective architects, photographers, or publishers.
            If you are a rights holder and believe your work has been indexed
            without authorization, please contact us at{" "}
            <a href="mailto:privacy@archipedia.app" style={CONTACT_LINK}>
              privacy@archipedia.app
            </a>{" "}
            and we will review and address your request promptly.
          </p>
          <p style={P}>
            Images you upload as reference queries are not added to the
            searchable index and are not displayed to other users.
          </p>
        </section>

        <hr style={HAIRLINE} />

        {/* 5 — Data retention */}
        <section style={SECTION}>
          <h2 style={H2}>5. Data Retention</h2>
          <ul style={UL}>
            <li style={LI}><strong>Uploaded query images</strong> — not retained beyond the immediate request. Embedding vectors derived from uploads may be cached briefly for debugging; we do not associate them with your identity.</li>
            <li style={LI}><strong>Account data</strong> — retained for as long as your Clerk account is active. Deleting your Clerk account removes it from Clerk's systems per their policy.</li>
            <li style={LI}><strong>Board and canvas data</strong> — retained until you delete the board or your account. Anonymously created boards accessible via share link are retained until the link is invalidated.</li>
            <li style={LI}><strong>Analytics data</strong> — PostHog event data is retained per PostHog's default retention settings. You may request deletion via PostHog's data-deletion tools or by contacting us.</li>
            <li style={LI}><strong>Server logs</strong> — rotated on a short cycle (typically 30–90 days). Logs are not used for user profiling.</li>
          </ul>
        </section>

        <hr style={HAIRLINE} />

        {/* 6 — Your rights */}
        <section style={SECTION}>
          <h2 style={H2}>6. Your Rights</h2>
          <p style={P}>
            Depending on your jurisdiction, you may have the right to:
          </p>
          <ul style={UL}>
            <li style={LI}><strong>Access</strong> the personal data we hold about you.</li>
            <li style={LI}><strong>Correct</strong> inaccurate personal data.</li>
            <li style={LI}><strong>Delete</strong> your personal data ("right to erasure").</li>
            <li style={LI}><strong>Restrict or object to</strong> certain processing activities.</li>
            <li style={LI}><strong>Data portability</strong> — receive your data in a structured, machine-readable format where applicable.</li>
            <li style={LI}><strong>Withdraw consent</strong> at any time where processing is based on consent (e.g., session recording).</li>
          </ul>
          <p style={P}>
            To exercise any of these rights, email{" "}
            <a href="mailto:privacy@archipedia.app" style={CONTACT_LINK}>
              privacy@archipedia.app
            </a>
            . We will respond within 30 days. Some rights are subject to
            applicable law and to verification of your identity.
          </p>
        </section>

        <hr style={HAIRLINE} />

        {/* 7 — Cookies */}
        <section style={SECTION}>
          <h2 style={H2}>7. Cookies and Local Storage</h2>
          <p style={P}>
            We use the following storage mechanisms:
          </p>
          <ul style={UL}>
            <li style={LI}><strong>Authentication cookies (Clerk)</strong> — session cookies required to keep you signed in. Strictly necessary; cannot be opted out while using authenticated features.</li>
            <li style={LI}><strong>Analytics localStorage (PostHog)</strong> — used to identify your device across page loads for session stitching and funnel analytics. You can clear this at any time via your browser's developer tools, or by enabling the Do Not Track browser setting, which PostHog respects.</li>
            <li style={LI}><strong>Application state (localStorage/sessionStorage)</strong> — board layout, canvas node positions, and recent search state may be stored in your browser to persist your work. This data never leaves your device except when explicitly saved to our backend.</li>
          </ul>
          <p style={P}>
            We do not use advertising cookies, social-media tracking pixels, or
            cross-site tracking of any kind.
          </p>
        </section>

        <hr style={HAIRLINE} />

        {/* 8 — Children */}
        <section style={SECTION}>
          <h2 style={H2}>8. Children</h2>
          <p style={P}>
            Archipedia is not directed at children under 13 (or under 16 in the
            European Economic Area). We do not knowingly collect personal data
            from children. If you believe a child has provided us with personal
            data, please contact us and we will delete it.
          </p>
        </section>

        <hr style={HAIRLINE} />

        {/* 9 — International transfers */}
        <section style={SECTION}>
          <h2 style={H2}>9. International Data Transfers</h2>
          <p style={P}>
            Archipedia's infrastructure is operated primarily in the United
            States. By using the service, you acknowledge that your data may be
            transferred to and processed in the United States and in other
            countries where our sub-processors operate. Where required by
            applicable law, we rely on appropriate transfer mechanisms (such as
            Standard Contractual Clauses for transfers from the European Economic
            Area) as implemented by our sub-processors. Refer to each
            sub-processor's privacy policy for details.
          </p>
        </section>

        <hr style={HAIRLINE} />

        {/* 10 — Changes */}
        <section style={SECTION}>
          <h2 style={H2}>10. Changes to This Policy</h2>
          <p style={P}>
            We may update this policy periodically. The "Last updated" date at
            the top of this page reflects the most recent revision. For material
            changes, we will provide notice via in-app messaging or email (where
            we have your address) before the change takes effect. Continued use
            of Archipedia after a policy update constitutes acceptance of the
            revised terms.
          </p>
        </section>

        <hr style={HAIRLINE} />

        {/* 11 — Contact */}
        <section style={SECTION}>
          <h2 style={H2}>11. Contact</h2>
          <p style={P}>
            For privacy questions, data requests, or copyright takedown notices,
            contact us at:
          </p>
          <p style={{ ...P, fontFamily: "var(--font-display)", fontWeight: 500, color: "var(--ink-900)" }}>
            <a href="mailto:privacy@archipedia.app" style={CONTACT_LINK}>
              privacy@archipedia.app
            </a>
          </p>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

export default PrivacyPolicyPage;
