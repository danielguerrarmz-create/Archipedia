"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox@1.1.4";
import { Node } from "../motif/Node";

import { cn } from "./utils";

/*
 * Concrete & Signal checkbox — 16px Node-square.
 * Unchecked = concrete-0 debossed well with hairline border.
 * Checked = signal fill + white check (Node language).
 */

function Checkbox({
  className,
  style,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn("an-checkbox", className)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 16,
        height: 16,
        borderRadius: "var(--radius-sm)",
        background: "var(--concrete-0)",
        boxShadow: "var(--deboss), 0 0 0 1px var(--hairline)",
        border: "none",
        outline: "none",
        cursor: "pointer",
        flexShrink: 0,
        transition: "box-shadow var(--dur-1) var(--ease-press), background var(--dur-1) var(--ease-press)",
        ...style,
      }}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {/* Signal-filled node square with white checkmark glyph */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 16,
            height: 16,
            borderRadius: "var(--radius-sm)",
            background: "var(--signal)",
            boxShadow: "var(--emboss)",
          }}
        >
          {/* White check SVG */}
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
            <path d="M1 3.5L3.8 6.5L9 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
