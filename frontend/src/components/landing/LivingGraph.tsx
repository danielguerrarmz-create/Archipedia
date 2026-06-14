/**
 * LivingGraph — the hero centerpiece. A self-assembling precedent graph drawn
 * over real architecture on the DARK studio ground: node-squares + real building
 * plates joined by right-angle step connectors ending in union nubs. viewBox
 * 640×560.
 *
 * The whole graph is rendered in STONE/ink — NO Signal blue. Klein-blue is
 * reserved for the one primary action (the search field), so the graph reads as
 * a precise architectural wiring diagram, not a scatter of accent dots.
 *
 * Choreography (motionOn): nodes settle (scale .6→1), each connector draws
 * (pathLength) once both endpoints have landed, union nubs press in as the path
 * completes, image plates "develop" in (deboss + fade + scale 1.04→1). Reduced
 * motion renders fully assembled.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import type { HeroPrecedent } from "../../data/heroPrecedents";
import { sanitizeTitle, EASE_PRESS } from "./landingShared";

interface PlateDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  precedent: HeroPrecedent;
  plane: 0 | 1 | 2; // depth plane: 0 = front, 2 = back (recedes)
  developAt: number;
}
interface DotDef { id: string; x: number; y: number; landAt: number }
interface EdgeDef { id: string; d: string; ux: number; uy: number; drawAt: number }

const DOT = 12;
const HALF = DOT / 2;

const DOTS: DotDef[] = [
  { id: "d1", x: 96, y: 96, landAt: 380 },
  { id: "d2", x: 312, y: 72, landAt: 460 },
  { id: "d3", x: 528, y: 168, landAt: 540 },
  { id: "d4", x: 168, y: 312, landAt: 620 },
  { id: "d5", x: 432, y: 360, landAt: 700 },
  { id: "d6", x: 288, y: 480, landAt: 780 },
];

const dc = (d: DotDef) => ({ x: d.x + HALF, y: d.y + HALF });

export function LivingGraph({
  precedents,
  motionOn,
}: {
  precedents: HeroPrecedent[];
  motionOn: boolean;
  /** retained for call-site compatibility; the graph no longer needs them */
  resolved?: boolean;
  armToken?: number;
}) {
  // image plates across depth planes; use later manifest entries so the graph
  // never repeats the large hero subject (precedents[0]) beside it.
  const pick = (i: number) => precedents[i % precedents.length];
  const PLATES: PlateDef[] = [
    { id: "pl1", x: 264, y: 168, w: 168, h: 112, precedent: pick(4), plane: 0, developAt: 900 },
    { id: "pl2", x: 432, y: 264, w: 144, h: 96, precedent: pick(7), plane: 1, developAt: 1200 },
    { id: "pl3", x: 120, y: 384, w: 132, h: 88, precedent: pick(9), plane: 2, developAt: 1500 },
  ];

  const pc = (p: PlateDef) => ({ x: p.x + p.w / 2, y: p.y + p.h / 2 });

  const c0 = dc(DOTS[0]);
  const c1 = dc(DOTS[1]);
  const c2 = dc(DOTS[2]);
  const c3 = dc(DOTS[3]);
  const c4 = dc(DOTS[4]);
  const c5 = dc(DOTS[5]);
  const p0 = pc(PLATES[0]);
  const p1 = pc(PLATES[1]);
  const p2 = pc(PLATES[2]);

  const EDGES: EdgeDef[] = [
    { id: "e1", d: `M${c0.x} ${c0.y} V${p0.y} H${p0.x - PLATES[0].w / 2}`, ux: p0.x - PLATES[0].w / 2, uy: p0.y, drawAt: 900 },
    { id: "e2", d: `M${p0.x} ${p0.y - PLATES[0].h / 2} V${c1.y} H${c1.x}`, ux: c1.x, uy: c1.y, drawAt: 1000 },
    { id: "e3", d: `M${c1.x} ${c1.y} H${c2.x} V${c2.y}`, ux: c2.x, uy: c2.y, drawAt: 1100 },
    { id: "e4", d: `M${p0.x + PLATES[0].w / 2} ${p0.y} H${p1.x - PLATES[1].w / 2}`, ux: p1.x - PLATES[1].w / 2, uy: p1.y, drawAt: 1200 },
    { id: "e5", d: `M${c3.x} ${c3.y} V${p2.y} H${p2.x - PLATES[2].w / 2}`, ux: p2.x - PLATES[2].w / 2, uy: p2.y, drawAt: 1300 },
    { id: "e6", d: `M${p1.x} ${p1.y + PLATES[1].h / 2} V${c4.y} H${c4.x}`, ux: c4.x, uy: c4.y, drawAt: 1400 },
    { id: "e7", d: `M${c4.x} ${c4.y} V${c5.y} H${c5.x}`, ux: c5.x, uy: c5.y, drawAt: 1500 },
  ];

  return (
    <svg
      viewBox="0 0 640 560"
      width="100%"
      height="100%"
      fill="none"
      aria-hidden
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        {PLATES.map((p) => (
          <clipPath key={`clip-${p.id}`} id={`clip-${p.id}`}>
            <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={4} />
          </clipPath>
        ))}
        <filter id="plateCast" x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="-10" dy="16" stdDeviation="16" floodColor="#000" floodOpacity="0.55" />
        </filter>
        <filter id="planeBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>

      {EDGES.map((e) => (
        <Edge key={e.id} edge={e} motionOn={motionOn} />
      ))}

      {DOTS.map((d) => (
        <NodeSquare key={d.id} dot={d} motionOn={motionOn} />
      ))}

      {[...PLATES].sort((a, b) => b.plane - a.plane).map((p) => (
        <ImagePlate key={p.id} plate={p} motionOn={motionOn} />
      ))}

      {EDGES.map((e) => (
        <UnionNub key={e.id} u={e} motionOn={motionOn} />
      ))}
    </svg>
  );
}

function Edge({ edge, motionOn }: { edge: EdgeDef; motionOn: boolean }) {
  return (
    <motion.path
      d={edge.d}
      stroke="var(--studio-line-strong)"
      strokeWidth={1.5}
      strokeLinecap="square"
      initial={motionOn ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={
        motionOn
          ? { pathLength: { duration: 0.42, ease: EASE_PRESS, delay: edge.drawAt / 1000 }, opacity: { duration: 0.001, delay: edge.drawAt / 1000 } }
          : { duration: 0 }
      }
    />
  );
}

function NodeSquare({ dot, motionOn }: { dot: DotDef; motionOn: boolean }) {
  return (
    <motion.rect
      x={dot.x}
      y={dot.y}
      width={DOT}
      height={DOT}
      rx={2}
      fill="var(--studio-stone)"
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
      initial={motionOn ? { scale: 0.6, opacity: 0 } : { scale: 1, opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={motionOn ? { duration: 0.2, ease: EASE_PRESS, delay: dot.landAt / 1000 } : { duration: 0 }}
    />
  );
}

function ImagePlate({ plate, motionOn }: { plate: PlateDef; motionOn: boolean }) {
  const p = plate.precedent;
  const [errored, setErrored] = useState(false);
  const delay = plate.developAt / 1000;
  const planeScale = plate.plane === 0 ? 1 : plate.plane === 1 ? 0.96 : 0.9;
  const planeFilter = plate.plane === 2 ? "url(#planeBlur)" : undefined;
  const planeOpacity = plate.plane === 2 ? 0.82 : 1;

  return (
    <g filter="url(#plateCast)" style={{ opacity: planeOpacity }}>
      <rect x={plate.x} y={plate.y} width={plate.w} height={plate.h} rx={4} fill="var(--studio-ground-deep)" />
      {!errored && p?.thumb && (
        <motion.image
          href={p.thumb}
          x={plate.x}
          y={plate.y}
          width={plate.w}
          height={plate.h}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#clip-${plate.id})`}
          filter={planeFilter}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          initial={motionOn ? { opacity: 0, scale: 1.04 } : { opacity: planeOpacity, scale: planeScale }}
          animate={{ opacity: planeOpacity, scale: planeScale }}
          transition={motionOn ? { duration: 0.42, ease: EASE_PRESS, delay } : { duration: 0 }}
          onError={() => setErrored(true)}
        >
          <title>{sanitizeTitle(p.title)}</title>
        </motion.image>
      )}
      <motion.rect
        x={plate.x + 0.5}
        y={plate.y + 0.5}
        width={plate.w - 1}
        height={plate.h - 1}
        rx={4}
        fill="none"
        stroke="var(--studio-line-strong)"
        strokeWidth={1}
        initial={motionOn ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={motionOn ? { duration: 0.22, delay } : { duration: 0 }}
      />
    </g>
  );
}

function UnionNub({ u, motionOn }: { u: EdgeDef; motionOn: boolean }) {
  return (
    <motion.rect
      x={u.ux - 2}
      y={u.uy - 2}
      width={4}
      height={4}
      rx={1}
      fill="var(--studio-stone)"
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
      initial={motionOn ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={motionOn ? { duration: 0.22, ease: EASE_PRESS, delay: (u.drawAt + 380) / 1000 } : { duration: 0 }}
    />
  );
}

export default LivingGraph;
