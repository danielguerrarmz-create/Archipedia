import * as React from "react";

import { cn } from "./utils";

/*
 * Concrete & Signal card — concrete-0, radius-lg, raised, NO blur.
 * Depth via --raised (hairline border + subtle shadow), NOT backdrop-filter.
 */

function Card({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(className)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        background: "var(--concrete-0)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--raised)",
        border: "none",
        overflow: "hidden",
        ...style,
      }}
      {...props}
    />
  );
}

function CardHeader({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(className)}
      style={{
        display: "grid",
        gridTemplateRows: "auto auto",
        alignItems: "start",
        gap: 6,
        padding: "24px 24px 0",
        ...style,
      }}
      {...props}
    />
  );
}

function CardTitle({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <h4
      data-slot="card-title"
      className={cn(className)}
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: "16px",
        color: "var(--ink-900)",
        lineHeight: 1.2,
        margin: 0,
        ...style,
      }}
      {...props}
    />
  );
}

function CardDescription({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn(className)}
      style={{
        fontFamily: "var(--font-body)",
        fontSize: "14px",
        color: "var(--ink-500)",
        margin: 0,
        ...style,
      }}
      {...props}
    />
  );
}

function CardAction({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(className)}
      style={{
        gridColumn: 2,
        gridRow: "1 / span 2",
        alignSelf: "start",
        justifySelf: "end",
        ...style,
      }}
      {...props}
    />
  );
}

function CardContent({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(className)}
      style={{ padding: "16px 24px", ...style }}
      {...props}
    />
  );
}

function CardFooter({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(className)}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 24px 24px",
        borderTop: "1px solid var(--hairline)",
        paddingTop: "16px",
        ...style,
      }}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
