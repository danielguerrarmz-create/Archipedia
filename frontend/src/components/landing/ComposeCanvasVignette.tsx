/**
 * ComposeCanvasVignette — the 03 COMPOSE visual (Iteration 2: restraint).
 * Replaces the scattered thumbnail wall with ONE larger, shadowed board sheet:
 * a raised concrete-0 board on the modular grid holding a calm arrangement of
 * 3 precedent NODES + one Signal "Generate" node, joined by 2 step connectors
 * with union nubs. Mono caption: BOARD · 12 PRECEDENTS · 3 CONNECTIONS.
 *
 * Connectors draw on enter (motionOn); reduced motion renders assembled.
 */
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Thumb } from "./Thumb";
import { sanitizeTitle, clampWords, IN_VIEW_ONCE, EASE_PRESS } from "./landingShared";
import { Node } from "../motif";
import type { HeroPrecedent } from "../../data/heroPrecedents";

export function ComposeCanvasVignette({ precedents }: { precedents: HeroPrecedent[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, IN_VIEW_ONCE);
  const three = precedents.slice(0, 3);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* the single board sheet */}
      <div
        className="modular-grid"
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 3",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          background: "var(--concrete-0)",
          boxShadow: "var(--elev-modal)",
          padding: "clamp(18px, 3vw, 32px)",
        }}
      >
        {/* board header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            position: "relative",
            zIndex: 3,
          }}
        >
          <span className="mono-caps" style={{ color: "var(--ink-700)" }}>
            UNTITLED BOARD
          </span>
          <span className="mono-meta" style={{ color: "var(--ink-400)" }}>
            12 PRECEDENTS
          </span>
        </div>

        {/* 2 step connectors between the three plates + generate */}
        <svg
          viewBox="0 0 600 380"
          preserveAspectRatio="none"
          aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 2, overflow: "visible" }}
        >
          <motion.path
            d="M180 150 H320 V250"
            stroke="var(--hairline-strong)"
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="square"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 0.42, ease: EASE_PRESS, delay: 0.15 }}
          />
          <motion.path
            d="M320 250 H440"
            stroke="var(--hairline-strong)"
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="square"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 0.42, ease: EASE_PRESS, delay: 0.42 }}
          />
        </svg>

        {/* three precedent plates, calmly arranged */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "clamp(10px, 2vw, 18px)",
            alignItems: "start",
          }}
        >
          {three.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.24, ease: EASE_PRESS, delay: 0.08 * i }}
              style={{
                background: "var(--concrete-sunken)",
                boxShadow: "var(--deboss)",
                borderRadius: "var(--radius-md)",
                padding: 6,
                marginTop: i === 1 ? "32%" : 0, // gentle stagger, not scatter
              }}
            >
              <Thumb src={p.thumb} alt={sanitizeTitle(p.title)} aspect={1.5} radius="var(--radius-sm)" eager={i < 2} />
              <div
                className="mono-meta"
                style={{
                  marginTop: 6,
                  color: "var(--ink-700)",
                  fontSize: 10,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {clampWords(p.title, 3)}
              </div>
            </motion.div>
          ))}
        </div>

        {/* the "Generate" node — an ink node on the board (no stray blue) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.24, ease: EASE_PRESS, delay: 0.55 }}
          style={{
            position: "absolute",
            right: "10%",
            bottom: "12%",
            zIndex: 3,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 14px",
            background: "var(--ink-900)",
            color: "#fff",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--emboss)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: 1, background: "#fff", display: "inline-block" }} />
          Generate
        </motion.div>
      </div>

      {/* caption */}
      <div
        className="mono-caps"
        style={{ marginTop: 14, color: "var(--ink-500)", display: "flex", alignItems: "center", gap: 8 }}
      >
        <Node size={6} />
        BOARD · 12 PRECEDENTS · 3 CONNECTIONS
      </div>
    </div>
  );
}

export default ComposeCanvasVignette;
