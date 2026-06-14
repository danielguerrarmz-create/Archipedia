/**
 * Connector — a 1.5px hairline line joining nodes. A relationship.
 * Horizontal by default; pass vertical for stacks.
 */
import type { CSSProperties } from "react";

export interface ConnectorProps {
  length?: number | string;
  vertical?: boolean;
  active?: boolean;
  style?: CSSProperties;
}

export function Connector({ length = 24, vertical = false, active = false, style }: ConnectorProps) {
  const color = active ? "var(--signal)" : "var(--hairline-strong)";
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        background: color,
        width: vertical ? 1.5 : length,
        height: vertical ? length : 1.5,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

export default Connector;
