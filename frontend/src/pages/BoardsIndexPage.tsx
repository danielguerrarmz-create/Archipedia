/**
 * BoardsIndexPage — the destination for the "Boards" nav item (previously this
 * route fell through to the splash). Boards are the sheets you assemble from
 * precedents and export. Until a saved-boards backend lists them here, this is a
 * clear, branded home that explains what boards are and routes you to start one.
 */
import { useLocation } from "wouter";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { AppHeader } from "../components/AppHeader";
import { LandingFooter } from "../components/landing/LandingFooter";

export function BoardsIndexPage() {
  const [, setLocation] = useLocation();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--concrete-50)" }}>
      <AppHeader active="boards" />

      <main
        style={{
          flex: 1,
          maxWidth: 760,
          width: "100%",
          margin: "0 auto",
          padding: "clamp(56px, 9vw, 110px) clamp(20px, 5vw, 40px)",
        }}
      >
        <span className="mono-caps" style={{ color: "var(--ink-400)" }}>BOARDS</span>
        <h1
          className="display-editorial"
          style={{ fontSize: "clamp(32px, 4.4vw, 52px)", color: "var(--ink-900)", margin: "12px 0 18px" }}
        >
          Your boards live here.
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 17, lineHeight: 1.65, color: "var(--ink-700)", maxWidth: "60ch", margin: 0 }}>
          A board is a sheet you compose from the precedents you find — arranged, annotated, and
          exported as a clean, credited PDF. You haven't made one yet.
        </p>

        {/* empty-state card */}
        <div
          style={{
            marginTop: 36,
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "22px 24px",
            background: "var(--concrete-100)",
            border: "1px solid var(--hairline)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--raised)",
          }}
        >
          <span
            style={{
              display: "grid",
              placeItems: "center",
              width: 44,
              height: 44,
              flexShrink: 0,
              borderRadius: "var(--radius-md)",
              background: "var(--concrete-sunken)",
              color: "var(--ink-700)",
              boxShadow: "var(--deboss)",
            }}
          >
            <LayoutGrid size={20} strokeWidth={1.75} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "var(--ink-900)" }}>
              Start by finding precedents
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--ink-500)", marginTop: 2 }}>
              Search the index or open the canvas, then collect the projects you like onto a board.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          <button
            onClick={() => setLocation("/search/classic")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "11px 20px", border: "none", borderRadius: "var(--radius-md)",
              background: "var(--signal)", color: "#fff", cursor: "pointer",
              fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500,
            }}
          >
            Search the index <ArrowRight size={16} strokeWidth={2} />
          </button>
          <button
            onClick={() => setLocation("/canvas")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "11px 20px", borderRadius: "var(--radius-md)",
              background: "transparent", border: "1px solid var(--hairline-strong)",
              color: "var(--ink-900)", cursor: "pointer",
              fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500,
            }}
          >
            Open the canvas
          </button>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

export default BoardsIndexPage;
