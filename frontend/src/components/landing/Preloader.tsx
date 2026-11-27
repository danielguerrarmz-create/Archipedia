/**
 * Preloader — a Spacelab-style intro. The letters of "archipedia" first ASSEMBLE
 * themselves (flying in from scattered offsets, blur → sharp, staggered), hold as
 * an oversized centred wordmark, then TRAVEL up-and-shrink to land precisely on
 * the real header wordmark ([data-wordmark]) before the overlay fades away.
 *
 * Plays once per browser tab (sessionStorage) and is skipped entirely under
 * prefers-reduced-motion. The page underneath is fully rendered the whole time,
 * so the hand-off to the header is seamless.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const WORD = "archipedia";
const SESSION_KEY = "archipedia.intro.played";

// Deterministic offsets (no Math.random). Letters SETTLE onto the baseline from
// just above with a slight tilt — type being set into a line, not confetti.
const OFFSETS: { x: number; y: number; r: number }[] = [
  { x: -34, y: -52, r: -5 },
  { x: 26, y: -64, r: 4 },
  { x: -18, y: -58, r: 3 },
  { x: 40, y: -48, r: -4 },
  { x: -44, y: -60, r: 5 },
  { x: 14, y: -66, r: -3 },
  { x: 32, y: -54, r: 2 },
  { x: -28, y: -50, r: 5 },
  { x: 20, y: -62, r: -3 },
  { x: -38, y: -56, r: 4 },
];

type Box = { x: number; y: number; w: number; h: number; scale: number };

export function Preloader({ onDone }: { onDone?: () => void }) {
  const reduce = useReducedMotion();
  const alreadyPlayed =
    typeof sessionStorage !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1";

  const [active, setActive] = useState(!reduce && !alreadyPlayed);
  const [phase, setPhase] = useState<"assemble" | "travel" | "fade">("assemble");
  const [box, setBox] = useState<Box | null>(null);
  const measuredRef = useRef(false);

  // Measure the header wordmark to know where to land. Measure synchronously so
  // the letters can appear immediately, then RE-measure once webfonts resolve —
  // the assembled word's width depends on Archivo, so a font-load race would
  // otherwise land it a few px off the real wordmark (the whole point of the
  // effect is pixel-perfect coincidence).
  useLayoutEffect(() => {
    if (!active) return;

    const measure = () => {
      const el = document.querySelector<HTMLElement>("[data-wordmark]");
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Header target rect (fallback approximates the top-left wordmark slot).
      const r = el?.getBoundingClientRect();
      const w = r?.width ?? 132;
      const h = r?.height ?? 22;
      const hx = r?.left ?? Math.min(48, vw * 0.05);
      const hy = r?.top ?? 30;

      // Big, centred assembly state. Origin is top-left, so we translate the
      // box's top-left corner so the SCALED word is centred on screen.
      const scale = Math.max(2.4, Math.min(4.2, (vw * 0.62) / w));
      setBox({ x: hx, y: hy, w, h, scale });
      setStart({ x: (vw - w * scale) / 2, y: (vh - h * scale) / 2 });
    };

    measure();
    measuredRef.current = true;
    // Correct the landing once fonts are ready (before travel begins at 850ms).
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }
  }, [active]);

  const [start, setStart] = useState<{ x: number; y: number } | null>(null);

  // Phase timeline (only once we've measured).
  useEffect(() => {
    if (!active || !box || !start) return;
    const t1 = setTimeout(() => setPhase("travel"), 850);
    const t2 = setTimeout(() => setPhase("fade"), 1700);
    const t3 = setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
      setActive(false);
      onDone?.();
    }, 2180);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [active, box, start, onDone]);

  // Mark played even when skipped, so a later mount in the same tab is consistent.
  useEffect(() => {
    if ((reduce || alreadyPlayed) && typeof sessionStorage !== "undefined") {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
    }
  }, [reduce, alreadyPlayed]);

  if (!active || !box || !start) return null;

  const travelling = phase === "travel" || phase === "fade";

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "fade" ? 0 : 1 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "var(--concrete-50)",
        pointerEvents: phase === "fade" ? "none" : "auto",
      }}
    >
      {/* faint paper grain so the intro shares the hero's material */}
      <div className="grain" style={{ position: "absolute", inset: 0, opacity: 0.5, mixBlendMode: "multiply", pointerEvents: "none" }} />

      <motion.div
        initial={{ x: start.x, y: start.y, scale: box.scale }}
        animate={
          travelling
            ? { x: box.x, y: box.y, scale: 1 }
            : { x: start.x, y: start.y, scale: box.scale }
        }
        transition={{ duration: 0.82, ease: [0.2, 0.8, 0.2, 1] }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transformOrigin: "top left",
          display: "flex",
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 19, // matches the header wordmark; assembly scales it up
          letterSpacing: "-0.02em",
          color: "var(--ink-900)",
          whiteSpace: "nowrap",
          willChange: "transform",
        }}
      >
        {WORD.split("").map((ch, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, x: OFFSETS[i].x, y: OFFSETS[i].y, rotate: OFFSETS[i].r, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1], delay: 0.035 * i }}
            style={{ display: "inline-block" }}
          >
            {ch}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default Preloader;
