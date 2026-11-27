import { useLocation } from "wouter";
import { AxisTick } from "./motif/AxisTick";
import { Node } from "./motif/Node";

/*
 * Footer — top edge = AxisTick, no glass, concrete-0 surface.
 */

interface FooterProps {
  variant?: "default" | "minimal";
  logoLink?: string;
}

export function Footer({ variant = "default", logoLink = "/" }: FooterProps) {
  const [, setLocation] = useLocation();
  const isMinimal = variant === "minimal";

  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: isMinimal ? "60%" : "50%",
          maxWidth: isMinimal ? 800 : 600,
          minWidth: isMinimal ? 400 : 320,
          background: "var(--concrete-0)",
          boxShadow: "var(--raised)",
          borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
          overflow: "hidden",
        }}
      >
        {/* Top edge = AxisTick */}
        <AxisTick
          style={{
            padding: "0 16px",
            marginBottom: 0,
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: isMinimal ? "8px 16px" : "4px 12px",
          }}
        >
          {/* Wordmark */}
          <button
            type="button"
            onClick={() => setLocation(logoLink)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              padding: 0,
              opacity: 0.9,
              transition: "opacity var(--dur-1)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.6"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: isMinimal ? 14 : 9,
                fontWeight: 600,
                color: "var(--ink-900)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Archipedia
            </div>
            <div
              className="mono-meta"
              style={{
                fontSize: isMinimal ? 9 : 7,
                color: "var(--ink-400)",
              }}
            >
              PEAR.DESIGN
            </div>
          </button>

          {/* Curious link */}
          <button
            type="button"
            onClick={() => setLocation("/enterprise")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontFamily: "var(--font-body)",
              fontSize: isMinimal ? 11 : 8,
              fontWeight: 400,
              color: "var(--ink-500)",
              transition: "color var(--dur-1)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = "var(--ink-900)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = "var(--ink-500)";
            }}
          >
            Curious?
          </button>
        </div>
      </div>
    </footer>
  );
}
