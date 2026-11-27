import * as React from "react";
import { Node } from "../motif/Node";

/*
 * Chip — mono, radius-sm, concrete-100 + hairline.
 * Selected = signal-tint + leading Node (signal).
 * Unselected = concrete-100 + hairline, no leading node.
 */

export interface ChipProps extends React.ComponentProps<"button"> {
  selected?: boolean;
  label: string;
}

export function Chip({ selected = false, label, style, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      data-slot="chip"
      data-selected={selected || undefined}
      aria-pressed={selected}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: "var(--radius-sm)",
        background: selected ? "var(--signal-tint)" : "var(--concrete-100)",
        boxShadow: selected
          ? `0 0 0 1px var(--signal-tint-2)`
          : `0 0 0 1px var(--hairline)`,
        border: "none",
        cursor: "pointer",
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "0.06em",
        color: selected ? "var(--signal-deep)" : "var(--ink-700)",
        whiteSpace: "nowrap",
        transition:
          "background var(--dur-1) var(--ease-press), box-shadow var(--dur-1) var(--ease-press), color var(--dur-1) var(--ease-press)",
        ...style,
      }}
      {...props}
    >
      {selected && <Node size={6} signal />}
      {label}
    </button>
  );
}

export default Chip;
