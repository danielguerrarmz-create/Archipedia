/**
 * NarrativeSection — config-driven narrative beat used ×4 (Search / Compare /
 * Compose / Cite). Alternating L/R, scroll-revealed. The visual is "introduced"
 * by a short connector drawing from the eyebrow node into the visual, with a
 * union flash on completion (≤2 connectors per section — here exactly 1).
 *
 * Honors `motionOn`: reduced motion renders fully assembled, no draws/stagger.
 */
import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import {
  makeReveal,
  IN_VIEW_ONCE,
  EASE_PRESS,
} from "./landingShared";

/**
 * Per-section reveal flavor — so the four beats don't all use the same
 * connector-draw:
 *   "connector" — connector draws from the eyebrow node into the visual (01)
 *   "deboss"    — the visual presses in (scale 1.02→1 + settle), no connector (02/03)
 *   "plain"     — the visual just rises/fades with the copy stagger (04)
 */
export type RevealMode = "connector" | "deboss" | "plain";

export interface NarrativeConfig {
  index: string; // "01"
  eyebrow: string; // mono caps
  title: string;
  body: string;
  /** optional mono detail line under the body (e.g. a query string) */
  metaLine?: ReactNode;
  reverse?: boolean; // visual on the left
  reveal?: RevealMode; // default "plain"
  visual: ReactNode;
}

export function NarrativeSection({
  config,
  motionOn,
}: {
  config: NarrativeConfig;
  motionOn: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, IN_VIEW_ONCE);
  const { container, child } = makeReveal(motionOn);

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--concrete-50)",
        padding: "clamp(64px, 11vh, 128px) 0",
      }}
    >
      {/* the pin-board wall, carried down from the hero (gently faded at edges) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.4,
          backgroundImage:
            "linear-gradient(rgba(21,22,26,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(21,22,26,0.04) 1px, transparent 1px)",
          backgroundSize: "30px 30px, 30px 30px",
          WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 14%, #000 86%, transparent 100%)",
          maskImage: "linear-gradient(180deg, transparent 0%, #000 14%, #000 86%, transparent 100%)",
        }}
      />
      <motion.div
        ref={ref}
        variants={container}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "0 clamp(20px, 5vw, 48px)",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "clamp(32px, 6vw, 72px)",
          alignItems: "center",
        }}
        className={`narrative-grid ${config.reverse ? "is-reverse" : ""}`}
      >
        {/* COPY */}
        <div className="narrative-copy" style={{ maxWidth: 480 }}>
          <motion.div
            variants={child}
            style={{ display: "flex", alignItems: "center", marginBottom: 18 }}
          >
            <span className="mono-caps" style={{ color: "var(--ink-500)" }}>
              {config.eyebrow}
            </span>
          </motion.div>
          {/* SECTION tier — editorial serif, one voice with the hero, but held
              clearly subordinate (smaller, roman not italic) so it never
              out-shouts the hero's display line. */}
          <motion.h2
            variants={child}
            style={{
              fontFamily: "var(--font-editorial)",
              fontOpticalSizing: "auto",
              fontSize: "clamp(27px, 3vw, 42px)",
              fontWeight: 420,
              lineHeight: 1.1,
              letterSpacing: "-0.012em",
              color: "var(--ink-900)",
              textWrap: "balance",
              margin: "0 0 16px",
            }}
          >
            {config.title}
          </motion.h2>
          <motion.p
            variants={child}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 17,
              lineHeight: 1.6,
              color: "var(--ink-500)",
              margin: 0,
            }}
          >
            {config.body}
          </motion.p>
          {config.metaLine && (
            <motion.div variants={child} style={{ marginTop: 20 }}>
              {config.metaLine}
            </motion.div>
          )}
        </div>

        {/* VISUAL — reveal flavor varies per section */}
        <motion.div
          variants={child}
          className="narrative-visual"
          style={{ position: "relative" }}
        >
          {config.reveal === "connector" && (
            <IntroConnector motionOn={motionOn} active={inView} reverse={config.reverse} />
          )}
          {config.reveal === "deboss" ? (
            <motion.div
              initial={motionOn ? { scale: 1.02, opacity: 0 } : false}
              animate={inView ? { scale: 1, opacity: 1 } : motionOn ? { scale: 1.02, opacity: 0 } : { scale: 1, opacity: 1 }}
              transition={motionOn ? { duration: 0.42, ease: EASE_PRESS, delay: 0.1 } : { duration: 0 }}
            >
              {config.visual}
            </motion.div>
          ) : (
            config.visual
          )}
        </motion.div>
      </motion.div>

      <style>{`
        @media (min-width: 900px) {
          .narrative-grid { grid-template-columns: 5fr 7fr !important; }
          .narrative-grid.is-reverse .narrative-copy { order: 2; }
          .narrative-grid.is-reverse .narrative-visual { order: 1; }
        }
      `}</style>
    </section>
  );
}

/**
 * IntroConnector — the connector that draws from the copy's eyebrow node into
 * the visual, ending in a union nub that flashes Signal. Positioned on the
 * inner edge of the visual; purely decorative.
 */
function IntroConnector({
  motionOn,
  active,
  reverse,
}: {
  motionOn: boolean;
  active: boolean;
  reverse?: boolean;
}) {
  // anchored to the inner-top edge of the visual
  return (
    <svg
      aria-hidden
      width="64"
      height="40"
      viewBox="0 0 64 40"
      fill="none"
      style={{
        position: "absolute",
        top: -22,
        [reverse ? "right" : "left"]: -8,
        transform: reverse ? "scaleX(-1)" : "none",
        pointerEvents: "none",
        zIndex: 2,
        overflow: "visible",
      }}
    >
      <motion.path
        d="M2 8 H34 V32"
        stroke="var(--hairline-strong)"
        strokeWidth={1.5}
        strokeLinecap="square"
        initial={motionOn ? { pathLength: 0 } : { pathLength: 1 }}
        animate={active ? { pathLength: 1 } : motionOn ? { pathLength: 0 } : { pathLength: 1 }}
        transition={motionOn ? { duration: 0.42, ease: EASE_PRESS, delay: 0.2 } : { duration: 0 }}
      />
      <motion.rect
        x={32}
        y={30}
        width={4}
        height={4}
        rx={1}
        fill="var(--ink-700)"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={motionOn ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
        animate={active ? { scale: 1, opacity: 1 } : { opacity: motionOn ? 0 : 1 }}
        transition={motionOn ? { duration: 0.24, ease: EASE_PRESS, delay: 0.55 } : { duration: 0 }}
      />
    </svg>
  );
}

export default NarrativeSection;
