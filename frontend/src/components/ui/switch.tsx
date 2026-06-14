"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch@1.1.3";

import { cn } from "./utils";

/*
 * Concrete & Signal switch.
 * Track: debossed well. When ON: signal-tint-2 background + union nub.
 * Thumb settles with ease-press easing.
 */

function Switch({
  className,
  style,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn("an-switch-root", className)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        width: 36,
        height: 20,
        borderRadius: "var(--radius-pill)",
        background: "var(--concrete-200)",
        boxShadow: "var(--deboss)",
        border: "none",
        outline: "none",
        cursor: "pointer",
        flexShrink: 0,
        padding: "0 2px",
        transition:
          "background var(--dur-2) var(--ease-press), box-shadow var(--dur-1) var(--ease-press)",
        ...style,
      }}
      {...props}
    >
      {/* CSS to flip track color when checked */}
      <style>{`
        .an-switch-root[data-state="checked"] { background: var(--signal-tint-2) !important; box-shadow: var(--deboss), inset 0 0 0 1px var(--signal) !important; }
        .an-switch-root:focus-visible { box-shadow: var(--deboss), 0 0 0 3px var(--focus-ring) !important; }
      `}</style>
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        style={{
          display: "block",
          width: 16,
          height: 16,
          borderRadius: "var(--radius-pill)",
          background: "var(--concrete-0)",
          boxShadow: "var(--emboss)",
          transition:
            "transform var(--dur-2) var(--ease-press)",
          transform: "translateX(0)",
          // Radix handles the translate via data-state via the default translate attrs
        }}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
