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
import { Sparkles } from "lucide-react";
import { Thumb } from "./Thumb";
import { Pushpin } from "./Pushpin";
import { sanitizeTitle, clampWords, IN_VIEW_ONCE, EASE_PRESS } from "./landingShared";
import type { HeroPrecedent } from "../../data/heroPrecedents";

/* Port coordinates live in a shared 0–100 percentage space so the SVG wires and
   the HTML node ports always line up regardless of the box's pixel size. */
/* Single coordinate source (0–100% canvas space) shared by BOTH the node
   placement and the wire endpoints, so wires always land exactly on ports.
   The three precedents fan into ONE Generate input; Generate fans out to the
   result. inX is the right edge of an input node (left 5% + width 21%). */
const INPUT_CYS = [20, 50, 80]; // vertical centers of the 3 input nodes
const PORTS = {
  in1: { x: 26, y: INPUT_CYS[0] },
  in2: { x: 26, y: INPUT_CYS[1] },
  in3: { x: 26, y: INPUT_CYS[2] },
  genIn: { x: 44, y: 50 },
  genOut: { x: 60, y: 50 },
  outIn: { x: 70, y: 50 },
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
      <Pushpin size={36} tilt={-16} seed={4} style={{ position: "absolute", top: -26, left: "44%", transform: "translateX(-50%)", zIndex: 6 }} />
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
          <span className="mono-caps" style={{ color: "var(--ink-700)", fontSize: 10 }}>PRECEDENT STUDY — 01</span>
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
            {wire(`M${PORTS.in1.x} ${PORTS.in1.y} H36 V${PORTS.genIn.y} H${PORTS.genIn.x}`, 0.15)}
            {wire(`M${PORTS.in2.x} ${PORTS.in2.y} H${PORTS.genIn.x}`, 0.28)}
            {wire(`M${PORTS.in3.x} ${PORTS.in3.y} H36 V${PORTS.genIn.y} H${PORTS.genIn.x}`, 0.41)}
            {wire(`M${PORTS.genOut.x} ${PORTS.genOut.y} H${PORTS.outIn.x}`, 0.62)}
            {/* union nubs at the merge / connection points */}
            {[PORTS.genIn, PORTS.genOut, PORTS.outIn].map((p, i) => (
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
                top: `${INPUT_CYS[i]}%`,
                y: "-50%",
                width: "21%",
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
              top: "50%",
              y: "-50%",
              width: "16%",
              minWidth: 92,
              zIndex: 3,
              // the one functional accent — mirrors the app's signal Generate button
              background: "var(--signal)",
              color: "#fff",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--emboss)",
              padding: "10px 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            <Sparkles size={11} strokeWidth={2} style={{ flexShrink: 0 }} aria-hidden />
            <span className="mono-caps" style={{ color: "#fff", fontSize: 10, letterSpacing: "0.1em" }}>Generate</span>
            {/* single input port — the three precedents fan in here */}
            <span style={{ position: "absolute", left: -4, top: "50%", marginTop: -3, width: 7, height: 7, borderRadius: "var(--radius-sm)", background: "#fff" }} />
            {/* output port */}
            <span style={{ position: "absolute", right: -4, top: "50%", marginTop: -3, width: 7, height: 7, borderRadius: "var(--radius-sm)", background: "#fff" }} />
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
              y: "-50%",
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
