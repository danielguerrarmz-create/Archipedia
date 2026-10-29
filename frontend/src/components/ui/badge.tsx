import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

/*
 * Concrete & Signal badge — mono, radius-sm, concrete-100 + hairline.
 * Variants: default (concrete), signal (signal-tint), success, warn, error.
 * All status info is redundant (word + color shape).
 */

const badgeVariants = cva("", {
  variants: {
    variant: {
      default: "",
      signal: "",
      success: "",
      warn: "",
      error: "",
      // Keep old names for backward compat
      secondary: "",
      destructive: "",
      outline: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const badgeStyleMap: Record<string, React.CSSProperties> = {
  default: {
    background: "var(--concrete-100)",
    color: "var(--ink-700)",
    boxShadow: "0 0 0 1px var(--hairline)",
  },
  signal: {
    background: "var(--signal-tint)",
    color: "var(--signal-deep)",
    boxShadow: "0 0 0 1px var(--signal-tint-2)",
  },
  success: {
    background: "var(--success-tint)",
    color: "var(--success)",
    boxShadow: "0 0 0 1px rgba(47,107,79,.18)",
  },
  warn: {
    background: "var(--warn-tint)",
    color: "var(--warn)",
    boxShadow: "0 0 0 1px rgba(138,106,31,.18)",
  },
  error: {
    background: "var(--error-tint)",
    color: "var(--error)",
    boxShadow: "0 0 0 1px rgba(178,58,40,.18)",
  },
  secondary: {
    background: "var(--concrete-100)",
    color: "var(--ink-700)",
    boxShadow: "0 0 0 1px var(--hairline)",
  },
  destructive: {
    background: "var(--error-tint)",
    color: "var(--error)",
    boxShadow: "0 0 0 1px rgba(178,58,40,.18)",
  },
  outline: {
    background: "transparent",
    color: "var(--ink-700)",
    boxShadow: "0 0 0 1px var(--hairline)",
  },
};

function Badge({
  className,
  variant = "default",
  asChild = false,
  style,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  const vKey = (variant ?? "default") as string;
  const variantStyle = badgeStyleMap[vKey] ?? badgeStyleMap["default"];

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "0.06em",
        whiteSpace: "nowrap",
        flexShrink: 0,
        ...variantStyle,
        ...style,
      }}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
