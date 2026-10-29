import * as React from "react";

import { cn } from "./utils";

/*
 * Concrete & Signal input — debossed well.
 * bg concrete-0, deboss shadow, h40, radius-md.
 * Focus = deboss + a neutral ink inner hairline (no blue, no ring rectangle).
 * Error = inset error hairline + aria-invalid.
 */

if (typeof document !== "undefined" && !document.getElementById("an-input-styles")) {
  const s = document.createElement("style");
  s.id = "an-input-styles";
  s.textContent = `
    .an-input::placeholder { color: var(--ink-400); }
    .an-input:focus {
      box-shadow: var(--deboss), inset 0 0 0 1px var(--ink-700);
    }
    .an-input[aria-invalid="true"] {
      box-shadow: var(--deboss), inset 0 0 0 1px var(--error);
    }
    .an-input:disabled { background: var(--concrete-200); color: var(--ink-400); cursor: not-allowed; }
    .an-input { -webkit-font-smoothing: antialiased; }
  `;
  document.head.appendChild(s);
}

function Input({ className, type, style, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn("an-input", className)}
      style={{
        display: "flex",
        height: "40px",
        width: "100%",
        minWidth: 0,
        borderRadius: "var(--radius-md)",
        background: "var(--concrete-0)",
        boxShadow: "var(--deboss)",
        border: "none",
        outline: "none",
        padding: "0 12px",
        fontFamily: "var(--font-body)",
        fontSize: "14px",
        color: "var(--ink-900)",
        transition: "box-shadow var(--dur-1) var(--ease-press)",
        ...style,
      }}
      {...props}
    />
  );
}

export { Input };
