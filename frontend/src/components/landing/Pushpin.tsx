/**
 * Pushpin — a CLEAR (colourless) glass thumbtack, drawn with a slight tilt and a
 * cast shadow so it reads as a 3D object pressed into the surface. Shared across
 * the whole home page so the "pin-up" motif is consistent. No colour — just
 * glass: white speculars over a translucent grey body.
 */
import { useId } from "react";

export function Pushpin({
  size = 36,
  tilt = -20,
  className,
  style,
}: {
  size?: number;
  tilt?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const uid = useId().replace(/:/g, "");
  const head = `pp-head-${uid}`;
  const pin = `pp-pin-${uid}`;
  const shadow = `pp-sh-${uid}`;

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
        <radialGradient id={head} cx="38%" cy="29%" r="72%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="30%" stopColor="#ffffff" stopOpacity="0.52" />
          <stop offset="66%" stopColor="#d2dade" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#828e98" stopOpacity="0.5" />
        </radialGradient>
        <linearGradient id={pin} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f1f4f6" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#97a1aa" stopOpacity="0.62" />
        </linearGradient>
        <filter id={shadow} x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="2" dy="3.4" stdDeviation="2.1" floodColor="#15161a" floodOpacity="0.30" />
        </filter>
      </defs>

      <g filter={`url(#${shadow})`} transform={`rotate(${tilt} 24 26)`}>
        {/* metal pin */}
        <path d="M23 26 L25.4 50 L22 50 Z" fill={`url(#${pin})`} stroke="rgba(118,128,138,0.45)" strokeWidth="0.5" />
        {/* collar under the head */}
        <ellipse cx="24" cy="27" rx="7.4" ry="3.5" fill="rgba(190,201,210,0.5)" />
        <ellipse cx="24" cy="25.6" rx="7.2" ry="3.1" fill="rgba(255,255,255,0.4)" />
        {/* glass head */}
        <circle cx="24" cy="17" r="14" fill={`url(#${head})`} stroke="rgba(255,255,255,0.55)" strokeWidth="0.7" />
        {/* lower-right volume shade */}
        <ellipse cx="29.5" cy="22.5" rx="7.5" ry="6" fill="rgba(110,122,134,0.16)" />
        {/* speculars */}
        <ellipse cx="18.4" cy="11" rx="4.3" ry="2.7" fill="#ffffff" opacity="0.92" transform="rotate(-28 18.4 11)" />
        <circle cx="29.2" cy="21.5" r="1.7" fill="#ffffff" opacity="0.5" />
      </g>
    </svg>
  );
}

export default Pushpin;
