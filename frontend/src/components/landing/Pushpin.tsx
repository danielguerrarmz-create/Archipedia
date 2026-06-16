/**
 * Pushpin — a CLEAR (colourless) glass thumbtack, drawn with a slight tilt and a
 * cast shadow so it reads as a 3D object pressed into the surface. Shared across
 * the whole home page so the "pin-up" motif is consistent. No colour — just
 * glass: white speculars over a translucent grey body.
 *
 * Each pin can be given a deterministic `seed` (integer) to vary its head shape,
 * specular placement, shaft length/lean and perceived viewing angle, so a wall of
 * pins doesn't look stamped. Variation is computed purely from the seed (no
 * Math.random, so SSR / reduced-motion output stays deterministic). `seed`
 * defaults to 0, which reproduces a clean, canonical pin — so the existing call
 * sites that pass only `size` / `tilt` / `style` are unaffected.
 */
import { useId } from "react";

export function Pushpin({
  size = 36,
  tilt = -20,
  seed = 0,
  className,
  style,
}: {
  size?: number;
  tilt?: number;
  /** Integer used to deterministically vary this pin's geometry & lighting. */
  seed?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const uid = useId().replace(/:/g, "");
  const head = `pp-head-${uid}`;
  const fill = `pp-fill-${uid}`;
  const pin = `pp-pin-${uid}`;
  const collar = `pp-collar-${uid}`;
  const shadow = `pp-sh-${uid}`;
  const contact = `pp-ct-${uid}`;

  // --- deterministic per-pin variation -------------------------------------
  // A tiny seeded hash → several pseudo-random but stable values in [0, 1).
  // Same seed always yields the same pin (SSR-safe, reduced-motion-safe).
  const v = (n: number) => {
    const x = Math.sin((seed + 1) * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x); // fractional part, in [0, 1)
  };

  // Head shape: slightly rounder vs. slightly ovoid, and a hair of size jitter.
  const rx = 14 + (v(1) - 0.5) * 1.6; // ~13.2 .. 14.8
  const ry = 14 - (v(2) - 0.5) * 1.7; // ~13.2 .. 14.8 (ovoid when rx != ry)
  // Perceived viewing angle: nudges the head off the shaft axis so different
  // pins look tipped toward/away from the viewer.
  const headDX = (v(3) - 0.5) * 2.6; // -1.3 .. 1.3
  const headDY = (v(4) - 0.5) * 1.4; // -0.7 .. 0.7
  // Key specular placement walks around the upper glass as the angle changes.
  const specAngle = -34 + (v(5) - 0.5) * 36; // ~ -52 .. -16 deg
  const specR = 9.6 + (v(6) - 0.5) * 1.4;
  const sx = 24 + headDX + Math.cos((specAngle * Math.PI) / 180) * specR;
  const sy = 17 + headDY + Math.sin((specAngle * Math.PI) / 180) * specR - 1.5;
  // Fill (softer, bounced) highlight on the opposite shoulder.
  const fxA = specAngle + 150 + (v(7) - 0.5) * 24;
  const fx = 24 + headDX + Math.cos((fxA * Math.PI) / 180) * 7.4;
  const fy = 17 + headDY + Math.sin((fxA * Math.PI) / 180) * 6.0 + 0.5;
  // Gradient light source on the head follows the key highlight.
  const gcx = 38 + (v(5) - 0.5) * 18; // %
  const gcy = 26 + (v(4) - 0.5) * 8; // %
  // Shaft: length + a small independent lean so pins sit at varied attitudes.
  const shaftLen = 24 + (v(8) - 0.5) * 5; // ~21.5 .. 26.5
  const shaftLean = (v(9) - 0.5) * 3.4; // px the tip drifts sideways
  const tipX = 23.7 + shaftLean;
  const tipY = 26 + shaftLen;
  // Collar centred under the (possibly offset) head.
  const cx = 24 + headDX * 0.5;

  return (
    <svg
      width={size}
      height={size * 1.16}
      viewBox="0 0 48 56"
      fill="none"
      className={className}
      style={style}
      aria-hidden
    >
      <defs>
        {/* glass head body — light source tracks the key highlight */}
        <radialGradient id={head} cx={`${gcx}%`} cy={`${gcy}%`} r="74%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.99" />
          <stop offset="26%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="58%" stopColor="#dde3e7" stopOpacity="0.34" />
          <stop offset="82%" stopColor="#aab4bc" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#727e88" stopOpacity="0.62" />
        </radialGradient>
        {/* caustic / edge-light pooled on the lower rim of the glass */}
        <radialGradient id={fill} cx="50%" cy="84%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="72%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
        </radialGradient>
        {/* metal pin shaft — brushed steel gradient across its width */}
        <linearGradient id={pin} x1="0" y1="0" x2="1" y2="0.15">
          <stop offset="0%" stopColor="#7f8a93" stopOpacity="0.78" />
          <stop offset="32%" stopColor="#fbfdfe" stopOpacity="0.96" />
          <stop offset="55%" stopColor="#d7dde1" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#79848d" stopOpacity="0.72" />
        </linearGradient>
        {/* polished collar ring */}
        <linearGradient id={collar} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#cfd7dc" stopOpacity="0.62" />
          <stop offset="100%" stopColor="#8d99a2" stopOpacity="0.7" />
        </linearGradient>
        {/* cast shadow — stronger so the pin reads as pressed into the wall */}
        <filter id={shadow} x="-70%" y="-70%" width="260%" height="260%">
          <feDropShadow dx="2.4" dy="4.2" stdDeviation="2.7" floodColor="#101116" floodOpacity="0.40" />
        </filter>
        {/* tight ambient-occlusion contact shadow where shaft meets the card */}
        <radialGradient id={contact} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0e0f13" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#0e0f13" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#0e0f13" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g transform={`rotate(${tilt} 24 26)`}>
        {/* AO contact pool around the entry point (under everything, no shadow filter) */}
        <ellipse cx={tipX} cy={tipY - 0.5} rx="3.2" ry="1.5" fill={`url(#${contact})`} />

        <g filter={`url(#${shadow})`}>
          {/* metal pin shaft */}
          <path
            d={`M22.1 25.5 L${tipX} ${tipY} L${(22.1 + 25.6) / 2 + shaftLean * 0.4} ${tipY - 0.3} L25.6 25.5 Z`}
            fill={`url(#${pin})`}
            stroke="rgba(95,105,115,0.5)"
            strokeWidth="0.45"
          />
          {/* bright spine highlight on the shaft */}
          <path d={`M24 26 L${24 + shaftLean * 0.7} ${tipY - 1.2}`} stroke="#ffffff" strokeOpacity="0.7" strokeWidth="0.7" strokeLinecap="round" />

          {/* polished collar under the head */}
          <ellipse cx={cx} cy="27.4" rx="7.6" ry="3.6" fill={`url(#${collar})`} />
          <ellipse cx={cx} cy="25.8" rx="7.3" ry="3.1" fill="rgba(255,255,255,0.5)" />
          {/* AO seam where the collar tucks under the glass */}
          <ellipse cx={cx} cy="24.2" rx="6.4" ry="2.0" fill="rgba(90,102,114,0.22)" />

          {/* glass head */}
          <ellipse
            cx={24 + headDX}
            cy={17 + headDY}
            rx={rx}
            ry={ry}
            fill={`url(#${head})`}
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="0.7"
          />
          {/* lower-right volume shade for roundness */}
          <ellipse cx={24 + headDX + 5.5} cy={17 + headDY + 5.5} rx="7.8" ry="6.2" fill="rgba(104,116,128,0.18)" />
          {/* caustic / edge light pooled on the lower rim */}
          <ellipse cx={24 + headDX} cy={17 + headDY} rx={rx} ry={ry} fill={`url(#${fill})`} />

          {/* key specular */}
          <ellipse
            cx={sx}
            cy={sy}
            rx="4.6"
            ry="2.7"
            fill="#ffffff"
            opacity="0.95"
            transform={`rotate(${specAngle} ${sx} ${sy})`}
          />
          {/* soft fill highlight on the opposite shoulder */}
          <ellipse cx={fx} cy={fy} rx="3.2" ry="2.2" fill="#ffffff" opacity="0.4" />
          {/* tiny sparkle where the key highlight peaks */}
          <circle cx={sx - 0.6} cy={sy - 0.8} r="1.0" fill="#ffffff" opacity="0.95" />
          {/* refracted pinpoint near the lower rim */}
          <circle cx={24 + headDX + 5} cy={17 + headDY + 4} r="1.5" fill="#ffffff" opacity="0.45" />
        </g>
      </g>
    </svg>
  );
}

export default Pushpin;
