/**
 * EclecticHero — an interactive "pin-up wall". A designer's inspiration board:
 * real precedents pinned with CLEAR glass thumbtacks at playful angles, a fresh
 * random set of projects in a fresh arrangement every refresh, and a DECORATIVE
 * string web between them — the crime-board of connections a designer draws while
 * hunting for meaning between references. Purely communicative: the cards CAN be
 * dragged (the strings follow), but it's the visitor's creative choice.
 *
 * Placement is from a set of DEDICATED, non-overlapping slots — pick 7 of 9 each
 * refresh — so cards never sit on top of one another. The "Press your idea…" note
 * stays put. Mobile reflows to a short static pinned gallery.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { heroBoardPool } from "../../data/heroBoardPrecedents";
import type { HeroPrecedent } from "../../data/heroPrecedents";
import { Pushpin } from "./Pushpin";
import { EASE_PRESS, sanitizeTitle, safeArchitect, clampWords } from "./landingShared";

const N_CARDS = 7;

/* DEDICATED, non-overlapping slots (percent of board + fixed card width). Tuned
   so bounding boxes never intersect; we pick 7 of these 9 each refresh. */
type Slot = { xPct: number; yPct: number; w: number };
const SLOTS: Slot[] = [
  { xPct: 44, yPct: 4, w: 188 },
  { xPct: 64, yPct: 1, w: 168 },
  { xPct: 83, yPct: 7, w: 160 },
  { xPct: 46, yPct: 37, w: 176 },
  { xPct: 66, yPct: 34, w: 190 },
  { xPct: 85, yPct: 40, w: 158 },
  { xPct: 45, yPct: 68, w: 178 },
  { xPct: 65, yPct: 70, w: 164 },
  { xPct: 84, yPct: 68, w: 172 },
];

/* a loose connected web — a chain plus two cross-links → "messy, iterative" */
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [0, 4], [2, 6],
];

type XY = { x: MotionValue<number>; y: MotionValue<number> };

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* a leaning tilt (either direction) so each pin reads 3D, never bolt-upright */
const randTilt = () => (Math.random() < 0.5 ? -1 : 1) * (9 + Math.random() * 16);

export function EclecticHero({
  precedents: _precedents,
  motionOn,
}: {
  precedents: HeroPrecedent[];
  motionOn: boolean;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [canDrag, setCanDrag] = useState(false);

  // fresh slots (7 of 9), projects (7 of pool), rotations + per-pin placement
  // (position along the card top, tilt, size) — all reshuffled every refresh
  const cards = useMemo(() => {
    const slots = shuffle(SLOTS).slice(0, N_CARDS);
    const projects = shuffle(heroBoardPool).slice(0, N_CARDS);
    return slots.map((slot, i) => ({
      slot,
      precedent: projects[i],
      rot: (Math.random() * 2 - 1) * 5,
      pinX: 26 + Math.random() * 48, // % across the card's top edge
      tilt: randTilt(),
      pinSize: 32 + Math.round(Math.random() * 8),
    }));
  }, []);
  // the note's pin also lands somewhere fresh each refresh
  const notePin = useMemo(() => ({ pinX: 36 + Math.random() * 26, tilt: randTilt() }), []);

  // 7 card motion values (flat — fixed count, stable order)
  const c0x = useMotionValue(0), c0y = useMotionValue(0);
  const c1x = useMotionValue(0), c1y = useMotionValue(0);
  const c2x = useMotionValue(0), c2y = useMotionValue(0);
  const c3x = useMotionValue(0), c3y = useMotionValue(0);
  const c4x = useMotionValue(0), c4y = useMotionValue(0);
  const c5x = useMotionValue(0), c5y = useMotionValue(0);
  const c6x = useMotionValue(0), c6y = useMotionValue(0);
  const cardMV: XY[] = [
    { x: c0x, y: c0y }, { x: c1x, y: c1y }, { x: c2x, y: c2y }, { x: c3x, y: c3y },
    { x: c4x, y: c4y }, { x: c5x, y: c5y }, { x: c6x, y: c6y },
  ];

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setCanDrag(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useLayoutEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const toTutorial = () =>
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const toSearch = () => {
    const el = document.getElementById("ready-to-start");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => el?.querySelector("input")?.focus(), 600);
  };

  // thumbtack anchor (board px) for each card — follows the pin's actual spot
  const tackBase = cards.map(({ slot, pinX }) => ({
    x: (slot.xPct / 100) * size.w + (pinX / 100) * slot.w,
    y: (slot.yPct / 100) * size.h + 6,
  }));

  const interactive = canDrag && size.w > 0;

  return (
    <section className="eh-root" aria-label="Archipedia — precedent search for the built environment">
      <div className="grain" aria-hidden style={{ position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none", mixBlendMode: "multiply" }} />
      <div className="eh-grid-bg" aria-hidden />

      <div className="eh-board" ref={boardRef}>
        {/* decorative connection web (desktop) — behind the cards */}
        {interactive && (
          <svg className="eh-strings" aria-hidden>
            {EDGES.map(([a, b], i) => (
              <StringPath key={i} baseA={tackBase[a]} mvA={cardMV[a]} baseB={tackBase[b]} mvB={cardMV[b]} />
            ))}
          </svg>
        )}

        {/* the message — pinned, static */}
        <div className="eh-note">
          <Pushpin size={40} tilt={notePin.tilt} seed={9} style={{ position: "absolute", top: -30, left: `${notePin.pinX}%`, transform: "translateX(-50%)", zIndex: 7 }} />
          <motion.div
            className="eh-note-inner"
            initial={motionOn ? { opacity: 0, y: 16, rotate: -1.5, scale: 0.98 } : false}
            animate={{ opacity: 1, y: 0, rotate: -1.5, scale: 1 }}
            transition={motionOn ? { duration: 0.55, ease: EASE_PRESS, delay: 0.15 } : { duration: 0 }}
          >
            <h1 className="eh-note-head">
              Press your idea against <span className="editorial-em">everything</span> ever designed.
            </h1>
            <p className="eh-note-sub">
              Precedent search for everyone shaping the built environment — architecture,
              landscape, urbanism. Pin up what you're chasing and find what it really resembles.
            </p>
            <div className="eh-actions">
              <button type="button" className="eh-scroll" onClick={toTutorial}>
                <span>See how it works</span>
                <motion.span
                  className="eh-scroll-chev"
                  animate={motionOn ? { y: [0, 4, 0] } : {}}
                  transition={motionOn ? { duration: 1.6, ease: "easeInOut", repeat: Infinity } : {}}
                >
                  <ChevronDown size={16} strokeWidth={2.25} />
                </motion.span>
              </button>
              <button type="button" className="eh-skip" onClick={toSearch}>
                or skip to search
              </button>
            </div>
          </motion.div>
        </div>

        {/* pinned precedents — decorative illustration; content is available
            via ProofStrip and search results, so each card is aria-hidden */}
        {cards.map(({ slot, precedent, rot, pinX, tilt, pinSize }, i) => (
          <PinCard
            key={`${precedent.id}-${i}`}
            index={i}
            slot={slot}
            rot={rot}
            pinX={pinX}
            tilt={tilt}
            pinSize={pinSize}
            size={size}
            mv={cardMV[i]}
            precedent={precedent}
            motionOn={motionOn}
            canDrag={interactive}
            boardRef={boardRef}
          />
        ))}
      </div>

      <style>{`
        .eh-root {
          position: relative; overflow: hidden;
          background: radial-gradient(118% 92% at 28% 6%, #f2f3f3 0%, #e8e9e9 50%, #dddede 100%);
          padding: clamp(28px, 4vh, 52px) 0;
        }
        .eh-grid-bg {
          position: absolute; inset: 0; pointer-events: none; opacity: 0.42;
          background-image:
            linear-gradient(rgba(21,22,26,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(21,22,26,0.045) 1px, transparent 1px);
          background-size: 30px 30px, 30px 30px;
          -webkit-mask-image: radial-gradient(120% 100% at 50% 45%, #000 55%, transparent 100%);
          mask-image: radial-gradient(120% 100% at 50% 45%, #000 55%, transparent 100%);
        }
        .eh-board {
          position: relative; z-index: 2;
          width: 100%; max-width: var(--container-max); margin: 0 auto;
          padding: 0 clamp(20px, 5vw, 48px);
          display: flex; flex-direction: column; gap: 26px; align-items: center;
        }
        .eh-strings { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; z-index: 1; pointer-events: none; }

        /* ── note ───────────────────────────────────────────────────────── */
        .eh-note { position: relative; width: 100%; max-width: 440px; z-index: 6; }
        .eh-note-inner {
          position: relative; background: var(--concrete-0); padding: clamp(22px, 3vw, 32px);
          box-shadow: 0 1px 1px rgba(21,22,26,0.05), 0 18px 40px -16px rgba(21,22,26,0.32), 0 0 0 1px var(--hairline);
        }
        .eh-note-head {
          font-family: var(--font-display); font-weight: 680;
          font-size: clamp(26px, 3vw, 38px); letter-spacing: -0.026em; line-height: 1.0;
          color: var(--ink-900); margin: 0 0 14px; text-wrap: balance;
        }
        .eh-note-head .editorial-em { font-weight: 480; font-variation-settings: "opsz" 144, "SOFT" 6, "WONK" 1; font-size: 1.06em; }
        .eh-note-sub {
          font-family: var(--font-body); font-weight: 400; font-size: clamp(14px, 1.3vw, 15.5px);
          line-height: 1.55; color: var(--ink-700); margin: 0 0 22px; max-width: 40ch;
        }
        .eh-actions { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
        .eh-scroll {
          display: inline-flex; align-items: center; gap: 10px; padding: 11px 18px; cursor: pointer;
          background: var(--ink-900); color: var(--concrete-0); border: none; border-radius: var(--radius-sm);
          font-family: var(--font-body); font-size: 14px; font-weight: 600;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.14), 0 1px 2px rgba(21,22,26,0.45), 0 0 0 1px rgba(21,22,26,0.35);
          transition: transform var(--dur-1) var(--ease-press), background var(--dur-1) var(--ease-press), box-shadow var(--dur-1) var(--ease-press);
        }
        .eh-scroll:hover { background: #000; box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 4px rgba(21,22,26,0.5), 0 0 0 1px rgba(21,22,26,0.45); }
        .eh-scroll:active { transform: translateY(1px); box-shadow: inset 0 1px 2px rgba(0,0,0,0.5); }
        .eh-scroll:focus-visible {
          outline: none;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.14), 0 1px 2px rgba(21,22,26,0.45), 0 0 0 1px rgba(21,22,26,0.35), 0 0 0 3px var(--focus-ring);
        }
        .eh-scroll-chev { display: inline-flex; }
        .eh-skip {
          background: none; border: none; padding: 4px 0; cursor: pointer;
          font-family: var(--font-body); font-size: 13.5px; font-weight: 500; color: var(--ink-500);
          text-underline-offset: 3px; text-decoration: underline; text-decoration-color: var(--hairline-strong);
          transition: color var(--dur-1) var(--ease-press);
        }
        .eh-skip:hover { color: var(--ink-900); }
        .eh-skip:focus-visible {
          outline: none;
          border-radius: var(--radius-sm);
          box-shadow: 0 0 0 2px var(--focus-ring);
        }

        /* ── cards ──────────────────────────────────────────────────────── */
        .eh-card {
          width: var(--cw, 180px); margin: 0; position: relative; z-index: 5;
          background: var(--concrete-0); padding: 8px;
          box-shadow: 0 1px 1px rgba(21,22,26,0.06), 0 12px 26px -12px rgba(21,22,26,0.3), 0 0 0 1px var(--hairline);
        }
        /* mobile: deliberate static pinned mini-board */
        @media (max-width: 767px) {
          .eh-card:nth-of-type(n+3) { display: none; }
          .eh-board { display: flex; flex-direction: column; align-items: center; gap: 30px; padding-top: 32px; }
          .eh-card { position: relative; --cw: clamp(132px, 40vw, 168px); }
          .eh-card:nth-of-type(1) { transform: rotate(-3deg); margin-right: -18px; z-index: 5; }
          .eh-card:nth-of-type(2) { transform: rotate(2.5deg); margin-top: 22px; z-index: 4; }
          .eh-scroll { padding: 13px 18px; }
          .eh-skip { padding: 13px 0; }
        }
        @media (min-width: 768px) {
          /* Fill the viewport (minus the 60px sticky top bar) so the proof-strip
             below the hero stays off-screen on first paint, even on tall displays. */
          .eh-root { display: flex; align-items: center; min-height: calc(100svh - 60px); }
          .eh-board { display: block; height: min(82svh, 720px); }
          .eh-note { position: absolute; left: clamp(20px,5vw,48px); top: 50%; transform: translateY(-50%); width: 420px; }
          .eh-card { position: absolute; cursor: grab; }
          .eh-card:active { cursor: grabbing; }
        }
      `}</style>
    </section>
  );
}

/* One decorative thread between two pinned cards. Reads the live motion values
   so it follows dragging without per-frame React renders. */
function StringPath({ baseA, mvA, baseB, mvB }: { baseA: { x: number; y: number }; mvA: XY; baseB: { x: number; y: number }; mvB: XY }) {
  const d = useTransform([mvA.x, mvA.y, mvB.x, mvB.y], (vals) => {
    const [ax, ay, bx, by] = vals as number[];
    const x1 = baseA.x + ax, y1 = baseA.y + ay;
    const x2 = baseB.x + bx, y2 = baseB.y + by;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2 + 26; // gravity sag, like real pinned thread
    return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  });
  return <motion.path d={d} fill="none" stroke="rgba(21,22,26,0.30)" strokeWidth={1.1} strokeLinecap="round" />;
}

function PinCard({
  index,
  slot,
  rot,
  pinX,
  tilt,
  pinSize,
  size,
  mv,
  precedent,
  motionOn,
  canDrag,
  boardRef,
}: {
  index: number;
  slot: Slot;
  rot: number;
  pinX: number;
  tilt: number;
  pinSize: number;
  size: { w: number; h: number };
  mv: XY;
  precedent: HeroPrecedent;
  motionOn: boolean;
  canDrag: boolean;
  boardRef: React.RefObject<HTMLDivElement>;
}) {
  const [errored, setErrored] = useState(false);
  const desktopPos = canDrag ? { left: (slot.xPct / 100) * size.w, top: (slot.yPct / 100) * size.h } : {};

  return (
    <motion.figure
      className="eh-card"
      aria-hidden="true"
      style={{ "--cw": `${slot.w}px`, x: mv.x, y: mv.y, ...desktopPos } as React.CSSProperties}
      drag={canDrag}
      dragConstraints={boardRef}
      dragElastic={0.12}
      dragMomentum={false}
      initial={motionOn ? { opacity: 0, scale: 0.96, rotate: rot * 0.5 } : false}
      animate={{ opacity: 1, scale: 1, rotate: rot }}
      transition={motionOn ? { duration: 0.55, ease: EASE_PRESS, delay: 0.28 + index * 0.07 } : { duration: 0 }}
      whileHover={canDrag ? { rotate: 0, scale: 1.04, zIndex: 40 } : undefined}
      whileDrag={{ rotate: 0, scale: 1.06, zIndex: 60 }}
    >
      <Pushpin size={pinSize} tilt={tilt} seed={index + 1} style={{ position: "absolute", top: -(pinSize * 0.74), left: `${pinX}%`, transform: "translateX(-50%)", zIndex: 8 }} />
      <div style={{ position: "relative", aspectRatio: "4 / 3", overflow: "hidden", background: "var(--concrete-200)" }}>
        {!errored ? (
          <img
            src={precedent.thumb}
            alt={sanitizeTitle(precedent.title)}
            loading={index < 2 ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
            onError={() => setErrored(true)}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            <span className="mono-meta" style={{ color: "var(--ink-400)" }}>no image</span>
          </div>
        )}
      </div>
      <figcaption style={{ padding: "8px 4px 2px" }}>
        <span style={{ display: "block", fontFamily: "var(--font-display)", fontWeight: 650, fontSize: 12.5, lineHeight: 1.15, letterSpacing: "-0.01em", color: "var(--ink-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {clampWords(precedent.title, 4)}
        </span>
        {/* ink-700 on concrete-0 (card bg) is ~10.5:1 — passes at this small size */}
        <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ink-700)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {safeArchitect(precedent.architect)} · {precedent.country || "—"}
        </span>
      </figcaption>
    </motion.figure>
  );
}

export default EclecticHero;
