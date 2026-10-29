import React from "react";
import { NodeField } from "./motif/NodeField";

/*
 * EmptyState — Concrete & Signal.
 * NodeField art + concrete panel with hairline frame.
 * No dashed glass border. CTA = primary signal button.
 * The LucideIcon prop is kept for API compatibility but rendered as NodeField art.
 */

interface EmptyStateProps {
  icon?: React.ComponentType<{ size?: number }>; // kept for compat, ignored visually
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div
      style={{
        background: "var(--concrete-0)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 0 0 1px var(--hairline)",
        padding: "48px 32px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* NodeField art */}
      <NodeField width={200} height={100} />

      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 18,
          fontWeight: 600,
          color: "var(--ink-900)",
          margin: 0,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--ink-500)",
          margin: 0,
          maxWidth: 380,
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 8 }}>
        {/* Primary CTA */}
        <button
          onClick={onAction}
          style={{
            height: 40,
            padding: "0 20px",
            background: "var(--signal)",
            color: "#fff",
            boxShadow: "var(--emboss)",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            fontWeight: 500,
            transition: "background var(--dur-1) var(--ease-press), box-shadow var(--dur-1) var(--ease-press), transform var(--dur-1) var(--ease-press)",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--signal-hover)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--signal)"; }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(1px) scale(0.99)";
            (e.currentTarget as HTMLElement).style.boxShadow = "var(--deboss)";
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "";
            (e.currentTarget as HTMLElement).style.boxShadow = "var(--emboss)";
          }}
        >
          {actionLabel}
        </button>

        {secondaryLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            style={{
              height: 40,
              padding: "0 20px",
              background: "var(--concrete-100)",
              color: "var(--ink-900)",
              boxShadow: "var(--emboss)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontWeight: 500,
              transition: "background var(--dur-1)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--concrete-200)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--concrete-100)"; }}
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
