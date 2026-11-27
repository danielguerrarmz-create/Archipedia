"use client";

import * as React from "react";
import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";
import { Node } from "../motif/Node";

/*
 * Concrete & Signal toaster — concrete-0 + raised, leading status Node + mono-caps word.
 * No glass. Status is redundant (word + node shape, not color alone).
 */

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        style: {
          background: "var(--concrete-0)",
          boxShadow: "var(--raised)",
          borderRadius: "var(--radius-md)",
          border: "none",
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: "var(--ink-900)",
          gap: 10,
        },
        classNames: {
          toast: "an-toast",
          title: "an-toast-title",
          description: "an-toast-description",
          actionButton: "an-toast-action",
          cancelButton: "an-toast-cancel",
        },
      }}
      style={
        {
          "--normal-bg": "var(--concrete-0)",
          "--normal-text": "var(--ink-900)",
          "--normal-border": "none",
          "--success-bg": "var(--concrete-0)",
          "--success-text": "var(--ink-900)",
          "--error-bg": "var(--concrete-0)",
          "--error-text": "var(--ink-900)",
          "--warning-bg": "var(--concrete-0)",
          "--warning-text": "var(--ink-900)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
