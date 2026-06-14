"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs@1.1.3";

import { cn } from "./utils";

/*
 * Concrete & Signal tabs.
 * Active = ink-900 + 2px signal underline.
 * Inactive = ink-500. List has bottom hairline.
 */

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-0", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  style,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(className)}
      style={{
        display: "inline-flex",
        alignItems: "flex-end",
        gap: 0,
        borderBottom: "1px solid var(--hairline)",
        ...style,
      }}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  style,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn("an-tab-trigger", className)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "8px 16px",
        fontFamily: "var(--font-body)",
        fontSize: "14px",
        fontWeight: 500,
        color: "var(--ink-500)",
        background: "transparent",
        border: "none",
        borderBottom: "2px solid transparent",
        marginBottom: "-1px",
        cursor: "pointer",
        outline: "none",
        transition: "color var(--dur-1) var(--ease-press), border-color var(--dur-1) var(--ease-press)",
        whiteSpace: "nowrap",
        ...style,
      }}
      {...props}
    >
      <style>{`
        .an-tab-trigger[data-state="active"] {
          color: var(--ink-900) !important;
          border-bottom-color: var(--signal) !important;
          font-weight: 600;
        }
        .an-tab-trigger:hover:not([data-state="active"]) {
          color: var(--ink-700) !important;
        }
        .an-tab-trigger:focus-visible {
          box-shadow: 0 0 0 3px var(--focus-ring);
          border-radius: var(--radius-sm);
        }
        .an-tab-trigger[disabled] { opacity: 0.5; pointer-events: none; }
      `}</style>
      {props.children}
    </TabsPrimitive.Trigger>
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
