/**
 * HeroAssembly — the DARK cinematic hero (Iteration 2). Re-grounded in deep,
 * lit, warm-charcoal concrete (--studio-ground) so emboss/deboss are physically
 * visible and Klein-blue Signal detonates. "Ink, not absence."
 *
 * Depth stack (back→front):
 *   (1) studio ground = warm charcoal + a single raking directional light
 *       (upper-left, like sun across concrete) — gives the field dimension.
 *   (2) subsurface grain at ~8%.
 *   (3) a LARGE, fully-credited real precedent bleeding off the right/bottom
 *       edge with a soft directional cast shadow (the hero's subject + depth).
 *   (4) the living graph layered over/around it (stone on dark).
 *   (5) faint edge-masked modular grid.
 *
 * Layout: desktop two-column (copy/search left, subject + graph right). Mobile:
 * subject + graph become a dimmed full-bleed bg behind a scrim; search full-width.
 *
 * Motion (motionOn): the LEFT column is DECOUPLED from the graph — eyebrow →
 * headline → subhead finish ~1.0s (calm, readable); the search field RESOLVES
 * LAST (~400ms ink→Signal border settle) as the clear terminus; the graph
 * assembly continues on its own timeline to ~1.8s. Search autofocuses ~1.8s.
 */
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type FormEvent,
} from "react";
import { useLocation } from "wouter";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, Search as SearchIcon } from "lucide-react";
import type { HeroPrecedent } from "../../data/heroPrecedents";
import { LivingGraph } from "./LivingGraph";
import {
  EASE_EMERGE,
  EASE_PRESS,
  sanitizeTitle,
  clampWords,
  safeArchitect,
} from "./landingShared";

const EYEBROW = "THE INDEX OF THE BUILT WORLD";
const HEADLINE_LINES = ["Press your idea against", "everything ever built."];

export function HeroAssembly({
  precedents,
  motionOn,
}: {
  precedents: HeroPrecedent[];
  motionOn: boolean;
}) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [resolved, setResolved] = useState(!motionOn); // search-field terminus settle
  const [armToken, setArmToken] = useState(0); // bumps to re-arm the idle breath
  const inputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Re-arm the idle breath whenever the hero re-enters the viewport
  // (scroll-return) — the instrument re-inviting, not a metronome.
  const heroInView = useInView(sectionRef, { amount: 0.5 });
  useEffect(() => {
    if (heroInView) setArmToken((t) => t + 1);
  }, [heroInView]);

  // Parallax (decorative bg only; killed under reduced motion)
  const { scrollY } = useScroll();
  const subjectY = useTransform(scrollY, [0, 800], [0, motionOn ? -50 : 0]);
  const graphY = useTransform(scrollY, [0, 800], [0, motionOn ? -20 : 0]);

  // Search resolves LAST (the terminus), then autofocus.
  useEffect(() => {
    if (!motionOn) {
      setResolved(true);
      inputRef.current?.focus();
      return;
    }
    const tResolve = setTimeout(() => setResolved(true), 1000); // border settle starts
    const tFocus = setTimeout(() => inputRef.current?.focus(), 1800);
    return () => {
      clearTimeout(tResolve);
      clearTimeout(tFocus);
    };
  }, [motionOn]);

  const runQuery = useCallback(
    (q: string) => {
      const t = q.trim();
      if (!t) return;
      setLocation(`/search/classic?q=${encodeURIComponent(t)}`);
    },
    [setLocation],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    runQuery(query);
  };

  const hasQuery = query.trim().length > 0;

  // hero subject: the first fully-credited precedent (architect present)
  const subject =
    precedents.find((p) => safeArchitect(p.architect) !== "Architect unrecorded") ??
    precedents[0];

  // left-column timeline (calm, finishes ~1.0s)
  const fx = (delay: number, y = 0) =>
    motionOn
      ? {
          initial: { opacity: 0, y },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.36, ease: EASE_EMERGE, delay },
        }
      : { initial: false as const, animate: { opacity: 1, y: 0 } };

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        minHeight: "min(100svh, 880px)",
        overflow: "hidden",
        background: "var(--studio-light)",
        backgroundColor: "var(--studio-ground-solid)",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* (1b) second ambient lift — fills the dead lower-left quadrant so the
          WHOLE field reads as lit concrete, not partly dead (the raking key
          light favours upper-left→centre). Very subtle, warm. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(70% 60% at 14% 92%, rgba(255,246,228,0.05) 0%, rgba(255,246,228,0.02) 34%, rgba(0,0,0,0) 64%)",
        }}
      />

      {/* (2) subsurface grain on the dark ground */}
      <div
        className="grain"
        aria-hidden
        style={{ position: "absolute", inset: 0, opacity: "var(--studio-grain)", pointerEvents: "none", mixBlendMode: "overlay" }}
      />

      {/* (5) faint edge-masked modular grid, on dark */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.5,
          backgroundImage:
            "linear-gradient(var(--studio-line) 1px, transparent 1px), linear-gradient(90deg, var(--studio-line) 1px, transparent 1px)",
          backgroundSize: "24px 24px, 24px 24px",
          WebkitMaskImage: "radial-gradient(120% 90% at 72% 42%, #000 25%, transparent 78%)",
          maskImage: "radial-gradient(120% 90% at 72% 42%, #000 25%, transparent 78%)",
        }}
      />

      {/* ── CONTENT GRID ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "0 clamp(20px, 5vw, 48px)",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: 24,
          alignItems: "center",
        }}
        className="hero-grid"
      >
        {/* COPY + SEARCH COLUMN */}
        <div style={{ position: "relative", zIndex: 3, maxWidth: 580 }}>
          {/* eyebrow — stone mono on dark */}
          <motion.div
            {...fx(motionOn ? 0.1 : 0, motionOn ? 8 : 0)}
            style={{ display: "flex", alignItems: "center", marginBottom: 22 }}
          >
            <span className="mono-caps" style={{ color: "var(--studio-stone)" }}>
              {EYEBROW}
            </span>
          </motion.div>

          {/* headline — off-white, per-line clip reveal */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(36px, 6vw, 72px)",
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              color: "var(--studio-ink)",
              margin: "0 0 22px",
            }}
          >
            {HEADLINE_LINES.map((line, i) => (
              <span key={i} style={{ display: "block", overflow: "hidden" }}>
                <motion.span
                  style={{ display: "block" }}
                  initial={motionOn ? { clipPath: "inset(100% 0 0 0)", y: "0.1em" } : false}
                  animate={{ clipPath: "inset(0% 0 0 0)", y: 0 }}
                  transition={motionOn ? { duration: 0.38, ease: EASE_EMERGE, delay: 0.28 + i * 0.09 } : { duration: 0 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* subhead — off-white, slightly larger/heavier so the literal
              promise lands as fast as the headline (AA ≥4.5:1 on the ground) */}
          <motion.p
            {...fx(motionOn ? 0.62 : 0, motionOn ? 12 : 0)}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 19,
              fontWeight: 450,
              lineHeight: 1.58,
              color: "var(--studio-ink)",
              maxWidth: 552,
              margin: "0 0 28px",
            }}
          >
            Describe what you're after, or drop a reference image. The index
            answers with the buildings that genuinely resemble it — ranked by
            how they look, not how they were tagged.
          </motion.p>

          {/* search well — the ONE primary gesture; resolves LAST */}
          <motion.form
            onSubmit={onSubmit}
            {...fx(motionOn ? 0.78 : 0, motionOn ? 12 : 0)}
            style={{ maxWidth: 560 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.05)",
                borderRadius: "var(--radius-md)",
                // ink hairline → Signal border settle on resolve (the terminus)
                boxShadow: focused
                  ? "inset 0 1px 2px rgba(0,0,0,.5), 0 0 0 3px var(--focus-ring), inset 0 0 0 1px var(--signal)"
                  : resolved
                    ? "inset 0 1px 2px rgba(0,0,0,.5), inset 0 0 0 1px var(--signal)"
                    : "inset 0 1px 2px rgba(0,0,0,.5), inset 0 0 0 1px var(--studio-line-strong)",
                transition: "box-shadow 0.4s var(--ease-press)",
                padding: "6px 6px 6px 16px",
              }}
            >
              <SearchIcon
                size={18}
                strokeWidth={1.75}
                color={focused || resolved ? "var(--studio-ink)" : "var(--studio-stone-dim)"}
                style={{ flexShrink: 0 }}
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Describe a building, or drop a reference image"
                aria-label="Search the index"
                className="hero-input"
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
                className="hero-search-btn"
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
                  letterSpacing: "0.005em",
                  whiteSpace: "nowrap",
                  color: hasQuery ? "#fff" : "var(--studio-stone)",
                  background: hasQuery ? "var(--signal)" : "rgba(255,255,255,0.08)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  boxShadow: hasQuery ? "0 1px 0 rgba(255,255,255,.12)" : "inset 0 0 0 1px var(--studio-line-strong)",
                  cursor: hasQuery ? "pointer" : "not-allowed",
                  transition: "background var(--dur-1) var(--ease-press), transform var(--dur-1) var(--ease-press)",
                }}
              >
                Search
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </div>
          </motion.form>
        </div>

        {/* SUBJECT + GRAPH COLUMN */}
        <div
          className="hero-stage-col"
          style={{ position: "relative" }}
          onPointerEnter={() => setArmToken((t) => t + 1)}
        >
          {/* (3) LARGE credited precedent bleeding off edge + cast shadow */}
          <motion.figure
            style={{ position: "relative", margin: 0, y: subjectY, zIndex: 1 }}
            initial={motionOn ? { opacity: 0, scale: 1.03 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={motionOn ? { duration: 0.6, ease: EASE_PRESS, delay: 0.2 } : { duration: 0 }}
          >
            <HeroSubject subject={subject} />
          </motion.figure>

          {/* (4) the living graph layered over/around the subject */}
          <motion.div
            className="hero-graph-layer"
            aria-hidden
            style={{ position: "absolute", inset: 0, y: graphY, zIndex: 2 }}
          >
            <LivingGraph
              precedents={precedents}
              motionOn={motionOn}
              resolved={resolved}
              armToken={armToken}
            />
          </motion.div>
        </div>
      </div>

      <style>{`
        .hero-input::placeholder { color: var(--studio-stone); opacity: 1; }
        .hero-search-btn:active { transform: translateY(1px); }
        .hero-search-btn:not(:disabled):hover { background: var(--signal-hover) !important; }
        .hero-stage-col {
          position: absolute;
          inset: 0;
          opacity: 0.34;
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 50%);
          mask-image: linear-gradient(90deg, transparent 0%, #000 50%);
        }
        @media (min-width: 1024px) {
          .hero-grid { grid-template-columns: repeat(12, 1fr) !important; }
          .hero-grid > div:first-child { grid-column: 1 / span 6; }
          .hero-stage-col {
            position: relative !important;
            grid-column: 7 / span 6;
            inset: auto !important;
            opacity: 1 !important;
            margin-right: -80px;
            aspect-ratio: 640 / 560;
            -webkit-mask-image: none !important;
            mask-image: none !important;
          }
        }
      `}</style>
    </section>
  );
}

/* Large credited subject precedent with visible metadata (the Pinterest delta). */
function HeroSubject({ subject }: { subject?: HeroPrecedent }) {
  const [errored, setErrored] = useState(false);
  if (!subject) return null;
  return (
    <div
      style={{
        position: "relative",
        width: "112%",
        marginLeft: "8%",
        aspectRatio: "4 / 3",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        boxShadow: "var(--studio-cast)",
        background: "var(--studio-ground-deep)",
      }}
    >
      {!errored ? (
        <img
          src={subject.thumb}
          alt={sanitizeTitle(subject.title)}
          loading="eager"
          // @ts-expect-error fetchpriority is valid HTML
          fetchpriority="high"
          decoding="async"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          onError={() => setErrored(true)}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "var(--studio-ground-deep)" }}>
          <span className="mono-meta" style={{ color: "var(--studio-stone-dim)" }}>Image unavailable</span>
        </div>
      )}
      {/* legibility scrim + credited metadata */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(0deg, rgba(0,0,0,.82) 0%, rgba(0,0,0,.5) 22%, rgba(0,0,0,0) 48%)",
        }}
      />
      <figcaption
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 14,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 16,
            letterSpacing: "-0.01em",
            color: "var(--studio-ink)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {clampWords(subject.title, 6)}
        </span>
        {/* only manifest-authoritative fields (no fabricated year);
            full-opacity off-white over the scrim → comfortably clears AA */}
        <span className="mono-meta" style={{ color: "var(--studio-ink)", fontSize: 11.5, letterSpacing: "0.03em" }}>
          {safeArchitect(subject.architect)} · {subject.country || "—"} · INDEXED
        </span>
      </figcaption>
    </div>
  );
}

export default HeroAssembly;
