/**
 * Node — the brand's atomic mark: a filled (or hollow) square.
 * Represents a building / precedent / point in the precedent graph.
 */
import type { CSSProperties } from "react";

export interface NodeProps {
  size?: number;
  filled?: boolean;
  signal?: boolean;
  color?: string;
  style?: CSSProperties;
  title?: string;
}

export function Node({ size = 8, filled = true, signal = false, color, style, title }: NodeProps) {
  const ink = color ?? (signal ? "var(--signal)" : "var(--ink-700)");
  return (
    <span
      role={title ? "img" : undefined}
      aria-label={title}
      title={title}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "var(--radius-sm)",
        background: filled ? ink : "transparent",
        boxShadow: filled ? undefined : `inset 0 0 0 1.5px ${ink}`,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

export default Node;
