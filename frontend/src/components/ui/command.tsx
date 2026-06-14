"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk@1.1.1";
import { SearchIcon } from "lucide-react@0.487.0";
import { Node } from "../motif/Node";

import { cn } from "./utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

/*
 * Concrete & Signal command — debossed trigger, raised popover.
 * Active option: leading Node + signal-tint bg.
 */

function Command({
  className,
  style,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(className)}
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: "column",
        overflow: "hidden",
        background: "var(--concrete-0)",
        borderRadius: "var(--radius-md)",
        ...style,
      }}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent style={{ padding: 0, overflow: "hidden" }}>
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  style,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      style={{
        display: "flex",
        height: 40,
        alignItems: "center",
        gap: 8,
        borderBottom: "1px solid var(--hairline)",
        padding: "0 12px",
      }}
    >
      <SearchIcon style={{ width: 16, height: 16, flexShrink: 0, color: "var(--ink-400)" }} />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn("an-cmd-input", className)}
        style={{
          display: "flex",
          height: 40,
          width: "100%",
          background: "transparent",
          border: "none",
          outline: "none",
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: "var(--ink-900)",
          ...style,
        }}
        {...props}
      />
      <style>{`.an-cmd-input::placeholder { color: var(--ink-400); }`}</style>
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(className)}
      style={{ maxHeight: 300, overflowY: "auto", overflowX: "hidden", padding: "4px 0", scrollPaddingBlock: 4 }}
      {...props}
    />
  );
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      style={{ padding: "24px 8px", textAlign: "center", fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--ink-400)" }}
      {...props}
    />
  );
}

function CommandGroup({
  className,
  style,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn("an-cmd-group", className)}
      style={{
        overflow: "hidden",
        padding: "4px",
        color: "var(--ink-900)",
        ...style,
      }}
      {...props}
    >
      <style>{`
        .an-cmd-group [cmdk-group-heading] {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-500);
          padding: 6px 8px 4px;
          font-weight: 500;
        }
      `}</style>
      {props.children}
    </CommandPrimitive.Group>
  );
}

function CommandSeparator({
  className,
  style,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn(className)}
      style={{ height: 1, background: "var(--hairline)", margin: "4px -4px", ...style }}
      {...props}
    />
  );
}

function CommandItem({
  className,
  style,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn("an-cmd-item", className)}
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
        .an-cmd-item[data-selected="true"] { background: var(--signal-tint); }
        .an-cmd-item[data-disabled="true"] { opacity: 0.5; pointer-events: none; }
        .an-cmd-item[data-selected="true"]::before {
          content: "";
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: var(--radius-sm);
          background: var(--signal);
          flex-shrink: 0;
          margin-right: 2px;
        }
      `}</style>
      {children}
    </CommandPrimitive.Item>
  );
}

function CommandShortcut({
  className,
  style,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn("mono-meta", className)}
      style={{ marginLeft: "auto", color: "var(--ink-400)", ...style }}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
