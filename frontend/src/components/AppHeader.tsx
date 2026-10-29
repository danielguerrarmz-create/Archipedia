/**
 * AppHeader — the ONE canonical dark "studio" app header, matching the splash's
 * LandingTopBar. Used across Index (search), Canvas, and Boards so all three
 * sections read consistently with the elevated splash.
 *
 *   background: var(--studio-ground-solid); off-white lowercase "archipedia"
 *   wordmark (no blue dot); nav Search · Canvas · Boards (stone → off-white
 *   hover; active = off-white + thin signal underline); one quiet right-side
 *   ghost button. Sticky, hairline-strong bottom border, subtle lift on scroll.
 *
 * Signal blue is reserved for the single primary action WITHIN each view
 * (search submit / canvas RUN / a board primary) — never in this chrome.
 */
import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { HamburgerMenu } from "./HamburgerMenu";

type Section = "search" | "canvas" | "boards";

const LINKS: { label: string; href: string; section: Section }[] = [
  { label: "Search", href: "/search/classic", section: "search" },
  { label: "Canvas", href: "/canvas", section: "canvas" },
  { label: "Boards", href: "/boards", section: "boards" },
];

interface AppHeaderProps {
  /** Force the active nav item; otherwise inferred from the current path. */
  active?: Section;
  /** Optional right-side ghost slot (button(s)/badge). Defaults to "Open the index". */
  right?: ReactNode;
}

function inferSection(path: string): Section | undefined {
  if (path.startsWith("/boards") || path.startsWith("/b/")) return "boards";
  if (path === "/canvas" || path.startsWith("/results")) return "canvas";
  if (path.startsWith("/search")) return "search";
  return undefined;
}

export function AppHeader({ active, right }: AppHeaderProps) {
  const [location, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const activeSection = active ?? inferSection(location);

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
        zIndex: 100,
        flexShrink: 0,
        background: "var(--studio-ground-solid)",
        borderBottom: `1px solid ${scrolled ? "var(--studio-line-strong)" : "var(--studio-line)"}`,
        boxShadow: scrolled ? "0 1px 24px rgba(0,0,0,0.4)" : "none",
        transition:
          "border-color var(--dur-2) var(--ease-press), box-shadow var(--dur-2) var(--ease-press)",
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
          gap: 24,
        }}
      >
        {/* wordmark — always off-white, no dot */}
        <button
          onClick={() => setLocation("/")}
          aria-label="Archipedia home"
          style={{
            display: "inline-flex",
            alignItems: "baseline",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            flexShrink: 0,
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

        {/* desktop nav */}
        <nav className="appheader-links" style={{ alignItems: "center", gap: 4 }}>
          {LINKS.map((l) => (
            <NavLink
              key={l.section}
              label={l.label}
              active={activeSection === l.section}
              onClick={() => setLocation(l.href)}
            />
          ))}
          <span style={{ marginLeft: 10 }}>
            {right ?? (
              <button
                onClick={() => setLocation("/search/classic")}
                className="appheader-cta"
                style={{
                  padding: "8px 16px",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--studio-ink)",
                  background: "transparent",
                  border: "1px solid var(--studio-line-strong)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  transition:
                    "background var(--dur-1) var(--ease-press), border-color var(--dur-1) var(--ease-press)",
                }}
              >
                Open the index
              </button>
            )}
          </span>
        </nav>

        <div className="appheader-burger" style={{ display: "none" }}>
          <HamburgerMenu />
        </div>
      </div>

      <style>{`
        .appheader-links { display: none; }
        .appheader-cta:hover { background: rgba(255,255,255,0.06); border-color: var(--studio-ink) !important; }
        @media (min-width: 768px) {
          .appheader-links { display: flex !important; }
          .appheader-burger { display: none !important; }
        }
        @media (max-width: 767px) {
          .appheader-burger { display: block !important; }
        }
      `}</style>
    </header>
  );
}

function NavLink({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.color = "var(--studio-ink)";
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.color = "var(--studio-stone)";
      }}
      style={{
        background: "transparent",
        border: "none",
        borderBottom: active ? "2px solid var(--signal)" : "2px solid transparent",
        cursor: "pointer",
        padding: "8px 12px 6px",
        fontFamily: "var(--font-body)",
        fontSize: 14,
        fontWeight: 500,
        color: active ? "var(--studio-ink)" : "var(--studio-stone)",
        transition: "color var(--dur-1) var(--ease-press)",
      }}
    >
      {label}
    </button>
  );
}

export default AppHeader;
