import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { MoreHorizontal } from "lucide-react@0.487.0";
import { Node } from "../motif/Node";

import { cn } from "./utils";

/*
 * Concrete & Signal breadcrumb.
 * Separators = AxisTick Node squares (6px, ink-400) instead of chevrons.
 */

function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, style, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(className)}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--font-body)",
        fontSize: "13px",
        color: "var(--ink-500)",
        listStyle: "none",
        padding: 0,
        margin: 0,
        ...style,
      }}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, style, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      style={style}
      {...props}
    />
  );
}

function BreadcrumbLink({
  asChild,
  className,
  style,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(className)}
      style={{
        color: "var(--ink-500)",
        textDecoration: "none",
        transition: "color var(--dur-1)",
        ...style,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--ink-900)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--ink-500)"; }}
      {...props}
    />
  );
}

function BreadcrumbPage({ className, style, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn(className)}
      style={{ color: "var(--ink-900)", fontWeight: 500, ...style }}
      {...props}
    />
  );
}

function BreadcrumbSeparator({
  children,
  className,
  style,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn(className)}
      style={{ display: "inline-flex", alignItems: "center", ...style }}
      {...props}
    >
      {children ?? <Node size={6} filled color="var(--ink-400)" />}
    </li>
  );
}

function BreadcrumbEllipsis({
  className,
  style,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("inline-flex items-center justify-center", className)}
      style={{ width: 32, height: 32, ...style }}
      {...props}
    >
      <MoreHorizontal style={{ width: 16, height: 16 }} />
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
