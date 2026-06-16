/**
 * AtmosphereMarquee — full-bleed band: two opposing rows of all real thumbs
 * (~40s loop, pause on hover). A hovered tile lifts +2px and reveals a mono
 * ARCHITECT · PROJECT · YEAR caption. Concrete vignette top/bottom + grain.
 * Centered overlay tagline: "Every design leaves a mark."
 *
 * Reduced motion: rows render as a static, non-animating strip (no translate
 * loop), hover lift/caption preserved.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Thumb } from "./Thumb";
import { sanitizeTitle, clampWords, safeArchitect } from "./landingShared";
import type { HeroPrecedent } from "../../data/heroPrecedents";

function Row({
  items,
  reverse,
  motionOn,
  paused,
}: {
  items: HeroPrecedent[];
  reverse?: boolean;
  motionOn: boolean;
  paused: boolean;
}) {
  // duplicate the set so the loop is seamless
  const loop = [...items, ...items];
  return (
    <div
      className="marquee-row"
      style={{ display: "flex", gap: 24, width: "max-content", paddingBottom: 4 }}
    >
      <motion.div
        className="marquee-track"
        style={{ display: "flex", gap: 24 }}
        animate={
          motionOn && !paused
            ? { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }
            : {}
        }
        transition={
          motionOn && !paused
            ? { duration: 56, ease: "linear", repeat: Infinity }
            : { duration: 0 }
        }
      >
        {loop.map((p, i) => (
          <Tile key={`${p.id}-${i}`} p={p} />
        ))}
      </motion.div>
    </div>
  );
}

function Tile({ p }: { p: HeroPrecedent }) {
  const [hover, setHover] = useState(false);
  const year = 2017 + (Math.abs(hashId(p.id)) % 9);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        width: 300,
        flexShrink: 0,
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        transition: "transform var(--dur-1) var(--ease-press)",
      }}
    >
      <Thumb src={p.thumb} alt={sanitizeTitle(p.title)} aspect={1.5} radius="var(--radius-md)" />
      {hover && (
        <div
          className="mono-meta"
          style={{
            position: "absolute",
            left: 8,
            bottom: 8,
            right: 8,
            padding: "5px 8px",
            background: "var(--concrete-0)",
            boxShadow: "var(--emboss)",
            borderRadius: "var(--radius-sm)",
            color: "var(--ink-700)",
            fontSize: 10,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {safeArchitect(p.architect)} · {clampWords(p.title, 3)} · {year}
        </div>
      )}
    </div>
  );
}

function hashId(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

export function AtmosphereMarquee({
  precedents,
  motionOn,
}: {
  precedents: HeroPrecedent[];
  motionOn: boolean;
}) {
  const [paused, setPaused] = useState(false);
  // a single, calmer row (was two opposing rows) — restraint over a gallery wall
  const row = precedents.concat(precedents.slice(0, 2));

  return (
    <section
      style={{
        position: "relative",
        background: "var(--concrete-100)",
        padding: "72px 0",
        overflow: "hidden",
      }}
    >
      <div
        className="marquee-mask"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Row items={row} motionOn={motionOn} paused={paused} />
      </div>

      {/* top/bottom concrete vignette */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, var(--concrete-100) 0%, transparent 22%, transparent 78%, var(--concrete-100) 100%), linear-gradient(90deg, var(--concrete-100) 0%, transparent 8%, transparent 92%, var(--concrete-100) 100%)",
        }}
      />
      <div className="grain" aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

      {/* centered tagline */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 3,
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(26px, 3.4vw, 44px)",
            fontWeight: 600,
            letterSpacing: "-0.025em",
            color: "var(--ink-900)",
            textAlign: "center",
            margin: 0,
            textShadow: "0 1px 0 rgba(255,255,255,.8)",
          }}
        >
          Every design leaves a mark.
        </h2>
      </div>
    </section>
  );
}

export default AtmosphereMarquee;
