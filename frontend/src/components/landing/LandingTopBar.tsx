/**
 * LandingTopBar — a CONSISTENT dark "studio" bar (no transparent→light flip).
 * Wordmark is always off-white so it never disappears against the hero; a faint
 * hairline + subtle lift appear on scroll. One quiet secondary ("Open the index")
 * as a hairline ghost button — Signal blue is reserved for the hero search field.
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { HamburgerMenu } from "../HamburgerMenu";

const LINKS: { label: string; href: string }[] = [
  { label: "Search", href: "/search/classic" },
  { label: "Canvas", href: "/canvas" },
  { label: "Boards", href: "/boards" },
];

export function LandingTopBar() {
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--studio-ground-solid)",
        borderBottom: `1px solid ${scrolled ? "var(--studio-line-strong)" : "var(--studio-line)"}`,
        boxShadow: scrolled ? "0 1px 24px rgba(0,0,0,0.4)" : "none",
        transition: "border-color var(--dur-2) var(--ease-press), box-shadow var(--dur-2) var(--ease-press)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "0 clamp(20px, 5vw, 48px)",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* wordmark — always off-white */}
        <button
          onClick={() => setLocation("/")}
          aria-label="Archipedia home"
          style={{
            display: "inline-flex",
            alignItems: "baseline",
            gap: 2,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 19,
              letterSpacing: "-0.02em",
              color: "var(--studio-ink)",
              textTransform: "lowercase",
            }}
          >
            archipedia
          </span>
        </button>

        {/* desktop nav — quiet links + one ghost button */}
        <nav className="topbar-links" style={{ alignItems: "center", gap: 6 }}>
          {LINKS.map((l) => (
            <NavLink key={l.label} label={l.label} onClick={() => setLocation(l.href)} />
          ))}
          <button
            onClick={() => setLocation("/search/classic")}
            className="topbar-cta"
            style={{
              marginLeft: 10,
              padding: "8px 16px",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--studio-ink)",
              background: "transparent",
              border: "1px solid var(--studio-line-strong)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              transition: "background var(--dur-1) var(--ease-press), border-color var(--dur-1) var(--ease-press)",
            }}
          >
            Open the index
          </button>
        </nav>

        <div className="topbar-burger" style={{ display: "none" }}>
          <HamburgerMenu />
        </div>
      </div>

      <style>{`
        .topbar-links { display: none; }
        .topbar-cta:hover { background: rgba(255,255,255,0.06); border-color: var(--studio-ink) !important; }
        @media (min-width: 768px) {
          .topbar-links { display: flex !important; }
          .topbar-burger { display: none !important; }
        }
        @media (max-width: 767px) {
          .topbar-burger { display: block !important; }
        }
      `}</style>
    </header>
  );
}

function NavLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--studio-ink)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--studio-stone)")}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "6px 10px",
        fontFamily: "var(--font-body)",
        fontSize: 14,
        fontWeight: 500,
        color: "var(--studio-stone)",
        transition: "color var(--dur-1) var(--ease-press)",
      }}
    >
      {label}
    </button>
  );
}

export default LandingTopBar;
