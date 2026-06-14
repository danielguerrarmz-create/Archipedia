/**
 * LandingFooter — uppercase ARCHIPEDIA lockup, mono columns (Product / Index /
 * Studio), a "13,411 projects indexed" line, fine print, and a hairline footer
 * with AxisTick-style labels.
 */
import { useLocation } from "wouter";
import { Linkedin } from "lucide-react";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "PRODUCT",
    links: [
      { label: "Search", href: "/search/classic" },
      { label: "Canvas", href: "/canvas" },
      { label: "Boards", href: "/boards" },
    ],
  },
  {
    title: "INDEX",
    links: [
      { label: "Typologies", href: "/search/classic" },
      { label: "Architects", href: "/search/classic" },
      { label: "Climates", href: "/search/classic" },
    ],
  },
  {
    title: "STUDIO",
    links: [
      { label: "Enterprise", href: "/enterprise" },
      { label: "Contact", href: "/contact" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Privacy", href: "/privacy" },
      { label: "Sign in", href: "/signin" },
    ],
  },
];

export function LandingFooter() {
  const [, setLocation] = useLocation();
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "var(--studio-ground-solid)", borderTop: "1px solid var(--studio-line)" }}>
      <div
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "clamp(48px, 7vw, 80px) clamp(20px, 5vw, 48px) 40px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 40,
          }}
          className="footer-grid"
        >
          {/* lockup */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 22,
                  letterSpacing: "0.04em",
                  color: "var(--studio-ink)",
                }}
              >
                ARCHIPEDIA
              </span>
            </div>
            <p className="mono-meta" style={{ color: "var(--studio-stone)", maxWidth: 250, lineHeight: 1.55 }}>
              The index of the built world.
            </p>

            {/* Led by Pear Design (LinkedIn only for now) */}
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 7 }}>
              <span className="mono-caps" style={{ color: "var(--studio-stone-dim)" }}>LED BY</span>
              <a
                href="https://www.linkedin.com/company/pear-robotics/"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--studio-ink)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--studio-stone)")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  width: "fit-content",
                  color: "var(--studio-stone)",
                  textDecoration: "none",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 500,
                  transition: "color var(--dur-1) var(--ease-press)",
                }}
              >
                Pear Design
                <Linkedin size={14} strokeWidth={1.75} />
              </a>
            </div>
          </div>

          {/* columns */}
          <div className="footer-cols" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <div className="mono-caps" style={{ color: "var(--studio-stone)", marginBottom: 12 }}>
                  {col.title}
                </div>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <button
                        onClick={() => setLocation(l.href)}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--studio-ink)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--studio-stone)")}
                        style={{
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          fontFamily: "var(--font-body)",
                          fontSize: 14,
                          color: "var(--studio-stone)",
                          transition: "color var(--dur-1) var(--ease-press)",
                        }}
                      >
                        {l.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* hairline + axis-tick fine print */}
        <div
          style={{
            marginTop: 48,
            paddingTop: 18,
            borderTop: "1px solid var(--studio-line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <span className="mono-caps" style={{ color: "var(--studio-stone-dim)" }}>
            © {year} ARCHIPEDIA
          </span>
          <span className="mono-caps" style={{ color: "var(--studio-stone-dim)" }}>
            EVERY BUILDING LEAVES A MARK
          </span>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 2fr !important; }
        }
      `}</style>
    </footer>
  );
}

export default LandingFooter;
