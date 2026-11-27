/**
 * Union — the 3px nub where a connector meets a node: a confirmed connection.
 * The one resting place (besides the stamp) where Signal may sit.
 */
import type { CSSProperties } from "react";

export interface UnionProps {
  confirmed?: boolean;
  size?: number;
  style?: CSSProperties;
}

export function Union({ confirmed = true, size = 4, style }: UnionProps) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "var(--radius-sm)",
        background: confirmed ? "var(--signal)" : "var(--ink-700)",
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

export default Union;
