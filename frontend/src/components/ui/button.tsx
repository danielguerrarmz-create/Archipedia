import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";
import { ConnectorLoader } from "../motif/ConnectorLoader";

import { cn } from "./utils";

/*
 * Concrete & Signal button system.
 * Depth comes from emboss/deboss + hairlines — NO glass, NO pill shape.
 * Signal = primary CTA only. Stamp-press on :active.
 */

const buttonVariants = cva(
  // base — layout + typography + transition
  "inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 outline-none cursor-pointer select-none transition-all disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: Signal fill + emboss, white text, stamp-press
        default: "",
        // Secondary: concrete + emboss, ink text
        secondary: "",
        // Ghost: transparent → concrete-100 hover
        ghost: "",
        // Destructive: emboss, error-colored text
        destructive: "",
        // Outline: alias for secondary
        outline: "",
      },
      size: {
        sm: "",
        default: "",
        md: "",
        lg: "",
        icon: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// We use inline styles + CSS vars for brand compliance (no Tailwind compile-time classes for tokens)
const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    background: "var(--signal)",
    color: "#fff",
    boxShadow: "var(--emboss)",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-body)",
    fontWeight: 500,
  },
  secondary: {
    background: "var(--concrete-100)",
    color: "var(--ink-900)",
    boxShadow: "var(--emboss)",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-body)",
    fontWeight: 500,
  },
  ghost: {
    background: "transparent",
    color: "var(--ink-700)",
    boxShadow: "none",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-body)",
    fontWeight: 500,
  },
  destructive: {
    background: "var(--concrete-100)",
    color: "var(--error)",
    boxShadow: "var(--emboss)",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-body)",
    fontWeight: 500,
  },
  outline: {
    background: "var(--concrete-100)",
    color: "var(--ink-900)",
    boxShadow: "var(--emboss)",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-body)",
    fontWeight: 500,
  },
  icon: {
    background: "var(--concrete-100)",
    color: "var(--ink-700)",
    boxShadow: "var(--emboss)",
    border: "none",
    borderRadius: "var(--radius-md)",
  },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { height: "32px", padding: "0 12px", fontSize: "13px" },
  default: { height: "40px", padding: "0 16px", fontSize: "14px" },
  md: { height: "40px", padding: "0 16px", fontSize: "14px" },
  lg: { height: "48px", padding: "0 20px", fontSize: "15px" },
  icon: { width: "40px", height: "40px", padding: "0" },
};

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  children,
  style,
  disabled,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  // Stamp-press: on mousedown translateY(1px) + swap emboss→deboss + scale .99
  const [pressed, setPressed] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  const vKey = (variant ?? "default") as string;
  const sKey = (size ?? "default") as string;

  const baseStyle = variantStyles[vKey] ?? variantStyles["default"];
  const sizeStyle = sizeStyles[sKey] ?? sizeStyles["default"];

  const hoverStyle: React.CSSProperties =
    vKey === "default"
      ? { background: "var(--signal-hover)" }
      : vKey === "ghost"
      ? { background: "var(--concrete-100)" }
      : { background: "var(--concrete-200)" };

  const disabledStyle: React.CSSProperties = disabled
    ? {
        background: "var(--concrete-200)",
        color: "var(--ink-400)",
        boxShadow: "none",
        cursor: "not-allowed",
        opacity: 1,
      }
    : {};

  const pressStyle: React.CSSProperties = pressed && !disabled
    ? {
        transform: "translateY(1px) scale(0.99)",
        boxShadow: "var(--deboss)",
        transition: `transform var(--dur-1) var(--ease-press), box-shadow var(--dur-1) var(--ease-press)`,
      }
    : {};

  const combinedStyle: React.CSSProperties = {
    ...baseStyle,
    ...sizeStyle,
    ...(hovered && !pressed && !disabled ? hoverStyle : {}),
    ...pressStyle,
    ...disabledStyle,
    transition: "background var(--dur-1) var(--ease-press), box-shadow var(--dur-1) var(--ease-press), transform var(--dur-1) var(--ease-press)",
    ...style,
  };

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      style={combinedStyle}
      disabled={disabled || loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={(e) => {
        setHovered(false);
        setPressed(false);
        onMouseLeave?.(e);
      }}
      onMouseDown={(e) => {
        setPressed(true);
        onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        setPressed(false);
        onMouseUp?.(e);
      }}
      onFocus={() => {}}
      {...props}
    >
      {loading ? (
        <ConnectorLoader size={vKey === "default" ? 32 : 32} light={vKey === "default"} />
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
