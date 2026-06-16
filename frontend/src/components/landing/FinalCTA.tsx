/**
 * FinalCTA — the "Ready to start?" search entry, presented AFTER the tutorial.
 * Light/white panel (deliberately not the dark footer) with a clear hierarchy:
 * quiet kicker → editorial heading → the one search well → quiet secondary.
 * No decorative marks; Signal appears only on the functional Search button.
 */
import { useState, useCallback, type FormEvent } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Search as SearchIcon, ImagePlus } from "lucide-react";

export function FinalCTA({ motionOn: _motionOn }: { motionOn: boolean }) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const goSearch = useCallback(() => {
    const q = query.trim();
    if (!q) return;
    setLocation(`/search/classic?q=${encodeURIComponent(q)}`);
  }, [query, setLocation]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    goSearch();
  };
  const hasQuery = query.trim().length > 0;

  return (
    <section
      id="ready-to-start"
      style={{
        position: "relative",
        background: "var(--concrete-50)",
        padding: "clamp(64px, 11vh, 120px) 0",
        borderTop: "1px solid var(--hairline)",
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: 720,
          margin: "0 auto",
          padding: "clamp(36px, 5vw, 56px) clamp(24px, 5vw, 56px)",
          textAlign: "center",
          background: "var(--concrete-0)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--raised)",
        }}
      >
        <span
          className="mono-caps"
          style={{ display: "block", color: "var(--ink-500)", marginBottom: 16 }}
        >
          READY TO START?
        </span>

        <h2
          className="display-editorial"
          style={{
            fontSize: "clamp(30px, 4.4vw, 50px)",
            lineHeight: 1.05,
            color: "var(--ink-900)",
            margin: "0 0 28px",
          }}
        >
          Start with a project in mind. Or just <span className="editorial-em">a feeling</span>.
        </h2>

        <form onSubmit={onSubmit} style={{ maxWidth: 540, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--concrete-50)",
              borderRadius: "var(--radius-md)",
              boxShadow: focused
                ? "0 0 0 1px var(--hairline), 0 0 0 2px var(--ink-900), 0 6px 18px rgba(21,22,26,0.08)"
                : "var(--deboss)",
              transition: "box-shadow var(--dur-2) var(--ease-press)",
              padding: "5px 5px 5px 15px",
            }}
          >
            <SearchIcon size={18} strokeWidth={1.75} color={focused ? "var(--ink-900)" : "var(--ink-400)"} style={{ flexShrink: 0 }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Describe a project, or drop a reference image"
              aria-label="Search the index"
              style={{
                flex: 1,
                minWidth: 0,
                padding: "13px 8px",
                fontSize: 15,
                fontFamily: "var(--font-body)",
                color: "var(--ink-900)",
                background: "transparent",
                border: "none",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => setLocation("/search/image")}
              aria-label="Search by image instead"
              title="Search by image"
              className="cta-img-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 42,
                height: 42,
                flexShrink: 0,
                color: "var(--ink-500)",
                background: "var(--concrete-100)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                boxShadow: "var(--deboss)",
                cursor: "pointer",
                transition: "color var(--dur-1) var(--ease-press), background var(--dur-1) var(--ease-press)",
              }}
            >
              <ImagePlus size={17} strokeWidth={1.75} />
            </button>
            <button
              type="submit"
              disabled={!hasQuery}
              aria-label="Search the index"
              className="cta-search-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 44,
                padding: "0 18px",
                flexShrink: 0,
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: "nowrap",
                color: hasQuery ? "#fff" : "var(--ink-400)",
                background: hasQuery ? "var(--signal)" : "var(--concrete-200)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                boxShadow: hasQuery ? "0 0 0 1px rgba(31,63,255,0.35), 0 4px 14px -6px rgba(31,63,255,0.5)" : "none",
                cursor: hasQuery ? "pointer" : "not-allowed",
                transition: "background var(--dur-2) var(--ease-press), box-shadow var(--dur-2) var(--ease-press)",
              }}
            >
              Search
              <ArrowRight size={16} strokeWidth={2} />
            </button>
          </div>
        </form>

        <button
          onClick={() => setLocation("/canvas")}
          className="cta-secondary"
          style={{
            marginTop: 18,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--ink-500)",
            transition: "color var(--dur-1) var(--ease-press)",
          }}
        >
          Or open the canvas
          <ArrowRight size={14} strokeWidth={2} />
        </button>
      </div>

      <style>{`
        .cta-img-btn:hover { color: var(--ink-900); background: var(--concrete-200); }
        .cta-search-btn:not(:disabled):hover { background: var(--signal-hover); }
        .cta-search-btn:not(:disabled):active { transform: translateY(1px); }
        .cta-secondary:hover { color: var(--ink-900); }
      `}</style>
    </section>
  );
}

export default FinalCTA;
