"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group@1.2.3";

import { cn } from "./utils";

/*
 * Concrete & Signal radio — dot inside debossed well.
 * Checked = signal dot.
 */

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  style,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn("an-radio", className)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 16,
        height: 16,
        borderRadius: "var(--radius-pill)",
        background: "var(--concrete-0)",
        boxShadow: "var(--deboss), 0 0 0 1px var(--hairline)",
        border: "none",
        outline: "none",
        cursor: "pointer",
        flexShrink: 0,
        transition: "box-shadow var(--dur-1) var(--ease-press)",
        ...style,
      }}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {/* Signal dot */}
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "var(--radius-pill)",
            background: "var(--signal)",
            flexShrink: 0,
          }}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
