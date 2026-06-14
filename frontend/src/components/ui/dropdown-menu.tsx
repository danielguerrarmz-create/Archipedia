"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu@2.1.6";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react@0.487.0";
import { Node } from "../motif/Node";

import { cn } from "./utils";

/*
 * Concrete & Signal dropdown-menu — concrete-0 + --raised, NO black glass.
 * Active/focused items: signal-tint bg.
 */

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  style,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] origin-[var(--radix-dropdown-menu-content-transform-origin)] overflow-x-hidden overflow-y-auto",
          className,
        )}
        style={{
          background: "var(--concrete-0)",
          boxShadow: "var(--raised)",
          borderRadius: "var(--radius-md)",
          border: "none",
          padding: 4,
          ...style,
        }}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  style,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn("an-dropdown-item", className)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: inset ? "6px 8px 6px 32px" : "6px 8px",
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-body)",
        fontSize: "14px",
        color: variant === "destructive" ? "var(--error)" : "var(--ink-900)",
        cursor: "default",
        outline: "none",
        userSelect: "none",
        ...style,
      }}
      {...props}
    >
      <style>{`
        .an-dropdown-item[data-highlighted] { background: var(--signal-tint); }
        .an-dropdown-item[data-disabled] { opacity: 0.5; pointer-events: none; }
      `}</style>
      {props.children}
    </DropdownMenuPrimitive.Item>
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  style,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn("an-dropdown-item", className)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 8px 6px 32px",
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-body)",
        fontSize: "14px",
        color: "var(--ink-900)",
        cursor: "default",
        outline: "none",
        userSelect: "none",
        position: "relative",
        ...style,
      }}
      checked={checked}
      {...props}
    >
      <span style={{ position: "absolute", left: 8, display: "flex", alignItems: "center", justifyContent: "center", width: 14, height: 14 }}>
        <DropdownMenuPrimitive.ItemIndicator>
          <Node size={6} signal />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  style,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn("an-dropdown-item", className)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 8px 6px 32px",
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-body)",
        fontSize: "14px",
        color: "var(--ink-900)",
        cursor: "default",
        outline: "none",
        userSelect: "none",
        position: "relative",
        ...style,
      }}
      {...props}
    >
      <span style={{ position: "absolute", left: 8, display: "flex", alignItems: "center", justifyContent: "center", width: 14, height: 14 }}>
        <DropdownMenuPrimitive.ItemIndicator>
          <span style={{ width: 6, height: 6, borderRadius: "var(--radius-pill)", background: "var(--signal)", display: "block" }} />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  style,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn("mono-caps", className)}
      style={{
        padding: inset ? "6px 8px 6px 32px" : "6px 8px",
        color: "var(--ink-500)",
        ...style,
      }}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  style,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn(className)}
      style={{ height: 1, background: "var(--hairline)", margin: "4px -4px", ...style }}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  style,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn("mono-meta", className)}
      style={{ marginLeft: "auto", color: "var(--ink-400)", ...style }}
      {...props}
    />
  );
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  style,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn("an-dropdown-item", className)}
      style={{
        display: "flex",
        alignItems: "center",
        padding: inset ? "6px 8px 6px 32px" : "6px 8px",
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
      {children}
      <ChevronRightIcon style={{ marginLeft: "auto", width: 16, height: 16, opacity: 0.5 }} />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  style,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden",
        className,
      )}
      style={{
        background: "var(--concrete-0)",
        boxShadow: "var(--raised)",
        borderRadius: "var(--radius-md)",
        border: "none",
        padding: 4,
        ...style,
      }}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
