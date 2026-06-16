/**
 * ComposeCanvasVignette — the 03 COMPOSE visual, as a MOCK-UP of the actual
 * product: a node-editor "canvas" window where precedent nodes are wired into a
 * Generate node and out to a generated result — the real thing this section
 * describes ("pull precedents onto a board and connect them"). Uses the app's
 * node–connector–union grammar (ink ports, orthogonal step wires, union nubs)
 * on the modular grid. Wires draw on enter; reduced motion renders assembled.
 */
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Thumb } from "./Thumb";
import { Pushpin } from "./Pushpin";
import { sanitizeTitle, clampWords, IN_VIEW_ONCE, EASE_PRESS } from "./landingShared";
import type { HeroPrecedent } from "../../data/heroPrecedents";

/* Port coordinates live in a shared 0–100 percentage space so the SVG wires and
   the HTML node ports always line up regardless of the box's pixel size. */
const PORTS = {
  in1: { x: 32, y: 27 },
  in2: { x: 32, y: 52 },
  in3: { x: 32, y: 77 },
  genL1: { x: 44, y: 48 },
  genL2: { x: 44, y: 54 },
  genL3: { x: 44, y: 60 },
  genR: { x: 60, y: 54 },
  outL: { x: 70, y: 50 },
};

export function ComposeCanvasVignette({ precedents }: { precedents: HeroPrecedent[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, IN_VIEW_ONCE);
  const inputs = precedents.slice(0, 3);
  const result = precedents[3] ?? precedents[0];

  const wire = (d: string, delay: number) => (
    <motion.path
      d={d}
      stroke="var(--hairline-strong)"
      strokeWidth={1.4}
      fill="none"
      strokeLinecap="square"
      initial={{ pathLength: 0 }}
      animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
      transition={{ duration: 0.4, ease: EASE_PRESS, delay }}
    />
  );

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* the product window is itself pinned to the wall (a visual artifact) */}
      <Pushpin size={36} tilt={-16} style={{ position: "absolute", top: -26, left: "44%", transform: "translateX(-50%)", zIndex: 6 }} />
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 3",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          background: "var(--concrete-0)",
          boxShadow: "var(--elev-modal)",
          transform: "rotate(-0.8deg)",
        }}
      >
        {/* app bar */}
        <div
          style={{
            position: "relative",
            zIndex: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 34,
            padding: "0 12px",
            borderBottom: "1px solid var(--hairline)",
            background: "var(--concrete-100)",
          }}
        >
          <span className="mono-caps" style={{ color: "var(--ink-700)", fontSize: 10 }}>UNTITLED BOARD</span>
          <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            <span style={{ width: 7, height: 7, borderRadius: "var(--radius-sm)", background: "var(--ink-300)" }} />
            <span style={{ width: 7, height: 7, borderRadius: "var(--radius-sm)", background: "var(--ink-300)" }} />
            <span className="mono-meta" style={{ color: "var(--ink-400)", fontSize: 10 }}>100%</span>
          </span>
        </div>

        {/* canvas */}
        <div className="modular-grid" style={{ position: "absolute", inset: "34px 0 0 0" }}>
          {/* wires + ports (percentage space) */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 2, overflow: "visible" }}>
            {wire(`M${PORTS.in1.x} ${PORTS.in1.y} H38 V${PORTS.genL1.y} H${PORTS.genL1.x}`, 0.15)}
            {wire(`M${PORTS.in2.x} ${PORTS.in2.y} H40 V${PORTS.genL2.y} H${PORTS.genL2.x}`, 0.28)}
            {wire(`M${PORTS.in3.x} ${PORTS.in3.y} H38 V${PORTS.genL3.y} H${PORTS.genL3.x}`, 0.41)}
            {wire(`M${PORTS.genR.x} ${PORTS.genR.y} H65 V${PORTS.outL.y} H${PORTS.outL.x}`, 0.62)}
            {/* union nubs at the merge points */}
            {[PORTS.genL1, PORTS.genL2, PORTS.genL3, PORTS.genR, PORTS.outL].map((p, i) => (
              <motion.rect
                key={i}
                x={p.x - 1}
                y={p.y - 1}
                width={2}
                height={2}
                fill="var(--ink-700)"
                vectorEffect="non-scaling-stroke"
                initial={{ scale: 0, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: EASE_PRESS, delay: 0.5 + i * 0.05 }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
            ))}
          </svg>

          {/* input precedent nodes */}
          {inputs.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.24, ease: EASE_PRESS, delay: 0.06 * i }}
              style={{
                position: "absolute",
                left: "5%",
                top: `${12 + i * 25}%`,
                width: "26%",
                zIndex: 3,
                background: "var(--concrete-100)",
                boxShadow: "var(--raised)",
                borderRadius: "var(--radius-md)",
                padding: 5,
              }}
            >
              <Thumb src={p.thumb} alt={sanitizeTitle(p.title)} aspect={1.6} radius="var(--radius-sm)" eager={i < 2} />
              <div className="mono-meta" style={{ marginTop: 4, color: "var(--ink-700)", fontSize: 9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {clampWords(p.title, 2)}
              </div>
              {/* output port */}
              <span style={{ position: "absolute", right: -4, top: "50%", width: 7, height: 7, marginTop: -3, borderRadius: "var(--radius-sm)", background: "var(--ink-700)", boxShadow: "0 1px 0 rgba(255,255,255,0.7)" }} />
            </motion.div>
          ))}

          {/* generate node */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.24, ease: EASE_PRESS, delay: 0.5 }}
            style={{
              position: "absolute",
              left: "44%",
              top: "44%",
              transform: "translateY(-50%)",
              width: "16%",
              minWidth: 92,
              zIndex: 3,
              background: "var(--ink-900)",
              color: "#fff",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--emboss)",
              padding: "10px 8px",
              textAlign: "center",
            }}
          >
            <span className="mono-caps" style={{ color: "#fff", fontSize: 10, letterSpacing: "0.12em" }}>Generate</span>
            {/* input ports */}
            {[28, 50, 72].map((top) => (
              <span key={top} style={{ position: "absolute", left: -4, top: `${top}%`, marginTop: -3, width: 7, height: 7, borderRadius: "var(--radius-sm)", background: "#fff" }} />
            ))}
            <span style={{ position: "absolute", right: -4, top: "50%", width: 7, height: 7, marginTop: -3, borderRadius: "var(--radius-sm)", background: "#fff" }} />
          </motion.div>

          {/* output (generated) node */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.26, ease: EASE_PRESS, delay: 0.74 }}
            style={{
              position: "absolute",
              left: "70%",
              top: "50%",
              transform: "translateY(-50%)",
              width: "26%",
              zIndex: 3,
              background: "var(--concrete-0)",
              boxShadow: "var(--elev-modal)",
              borderRadius: "var(--radius-md)",
              padding: 5,
            }}
          >
            <Thumb src={result.thumb} alt={sanitizeTitle(result.title)} aspect={1.4} radius="var(--radius-sm)" />
            <div className="mono-meta" style={{ marginTop: 4, color: "var(--ink-500)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Generated · new direction
            </div>
            {/* input port */}
            <span style={{ position: "absolute", left: -4, top: "50%", width: 7, height: 7, marginTop: -3, borderRadius: "var(--radius-sm)", background: "var(--ink-700)", boxShadow: "0 1px 0 rgba(255,255,255,0.7)" }} />
          </motion.div>
        </div>
      </div>

      {/* caption */}
      <div className="mono-caps" style={{ marginTop: 14, color: "var(--ink-500)" }}>
        CANVAS · 3 PRECEDENTS · 1 GENERATE
      </div>
    </div>
  );
}

export default ComposeCanvasVignette;
