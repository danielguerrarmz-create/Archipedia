/**
 * NodeField — sparse empty-state art: a few nodes connected by hairline
 * connectors with one confirmed (signal) union. "Press a precedent to make
 * the first connection." Decorative; aria-hidden.
 */
import type { CSSProperties } from "react";

export interface NodeFieldProps {
  width?: number;
  height?: number;
  style?: CSSProperties;
}

export function NodeField({ width = 220, height = 120, style }: NodeFieldProps) {
  const ink = "var(--ink-300)";
  const wire = "var(--hairline-strong)";
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 220 120"
      fill="none"
      aria-hidden
      style={{ display: "block", opacity: 0.9, ...style }}
    >
      {/* connectors (step routing) */}
      <path d="M40 40 H100 V72 H150" stroke={wire} strokeWidth="1.5" />
      <path d="M40 88 H100" stroke={wire} strokeWidth="1.5" />
      {/* nodes */}
      <rect x="34" y="34" width="12" height="12" rx="2" fill={ink} />
      <rect x="34" y="82" width="12" height="12" rx="2" fill={ink} />
      <rect x="94" y="66" width="12" height="12" rx="2" fill={ink} />
      <rect x="144" y="66" width="12" height="12" rx="2" fill="var(--ink-400)" />
      {/* one confirmed union, in signal */}
      <rect x="148" y="70" width="4" height="4" rx="1" fill="var(--signal)" />
    </svg>
  );
}

export default NodeField;
