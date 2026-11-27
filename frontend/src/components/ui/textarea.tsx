import * as React from "react";

import { cn } from "./utils";

/*
 * Concrete & Signal textarea — debossed well, same rules as Input.
 */

// Style injector (idempotent via selector collision)
if (typeof document !== "undefined") {
  if (!document.getElementById("an-textarea-styles")) {
    const s = document.createElement("style");
    s.id = "an-textarea-styles";
    s.textContent = `
      .an-textarea::placeholder { color: var(--ink-400); }
      .an-textarea:focus {
        box-shadow: var(--deboss), inset 0 0 0 1px var(--ink-700);
      }
      .an-textarea[aria-invalid="true"] {
        box-shadow: var(--deboss), inset 0 0 0 1px var(--error);
      }
      .an-textarea:disabled { background: var(--concrete-200); color: var(--ink-400); cursor: not-allowed; }
    `;
    document.head.appendChild(s);
  }
}

function Textarea({ className, style, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn("an-textarea", className)}
      style={{
        display: "flex",
        minHeight: "80px",
        width: "100%",
        borderRadius: "var(--radius-md)",
        background: "var(--concrete-0)",
        boxShadow: "var(--deboss)",
        border: "none",
        outline: "none",
        padding: "10px 12px",
        fontFamily: "var(--font-body)",
        fontSize: "14px",
        color: "var(--ink-900)",
        resize: "vertical",
        transition: "box-shadow var(--dur-1) var(--ease-press)",
        ...style,
      }}
      {...props}
    />
  );
}

export { Textarea };
