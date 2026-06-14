/**
 * FinalCTA — the dark bookend. Shares the hero's --studio-ground (warm-charcoal
 * + raking light) so the page reads as a deliberate DARK → light → DARK arc.
 * The search well is the ONE primary action (lone Signal terminus); "Open the
 * canvas" is a quiet stone text link, not a co-equal CTA. A connector draws into
 * the search button on enter (motionOn).
 */
import { useRef, useState, useCallback, type FormEvent } from "react";
import { useLocation } from "wouter";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Search as SearchIcon } from "lucide-react";
import { IN_VIEW_ONCE, EASE_PRESS } from "./landingShared";

export function FinalCTA({ motionOn }: { motionOn: boolean }) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, IN_VIEW_ONCE);

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
      ref={ref}
      style={{
        position: "relative",
        background: "var(--studio-light)",
        backgroundColor: "var(--studio-ground-solid)",
        padding: "clamp(72px, 12vh, 128px) 0",
        overflow: "hidden",
      }}
    >
      <div className="grain" aria-hidden style={{ position: "absolute", inset: 0, opacity: "var(--studio-grain)", pointerEvents: "none", mixBlendMode: "overlay" }} />
      <div
        style={{
          position: "relative",
          maxWidth: 760,
          margin: "0 auto",
          padding: "0 clamp(20px, 5vw, 48px)",
          textAlign: "center",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", marginBottom: 22 }}>
          <span className="mono-caps" style={{ color: "var(--studio-stone)" }}>
            THE INSTRUMENT IS OPEN
          </span>
        </div>

        <h2
          className="display-editorial"
          style={{
            fontSize: "clamp(32px, 4.6vw, 54px)",
            lineHeight: 1.04,
            color: "var(--studio-ink)",
            margin: "0 0 32px",
          }}
        >
          Start with a building in mind. Or <span className="editorial-em">a feeling</span>.
        </h2>

        {/* search well (dark) */}
        <form onSubmit={onSubmit} style={{ maxWidth: 560, margin: "0 auto", position: "relative" }}>
          {/* connector drawing into the button */}
          <svg
            aria-hidden
            width="48"
            height="24"
            viewBox="0 0 48 24"
            fill="none"
            style={{ position: "absolute", top: -22, right: 24, overflow: "visible", pointerEvents: "none" }}
          >
            <motion.path
              d="M4 4 V14 H44"
              stroke="var(--studio-line-strong)"
              strokeWidth={1.5}
              strokeLinecap="square"
              initial={motionOn ? { pathLength: 0 } : { pathLength: 1 }}
              animate={inView ? { pathLength: 1 } : motionOn ? { pathLength: 0 } : { pathLength: 1 }}
              transition={motionOn ? { duration: 0.42, ease: EASE_PRESS, delay: 0.2 } : { duration: 0 }}
            />
            <motion.rect
              x={42}
              y={12}
              width={4}
              height={4}
              rx={1}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              fill="var(--studio-stone)"
              initial={motionOn ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
              animate={inView ? { scale: 1, opacity: 1 } : motionOn ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
              transition={motionOn ? { duration: 0.22, ease: EASE_PRESS, delay: 0.6 } : { duration: 0 }}
            />
          </svg>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,.06)",
              borderRadius: "var(--radius-md)",
              boxShadow: focused
                ? "inset 0 1px 2px rgba(0,0,0,.5), inset 0 0 0 1.5px var(--studio-ink)"
                : "inset 0 1px 2px rgba(0,0,0,.5), inset 0 0 0 1px var(--studio-line-strong)",
              transition: "box-shadow var(--dur-1) var(--ease-press)",
              padding: "6px 6px 6px 16px",
            }}
          >
            <SearchIcon size={18} strokeWidth={1.75} color={focused ? "var(--studio-ink)" : "var(--studio-stone-dim)"} style={{ flexShrink: 0 }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Describe a building, or drop a reference image"
              aria-label="Search the index"
              className="cta-input"
              style={{
                flex: 1,
                minWidth: 0,
                padding: "15px 8px",
                fontSize: 15,
                fontFamily: "var(--font-body)",
                color: "var(--studio-ink)",
                background: "transparent",
                border: "none",
                outline: "none",
              }}
            />
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
                fontWeight: 500,
                whiteSpace: "nowrap",
                color: hasQuery ? "#fff" : "var(--studio-stone)",
                background: hasQuery ? "var(--signal)" : "rgba(255,255,255,.08)",
                border: "none",
                borderRadius: "var(--radius-md)",
                cursor: hasQuery ? "pointer" : "not-allowed",
                transition: "background var(--dur-1) var(--ease-press)",
              }}
            >
              Search
              <ArrowRight size={16} strokeWidth={2} />
            </button>
          </div>
        </form>

        {/* quiet secondary — not co-equal with the primary search */}
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
            color: "var(--studio-stone)",
            transition: "color var(--dur-1) var(--ease-press)",
          }}
        >
          Open the canvas
          <ArrowRight size={14} strokeWidth={2} />
        </button>
      </div>

      <style>{`
        .cta-input::placeholder { color: var(--studio-stone); opacity: 1; }
        .cta-search-btn:not(:disabled):hover { background: var(--signal-hover); }
        .cta-search-btn:not(:disabled):active { transform: translateY(1px); }
        .cta-secondary:hover { color: var(--studio-ink); }
      `}</style>
    </section>
  );
}

export default FinalCTA;
