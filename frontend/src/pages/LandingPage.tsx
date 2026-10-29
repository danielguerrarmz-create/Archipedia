/**
 * LandingPage — the LIVE /enterprise marketing page.
 *
 * Concrete & Signal identity: concrete-50 ground, shared LandingTopBar +
 * LandingFooter chrome (the dark→light→dark sandwich), Fraunces section openers,
 * mono eyebrows + tabular-nums numbers, hairline dividers, and exactly one
 * functional Signal blue per band (hero primary CTA; the contact-form submit).
 * No glassmorphism, no pills, neutral ink focus. Content/copy preserved.
 *
 * Route: /enterprise
 */
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Image, Search, Filter, LayoutGrid, Folder, Shield, Play } from "lucide-react";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { LandingTopBar } from "../components/landing/LandingTopBar";
import { LandingFooter } from "../components/landing/LandingFooter";
import { usePageMeta } from "../lib/seo";
import { trackLandingEvent } from "../lib/analytics";

// Placeholder constants - replace with real values
const CALENDLY_URL = "https://calendly.com/clayhseifert/30min";
// Video configuration - supports Google Drive or Loom
const VIDEO_CONFIG = {
  type: "gdrive" as "gdrive" | "loom",
  gdriveId: "1Jq-DgxztZ5Yg3vQ18_c7g-rhhrxI-GsQ",
  loomId: "",
};
const FORMSPREE_ID = "xwveeqoq";

// ─── Shared style constants ─────────────────────────────────────────────────

const PAGE: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "var(--concrete-50)",
  fontFamily: "var(--font-body)",
};

const SECTION_PAD: React.CSSProperties = {
  paddingTop: "clamp(64px, 11vh, 112px)",
  paddingBottom: "clamp(64px, 11vh, 112px)",
};

const CONTAINER: React.CSSProperties = {
  maxWidth: "var(--container-max)",
  margin: "0 auto",
  paddingLeft: "clamp(20px, 5vw, 48px)",
  paddingRight: "clamp(20px, 5vw, 48px)",
};

// Alternating band on concrete-100 with hairline edges.
const BAND: React.CSSProperties = {
  ...SECTION_PAD,
  background: "var(--concrete-100)",
  borderTop: "1px solid var(--hairline)",
  borderBottom: "1px solid var(--hairline)",
};

const EYEBROW: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  color: "var(--ink-700)",
  display: "block",
};

// Fraunces section opener (roman, ~420).
const SECTION_TITLE: React.CSSProperties = {
  fontFamily: "var(--font-editorial)",
  fontWeight: 420,
  fontSize: "clamp(27px, 4vw, 42px)",
  lineHeight: 1.1,
  letterSpacing: "-0.015em",
  color: "var(--ink-900)",
  margin: "12px 0 0",
};

const LEAD: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 17,
  lineHeight: 1.6,
  color: "var(--ink-500)",
};

const BODY: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 15,
  lineHeight: 1.65,
  color: "var(--ink-700)",
};

const CARD: React.CSSProperties = {
  border: "1px solid var(--hairline)",
  borderRadius: "var(--radius-md)",
  background: "var(--concrete-100)",
  boxShadow: "var(--raised)",
  padding: 32,
};

const CARD_TITLE: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 18,
  letterSpacing: "-0.01em",
  color: "var(--ink-900)",
  margin: "0 0 10px",
};

// Lone Signal control — hero primary CTA.
const SIGNAL_BTN: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  minHeight: 48,
  padding: "0 24px",
  fontFamily: "var(--font-body)",
  fontSize: 15,
  fontWeight: 600,
  color: "#fff",
  background: "var(--signal)",
  border: "none",
  borderRadius: "var(--radius-md)",
  boxShadow: "0 0 0 1px rgba(31,63,255,0.35), 0 4px 14px -6px rgba(31,63,255,0.5)",
  cursor: "pointer",
  transition: "background var(--dur-2) var(--ease-press)",
};

// Neutral secondary / tactile emboss button.
const GHOST_BTN: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  minHeight: 48,
  padding: "0 24px",
  fontFamily: "var(--font-body)",
  fontSize: 15,
  fontWeight: 500,
  color: "var(--ink-900)",
  background: "var(--concrete-100)",
  border: "1px solid var(--hairline-strong)",
  borderRadius: "var(--radius-md)",
  boxShadow: "var(--emboss)",
  cursor: "pointer",
  transition: "background var(--dur-1) var(--ease-press), border-color var(--dur-1) var(--ease-press)",
};

// Quiet text link (no blue at rest).
const TEXT_LINK: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  minHeight: 44,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  fontWeight: 500,
  color: "var(--ink-500)",
  transition: "color var(--dur-1) var(--ease-press)",
};

// Mono eyebrow + hairline rule.
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 36 }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--ink-700)",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
      <span style={{ flex: 1, height: 1, background: "var(--hairline)" }} aria-hidden="true" />
    </div>
  );
}

export function LandingPage() {
  const [, setLocation] = useLocation();
  const [loomLoaded, setLoomLoaded] = useState(false);
  const loomRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formState, setFormState] = useState({
    name: "",
    firm: "",
    email: "",
    archiveSize: "<5k images",
    notes: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  usePageMeta({
    title: "Archipedia — Search your firm's archive like Google",
    description: "Image + text precedent search for architectural archives. Private enterprise pilots available.",
  });

  // Lazy load Loom when in viewport
  useEffect(() => {
    if (!loomRef.current || loomLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoomLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loomRef.current);
    return () => observer.disconnect();
  }, [loomLoaded]);

  const scrollToContact = () => {
    trackLandingEvent("book_pilot_click", { location: "header" });
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTryDemo = () => {
    trackLandingEvent("try_demo_click", { location: "hero" });
    setLocation("/demo");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    trackLandingEvent("contact_form_submit", {});

    try {
      if (!FORMSPREE_ID) {
        // Fallback: open mailto if Formspree not configured
        const subject = encodeURIComponent("Archipedia pilot inquiry");
        const body = encodeURIComponent(
          `Name: ${formState.name}\nFirm: ${formState.firm}\nEmail: ${formState.email}\nArchive Size: ${formState.archiveSize}\n\nNotes:\n${formState.notes}`
        );
        window.location.href = `mailto:hello@archipedia.ai?subject=${subject}&body=${body}`;
        setFormSubmitting(false);
        return;
      }

      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formState.name,
          firm: formState.firm,
          email: formState.email,
          archiveSize: formState.archiveSize,
          notes: formState.notes,
          _subject: `Archipedia inquiry from ${formState.firm || formState.name || "website"}`,
        }),
      });

      if (response.ok) {
        setFormSubmitted(true);
      } else {
        throw new Error("Form submission failed");
      }
    } catch (error) {
      // Fallback to mailto on error
      const subject = encodeURIComponent("Archipedia pilot inquiry");
      const body = encodeURIComponent(
        `Name: ${formState.name}\nFirm: ${formState.firm}\nEmail: ${formState.email}\nArchive Size: ${formState.archiveSize}\n\nNotes:\n${formState.notes}`
      );
      window.location.href = `mailto:hello@archipedia.ai?subject=${subject}&body=${body}`;
    } finally {
      setFormSubmitting(false);
    }
  };

  const fieldLabel: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "var(--ink-500)",
    display: "block",
    marginBottom: 8,
  };

  return (
    <div style={PAGE}>
      <LandingTopBar />

      <main>
        {/* C. Hero Section */}
        <section id="product" style={SECTION_PAD}>
          <div style={CONTAINER}>
            <div style={{ maxWidth: "44ch" }}>
              <span style={EYEBROW}>Enterprise · Private precedent search</span>

              {/* Hero line = Archivo display + ONE Fraunces swell (not full serif) */}
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 680,
                  fontSize: "clamp(34px, 5.2vw, 52px)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.025em",
                  color: "var(--ink-900)",
                  margin: "16px 0 0",
                  maxWidth: "18ch",
                }}
              >
                Search architecture like Google — on your firm's{" "}
                <span className="editorial-em" style={{ fontFamily: "var(--font-editorial)" }}>
                  own
                </span>{" "}
                archive.
              </h1>

              <p style={{ ...LEAD, marginTop: 20, maxWidth: "48ch" }}>
                Find the right precedents in seconds using image or text, then organize results
                into boards you can actually use in concept design.
              </p>

              <ul style={{ marginTop: 24, display: "grid", gap: 12, listStyle: "none", padding: 0 }}>
                {[
                  "Stop re-searching old projects buried in folders",
                  "Ramp new team members faster with searchable institutional memory",
                  "Stay consistent under deadline with evidence-backed references",
                ].map((line) => (
                  <li
                    key={line}
                    style={{
                      ...BODY,
                      color: "var(--ink-900)",
                      display: "grid",
                      gridTemplateColumns: "auto 1fr",
                      gap: 12,
                      alignItems: "start",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{ width: 6, height: 6, marginTop: 9, background: "var(--ink-400)" }}
                    />
                    {line}
                  </li>
                ))}
              </ul>

              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginTop: 32 }}>
                {/* The ONE Signal control on this view */}
                <button className="signal-btn" onClick={handleTryDemo} style={SIGNAL_BTN}>
                  Try the demo
                  <ArrowRight size={16} strokeWidth={2} />
                </button>
                <button className="ghost-btn" onClick={scrollToContact} style={GHOST_BTN}>
                  Book an enterprise pilot
                </button>
              </div>

              <p style={{ ...EYEBROW, color: "var(--ink-700)", marginTop: 18 }}>
                Private by default · Your data stays yours
              </p>
            </div>
          </div>
        </section>

        {/* D. Social Proof / Credibility Strip */}
        <section style={{ background: "var(--concrete-100)", borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)", padding: "20px 0" }}>
          <div
            style={{
              ...CONTAINER,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
            }}
          >
            {[
              "Built by an architecture + ML team at UT Austin and Georgia Tech",
              "Designed for firm archives",
              "Pilot-ready deployment",
            ].map((label, i) => (
              <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 24 }}>
                {i > 0 && (
                  <span aria-hidden="true" style={{ width: 4, height: 4, background: "var(--ink-400)" }} />
                )}
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11.5,
                    letterSpacing: "0.06em",
                    color: "var(--ink-700)",
                  }}
                >
                  {label}
                </span>
              </span>
            ))}
          </div>
        </section>

        {/* E. 90-Second Demo Section */}
        <section id="demo" style={SECTION_PAD}>
          <div style={CONTAINER}>
            <SectionLabel>Walkthrough</SectionLabel>
            <h2 style={{ ...SECTION_TITLE, marginTop: 0, marginBottom: 40 }}>See it in 90 seconds</h2>

            <div className="demo-split">
              {/* Left: Video well */}
              <div
                ref={loomRef}
                style={{
                  position: "relative",
                  aspectRatio: "16 / 9",
                  overflow: "hidden",
                  background: "var(--concrete-sunken)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--deboss)",
                }}
              >
                {loomLoaded && (VIDEO_CONFIG.gdriveId || VIDEO_CONFIG.loomId) ? (
                  VIDEO_CONFIG.type === "gdrive" && VIDEO_CONFIG.gdriveId ? (
                    <iframe
                      src={`https://drive.google.com/file/d/${VIDEO_CONFIG.gdriveId}/preview`}
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay"
                      style={{ width: "100%", height: "100%", border: "none" }}
                      title="Archipedia demo walkthrough"
                    />
                  ) : (
                    <iframe
                      src={`https://www.loom.com/embed/${VIDEO_CONFIG.loomId}`}
                      frameBorder="0"
                      allowFullScreen
                      style={{ width: "100%", height: "100%", border: "none" }}
                      title="Archipedia demo walkthrough"
                    />
                  )
                ) : (
                  <button
                    className="demo-play"
                    onClick={() => setLoomLoaded(true)}
                    aria-label="Load the demo video"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 16,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 56,
                        height: 56,
                        background: "var(--concrete-100)",
                        borderRadius: "var(--radius-md)",
                        boxShadow: "var(--emboss)",
                        color: "var(--ink-900)",
                      }}
                    >
                      <Play size={22} strokeWidth={1.75} />
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--ink-700)",
                      }}
                    >
                      Click to load video
                    </span>
                  </button>
                )}
              </div>

              {/* Right: What you'll notice */}
              <div>
                <span style={EYEBROW}>What you'll notice</span>
                <ul style={{ marginTop: 24, display: "grid", gap: 16, listStyle: "none", padding: 0 }}>
                  {[
                    ["Search by image", "(upload or URL) to find visual neighbours"],
                    ["Narrow results", "with typology / region / tags"],
                    ["Open project cards", "and save to boards for a concept narrative"],
                  ].map(([strong, rest]) => (
                    <li key={strong} style={{ ...BODY }}>
                      <strong style={{ color: "var(--ink-900)", fontWeight: 600 }}>{strong}</strong> {rest}
                    </li>
                  ))}
                </ul>

                <button
                  className="ghost-btn"
                  onClick={handleTryDemo}
                  style={{ ...GHOST_BTN, marginTop: 32 }}
                >
                  Try the demo
                  <ArrowRight size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* F. How It Works */}
        <section style={BAND}>
          <div style={CONTAINER}>
            <SectionLabel>Process</SectionLabel>
            <h2 style={{ ...SECTION_TITLE, marginTop: 0, marginBottom: 40 }}>How it works</h2>

            <div className="grid-3">
              {[
                { step: "1", title: "Ingest", desc: "Point Archipedia at a folder of images + a metadata CSV." },
                { step: "2", title: "Search", desc: "Query by image or text, then refine with filters." },
                { step: "3", title: "Curate", desc: "Turn results into boards you can share with your team." },
              ].map((item) => (
                <div key={item.step} style={CARD}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 40,
                      height: 40,
                      marginBottom: 20,
                      background: "var(--concrete-sunken)",
                      boxShadow: "var(--deboss)",
                      borderRadius: "var(--radius-sm)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 16,
                      fontVariantNumeric: "tabular-nums",
                      color: "var(--ink-900)",
                    }}
                  >
                    {item.step}
                  </span>
                  <h3 style={CARD_TITLE}>{item.title}</h3>
                  <p style={{ ...BODY }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* G. Feature Grid */}
        <section style={SECTION_PAD}>
          <div style={CONTAINER}>
            <SectionLabel>Capabilities</SectionLabel>
            <h2 style={{ ...SECTION_TITLE, marginTop: 0, marginBottom: 40 }}>Features</h2>

            <div className="grid-3">
              {[
                { icon: Image, title: "Image search", desc: "Drop an image, find near matches instantly." },
                { icon: Search, title: "Text search", desc: "Describe what you want; discover relevant precedents." },
                { icon: Filter, title: "Metadata filters", desc: "Typology, region, year, materials, tags." },
                { icon: LayoutGrid, title: "Project cards", desc: "Structured views: key images, notes, attributes." },
                { icon: Folder, title: "Boards", desc: "Collect results into concept sets and share." },
                { icon: Shield, title: "Enterprise-ready", desc: "Private deployment with clear data boundaries." },
              ].map((feature) => (
                <div key={feature.title} style={CARD}>
                  <feature.icon size={24} strokeWidth={1.75} style={{ marginBottom: 16, color: "var(--ink-700)" }} />
                  <h3 style={CARD_TITLE}>{feature.title}</h3>
                  <p style={{ ...BODY }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* H. Use Cases */}
        <section style={BAND}>
          <div style={CONTAINER}>
            <SectionLabel>Audience</SectionLabel>
            <h2 style={{ ...SECTION_TITLE, marginTop: 0, marginBottom: 40 }}>Who it's for</h2>

            <div className="grid-3">
              {[
                { title: "Design teams", desc: "Find precedents faster; stop reinventing the wheel." },
                { title: "R&D / Design Tech", desc: "Make firm knowledge queryable; prototype new workflows." },
                { title: "Fabrication-forward teams", desc: "Bridge precedent → constraints → buildable options." },
              ].map((useCase) => (
                <div key={useCase.title} style={CARD}>
                  <h3 style={CARD_TITLE}>{useCase.title}</h3>
                  <p style={{ ...BODY }}>{useCase.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* I. Enterprise Section */}
        <section id="enterprise" style={SECTION_PAD}>
          <div style={CONTAINER}>
            <SectionLabel>Deployment</SectionLabel>
            <h2 style={{ ...SECTION_TITLE, marginTop: 0, marginBottom: 12 }}>Deploy privately on your archive</h2>
            <p style={{ ...LEAD, marginBottom: 40 }}>Single-tenant pilots available.</p>

            <div className="grid-3">
              {[
                { title: "Private index", desc: "Your content is not used to train public models." },
                { title: "Simple intake", desc: "Images + metadata CSV (we help you map it)." },
                { title: "Fast pilot", desc: "Start with one office / one typology / one archive slice." },
              ].map((item) => (
                <div key={item.title} style={CARD}>
                  <h3 style={CARD_TITLE}>{item.title}</h3>
                  <p style={{ ...BODY }}>{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Enterprise CTA Card */}
            <div style={{ ...CARD, padding: 40, marginTop: 32 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 24,
                }}
                className="enterprise-cta-row"
              >
                <div>
                  <h3 style={{ ...CARD_TITLE, fontSize: 22, marginBottom: 8 }}>Ready to pilot?</h3>
                  <p style={{ ...LEAD }}>Let's talk about your archive and deployment needs.</p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
                  <button className="ghost-btn" onClick={scrollToContact} style={{ ...GHOST_BTN, whiteSpace: "nowrap" }}>
                    Book an enterprise pilot
                  </button>
                  <button
                    className="text-link"
                    onClick={() => document.querySelector("#security")?.scrollIntoView({ behavior: "smooth" })}
                    style={{ ...TEXT_LINK, whiteSpace: "nowrap" }}
                  >
                    Read security notes
                    <ArrowRight size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* J. Security / Data */}
        <section id="security" style={BAND}>
          <div style={CONTAINER}>
            <SectionLabel>Security</SectionLabel>
            <h2 style={{ ...SECTION_TITLE, marginTop: 0, marginBottom: 40 }}>Data &amp; privacy</h2>

            <div style={{ ...CARD, padding: 40 }}>
              <ul style={{ display: "grid", gap: 18, listStyle: "none", padding: 0, margin: 0, maxWidth: "70ch" }}>
                {[
                  "Uploaded files are used only to run your search request.",
                  "Enterprise archives are indexed in a private environment.",
                  "Access controls are enforced at the application layer.",
                  "Retention: configurable during pilots.",
                ].map((line) => (
                  <li
                    key={line}
                    style={{
                      ...BODY,
                      display: "grid",
                      gridTemplateColumns: "auto 1fr",
                      gap: 12,
                      alignItems: "start",
                    }}
                  >
                    <span aria-hidden="true" style={{ width: 6, height: 6, marginTop: 9, background: "var(--ink-400)" }} />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* K. About */}
        <section style={SECTION_PAD}>
          <div style={CONTAINER}>
            <div style={{ maxWidth: "68ch" }}>
              <SectionLabel>Mission</SectionLabel>
              <h2 style={{ ...SECTION_TITLE, marginTop: 0, marginBottom: 24 }}>Why we're building this</h2>
              <p style={{ ...BODY, fontSize: 17, lineHeight: 1.7, marginBottom: 16, color: "var(--ink-700)" }}>
                Architecture has incredible institutional knowledge — locked in folders and PDFs.
                We're turning that into something searchable, evidence-based, and eventually
                verifiable against constraints.
              </p>
              <p style={{ ...LEAD }}>
                We believe the best design decisions are informed by what's worked before. Our
                tools help teams find those precedents in seconds, not hours.
              </p>
            </div>
          </div>
        </section>

        {/* L. Contact */}
        <section id="contact" style={BAND}>
          <div style={CONTAINER}>
            <SectionLabel>Contact</SectionLabel>
            <h2 style={{ ...SECTION_TITLE, marginTop: 0, marginBottom: 40 }}>Talk to us</h2>

            <div className="contact-split">
              {/* Left: Buttons + Form */}
              <div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 32 }}>
                  <a
                    href={CALENDLY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackLandingEvent("calendly_click", {})}
                    className="ghost-btn"
                    style={{ ...GHOST_BTN, textDecoration: "none" }}
                  >
                    Book a pilot
                  </a>
                  <a
                    href="mailto:hello@archipedia.ai?subject=Archipedia%20pilot"
                    className="text-link"
                    style={{ ...TEXT_LINK, textDecoration: "none", paddingInline: 6 }}
                  >
                    Email
                    <ArrowRight size={14} strokeWidth={2} />
                  </a>
                </div>

                {formSubmitted ? (
                  <div
                    role="status"
                    style={{
                      border: "1px solid var(--hairline-strong)",
                      borderRadius: "var(--radius-md)",
                      background: "var(--concrete-100)",
                      boxShadow: "var(--raised)",
                      padding: 24,
                    }}
                  >
                    <p style={{ ...BODY, color: "var(--ink-900)", margin: 0 }}>
                      Got it — we'll reply within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit}>
                    <div className="field-grid-2">
                      <div>
                        <label htmlFor="name" style={fieldLabel}>Name</label>
                        <Input
                          id="name"
                          value={formState.name}
                          onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label htmlFor="firm" style={fieldLabel}>Firm</label>
                        <Input
                          id="firm"
                          value={formState.firm}
                          onChange={(e) => setFormState((s) => ({ ...s, firm: e.target.value }))}
                          placeholder="Your firm"
                        />
                      </div>
                    </div>

                    <div className="field-grid-2" style={{ marginTop: 16 }}>
                      <div>
                        <label htmlFor="email" style={fieldLabel}>Email *</label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formState.email}
                          onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                          placeholder="you@firm.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="archiveSize" style={fieldLabel}>Archive size</label>
                        <select
                          id="archiveSize"
                          value={formState.archiveSize}
                          onChange={(e) => setFormState((s) => ({ ...s, archiveSize: e.target.value }))}
                          style={{
                            display: "flex",
                            height: 40,
                            width: "100%",
                            borderRadius: "var(--radius-md)",
                            background: "var(--concrete-0)",
                            boxShadow: "var(--deboss)",
                            border: "none",
                            outline: "none",
                            padding: "0 12px",
                            fontFamily: "var(--font-body)",
                            fontSize: 14,
                            color: "var(--ink-900)",
                          }}
                        >
                          <option value="<5k images">&lt;5k images</option>
                          <option value="5-50k">5–50k</option>
                          <option value="50k+">50k+</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <label htmlFor="notes" style={fieldLabel}>Notes</label>
                      <Textarea
                        id="notes"
                        value={formState.notes}
                        onChange={(e) => setFormState((s) => ({ ...s, notes: e.target.value }))}
                        placeholder="What are you looking to index?"
                        style={{ minHeight: 100 }}
                      />
                    </div>

                    {/*
                      The contact band's lone functional Signal control. The
                      shared Button sets an inline boxShadow that overrides the
                      global :focus-visible ring, so a focus-within wrapper
                      supplies the visible neutral focus ring for keyboard users.
                    */}
                    <span className="send-field" style={{ display: "inline-block", marginTop: 24, borderRadius: "var(--radius-md)" }}>
                      <Button type="submit" size="lg" disabled={formSubmitting} loading={formSubmitting}>
                        {formSubmitting ? "Sending" : "Send"}
                      </Button>
                    </span>
                  </form>
                )}
              </div>

              {/* Right: Additional info */}
              <div>
                <p style={{ ...LEAD, marginBottom: 20, color: "var(--ink-700)" }}>
                  Whether you're a small studio or a large firm, we'd love to hear about your
                  archive and how we can help make it searchable.
                </p>
                <p style={{ ...EYEBROW, color: "var(--ink-700)" }}>
                  Response time · usually within 24 hours on business days
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />

      <style>{`
        .signal-btn:hover { background: var(--signal-hover); }
        .signal-btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--concrete-50), 0 0 0 4px var(--focus-ring);
        }
        .ghost-btn:hover { background: var(--concrete-200); border-color: var(--ink-700); }
        .ghost-btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--focus-ring);
        }
        .send-field:focus-within {
          outline: none;
          box-shadow: 0 0 0 2px var(--concrete-100), 0 0 0 4px var(--focus-ring);
        }
        .text-link:hover { color: var(--ink-900); }
        .text-link:focus-visible {
          outline: none;
          border-radius: var(--radius-sm);
          box-shadow: 0 0 0 2px var(--focus-ring);
        }
        .demo-play:hover span:first-of-type { background: var(--concrete-200); }
        .demo-play:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 2px var(--focus-ring);
        }
        .grid-3 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .demo-split, .contact-split {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          align-items: start;
        }
        .field-grid-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .grid-3 { grid-template-columns: repeat(3, 1fr); }
          .field-grid-2 { grid-template-columns: 1fr 1fr; }
          .enterprise-cta-row { flex-direction: row; align-items: center; justify-content: space-between; }
        }
        @media (min-width: 1024px) {
          .demo-split { grid-template-columns: 1fr 1fr; gap: 48px; }
          .contact-split { grid-template-columns: 1fr 1fr; gap: 48px; }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
