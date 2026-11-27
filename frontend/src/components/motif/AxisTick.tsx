/**
 * AxisTick — the signature divider: a hairline rule terminated by a node
 * square, carrying a mono-caps label (drafting axis-tick). Doubles as the
 * section eyebrow. When `live`, the node square goes Signal.
 */
import type { CSSProperties } from "react";
import { Node } from "./Node";

export interface AxisTickProps {
  label?: string;
  index?: string | number; // e.g. "01"
  live?: boolean;
  align?: "start" | "center";
  style?: CSSProperties;
}

export function AxisTick({ label, index, live = false, align = "start", style }: AxisTickProps) {
  return (
    <div
      role="separator"
      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", ...style }}
    >
      {align === "center" && <span style={{ flex: 1, height: 1, background: "var(--hairline)" }} />}
      <Node size={6} signal={live} />
      {(index !== undefined || label) && (
        <span className="mono-caps" style={{ whiteSpace: "nowrap", color: live ? "var(--ink-900)" : "var(--ink-500)" }}>
          {index !== undefined ? `${index}${label ? " — " : ""}` : ""}
          {label}
        </span>
      )}
      <span style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
    </div>
  );
}

export default AxisTick;
