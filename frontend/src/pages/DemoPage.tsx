/**
 * DemoPage — the /demo walkthrough page.
 * Concrete & Signal identity: concrete-50 ground, shared LandingTopBar +
 * LandingFooter chrome, Fraunces section opener, mono eyebrows, one Signal CTA
 * (the primary "Try the live demo"). No glassmorphism, no pills, neutral focus.
 *
 * Route: /demo
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Play } from "lucide-react";
import { LandingTopBar } from "../components/landing/LandingTopBar";
import { LandingFooter } from "../components/landing/LandingFooter";
import { usePageMeta } from "../lib/seo";
import { trackLandingEvent } from "../lib/analytics";

// Video configuration - supports Google Drive or Loom
const VIDEO_CONFIG = {
  type: "gdrive" as "gdrive" | "loom",
  // Google Drive file ID (from share URL)
  gdriveId: "1Jq-DgxztZ5Yg3vQ18_c7g-rhhrxI-GsQ",
  // Loom video ID (optional, for when you record the Loom)
  loomId: "",
};
const CALENDLY_URL = "https://calendly.com/clayhseifert/30min";

// ─── Shared style constants ─────────────────────────────────────────────────

const PAGE: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "var(--concrete-50)",
  fontFamily: "var(--font-body)",
};

const CONTAINER: React.CSSProperties = {
  maxWidth: 960,
  margin: "0 auto",
  width: "100%",
  padding: "clamp(48px, 8vw, 96px) clamp(20px, 5vw, 40px) clamp(64px, 10vw, 120px)",
};

const EYEBROW: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  color: "var(--ink-700)",
  marginBottom: 16,
  display: "block",
};

// Hero line = Archivo display + ONE Fraunces swell (NOT full serif) per §0.6.
const H1: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 680,
  fontSize: "clamp(32px, 5vw, 52px)",
  lineHeight: 1.08,
  letterSpacing: "-0.025em",
  color: "var(--ink-900)",
  margin: "0 0 16px",
};

const LEAD: React.CSSProperties = {
  fontSize: 17,
  lineHeight: 1.6,
  color: "var(--ink-500)",
  maxWidth: "52ch",
  margin: "0 auto",
};

// Video well — a debossed concrete trough, not a glass card.
const VIDEO_WELL: React.CSSProperties = {
  position: "relative",
  aspectRatio: "16 / 9",
  overflow: "hidden",
  background: "var(--concrete-sunken)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--deboss)",
  marginBottom: 40,
};

// The lone Signal control — primary "Try the live demo".
const SIGNAL_BTN: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  minHeight: 48,
  padding: "0 26px",
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

// Quiet secondary — emboss tactile, neutral ink, no blue.
const GHOST_BTN: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  minHeight: 48,
  padding: "0 26px",
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

const FEATURE_CARD: React.CSSProperties = {
  border: "1px solid var(--hairline)",
  borderRadius: "var(--radius-md)",
  background: "var(--concrete-100)",
  boxShadow: "var(--raised)",
  padding: "28px 24px",
};

const FEATURE_INDEX: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.1em",
  fontVariantNumeric: "tabular-nums",
  color: "var(--ink-700)",
  marginBottom: 12,
  display: "block",
};

const FEATURE_TITLE: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 16,
  letterSpacing: "-0.01em",
  color: "var(--ink-900)",
  margin: "0 0 8px",
};

const FEATURE_DESC: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 14,
  lineHeight: 1.6,
  color: "var(--ink-700)",
  margin: 0,
};

const FEATURES = [
  {
    title: "Image search",
    desc: "Upload any image to find visual neighbours in your archive.",
  },
  {
    title: "Text search",
    desc: "Describe what you're looking for in natural language.",
  },
  {
    title: "Filters & boards",
    desc: "Narrow by metadata, save results to shareable collections.",
  },
];

export function DemoPage() {
  const [, setLocation] = useLocation();
  const [loomLoaded, setLoomLoaded] = useState(false);

  usePageMeta({
    title: "Demo — Archipedia",
    description: "See Archipedia in action. Search your architectural archive by image or text.",
  });

  useEffect(() => {
    trackLandingEvent("demo_page_view", {});
  }, []);

  const handleTryLiveDemo = () => {
    trackLandingEvent("try_live_demo_click", {});
    setLocation("/search");
  };

  const handleBookPilot = () => {
    trackLandingEvent("book_pilot_click", { location: "demo_page" });
    window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={PAGE}>
      <LandingTopBar />

      <main style={{ flex: 1 }}>
        <div style={CONTAINER}>
          {/* Hero text */}
          <div style={{ textAlign: "center", marginBottom: 48, maxWidth: 640, marginInline: "auto" }}>
            <span style={EYEBROW}>90-second walkthrough</span>
            <h1 style={H1}>
              See Archipedia in{" "}
              <span className="editorial-em" style={{ fontFamily: "var(--font-editorial)" }}>
                action
              </span>
            </h1>
            <p style={LEAD}>
              A short walkthrough of image and text search, fusion weights, and
              boards — using real, cited precedents, not a render.
            </p>
          </div>

          {/* Video well */}
          <div style={VIDEO_WELL}>
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
                  src={`https://www.loom.com/embed/${VIDEO_CONFIG.loomId}?autoplay=1`}
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay"
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title="Archipedia demo walkthrough"
                />
              )
            ) : (
              <button
                className="demo-play"
                onClick={() => {
                  setLoomLoaded(true);
                  trackLandingEvent("demo_video_play", {});
                }}
                aria-label="Play the 90-second demo walkthrough"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 20,
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
                    width: 64,
                    height: 64,
                    background: "var(--concrete-100)",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "var(--emboss)",
                    color: "var(--ink-900)",
                  }}
                >
                  <Play size={26} strokeWidth={1.75} />
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
                  Play walkthrough · 1:30
                </span>
              </button>
            )}
          </div>

          {/* CTAs — one Signal (primary), one quiet */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginBottom: 72,
            }}
          >
            <button className="signal-btn" onClick={handleTryLiveDemo} style={SIGNAL_BTN}>
              Try the live demo
              <ArrowRight size={16} strokeWidth={2} />
            </button>
            <button className="ghost-btn" onClick={handleBookPilot} style={GHOST_BTN}>
              Book an enterprise pilot
            </button>
          </div>

          {/* Hairline divider with axis-tick label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 28,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--ink-700)",
                whiteSpace: "nowrap",
              }}
            >
              What you'll see
            </span>
            <span style={{ flex: 1, height: 1, background: "var(--hairline)" }} aria-hidden="true" />
          </div>

          {/* Feature preview */}
          <div className="demo-feature-grid">
            {FEATURES.map((feature, i) => (
              <div key={feature.title} style={FEATURE_CARD}>
                <span style={FEATURE_INDEX}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 style={FEATURE_TITLE}>{feature.title}</h3>
                <p style={FEATURE_DESC}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <LandingFooter />

      <style>{`
        .demo-feature-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .demo-feature-grid { grid-template-columns: repeat(3, 1fr); }
        }
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
        .demo-play:hover span:first-of-type { background: var(--concrete-200); }
        .demo-play:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 2px var(--focus-ring);
        }
      `}</style>
    </div>
  );
}

export default DemoPage;
