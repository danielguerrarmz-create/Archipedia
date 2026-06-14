"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select@2.1.6";
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react@0.487.0";
import { Node } from "../motif/Node";

import { cn } from "./utils";

/*
 * Concrete & Signal select.
 * Trigger: debossed well. Content: raised popover.
 * Active option: leading Node + signal-tint bg.
 */

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  style,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn("an-select-trigger", className)}
      style={{
        display: "inline-flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        height: size === "sm" ? 32 : 40,
        padding: "0 12px",
        borderRadius: "var(--radius-md)",
        background: "var(--concrete-0)",
        boxShadow: "var(--deboss)",
        border: "none",
        outline: "none",
        fontFamily: "var(--font-body)",
        fontSize: "14px",
        color: "var(--ink-900)",
        cursor: "pointer",
        transition: "box-shadow var(--dur-1) var(--ease-press)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        ...style,
      }}
      {...props}
    >
      <style>{`
        .an-select-trigger::placeholder, .an-select-trigger [data-placeholder] { color: var(--ink-400); }
        .an-select-trigger:focus { box-shadow: var(--deboss), 0 0 0 3px var(--focus-ring), inset 0 0 0 1px var(--signal); }
        .an-select-trigger[data-disabled] { background: var(--concrete-200); color: var(--ink-400); cursor: not-allowed; }
      `}</style>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon style={{ width: 16, height: 16, opacity: 0.5, flexShrink: 0 }} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(className)}
        position={position}
        style={{
          background: "var(--concrete-0)",
          boxShadow: "var(--raised)",
          borderRadius: "var(--radius-md)",
          border: "none",
          padding: 4,
          zIndex: 50,
          maxHeight: "var(--radix-select-content-available-height, 300px)",
          minWidth: "var(--radix-select-trigger-width, 8rem)",
          overflowY: "auto",
          overflowX: "hidden",
          ...(position === "popper" ? { marginTop: 4 } : {}),
        }}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          style={{
            padding: 4,
            ...(position === "popper"
              ? {
                  height: "var(--radix-select-trigger-height)",
                  width: "100%",
                  minWidth: "var(--radix-select-trigger-width)",
                }
              : {}),
          }}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  style,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("mono-caps", className)}
      style={{ padding: "6px 8px", color: "var(--ink-500)", ...style }}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  style,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn("an-select-item", className)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 8px",
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-body)",
        fontSize: "14px",
        color: "var(--ink-900)",
        cursor: "default",
        outline: "none",
        userSelect: "none",
        ...style,
      }}
      {...props}
    >
      <style>{`
        .an-select-item[data-highlighted] { background: var(--signal-tint); }
        .an-select-item[data-state="checked"] { background: var(--signal-tint); }
        .an-select-item[data-disabled] { opacity: 0.5; pointer-events: none; }
      `}</style>
      {/* Leading Node for active option */}
      <SelectPrimitive.ItemIndicator>
        <Node size={6} signal />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  style,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(className)}
      style={{ height: 1, background: "var(--hairline)", margin: "4px -4px", ...style }}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(className)}
      style={{ display: "flex", cursor: "default", alignItems: "center", justifyContent: "center", padding: 4 }}
      {...props}
    >
      <ChevronUpIcon style={{ width: 16, height: 16 }} />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(className)}
      style={{ display: "flex", cursor: "default", alignItems: "center", justifyContent: "center", padding: 4 }}
      {...props}
    >
      <ChevronDownIcon style={{ width: 16, height: 16 }} />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
