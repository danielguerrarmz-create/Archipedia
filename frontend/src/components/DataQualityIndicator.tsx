// src/components/DataQualityIndicator.tsx
import { useState } from "react";
import { Node } from "./motif/Node";

/*
 * DataQualityIndicator — Concrete & Signal.
 * Status is redundant: glyph + mono-caps word, never color alone (WCAG 1.4.1).
 *
 * verified   → filled Node / success color
 * sourced    → Node + connector line / ink-700
 * estimated  → hollow Node / warn color
 * missing    → open Node ring / ink-400
 *
 * Tooltip: concrete-0 raised panel, NOT glass.
 */

interface DataQualityIndicatorProps {
  type: "verified" | "sourced" | "estimated" | "missing";
  source?: string;
}

const TIER_CONFIG = {
  verified: {
    label: "Verified",
    nodeColor: "var(--success)",
    filled: true,
    textColor: "var(--success)",
    showConnector: false,
  },
  sourced: {
    label: "Sourced",
    nodeColor: "var(--ink-700)",
    filled: true,
    textColor: "var(--ink-700)",
    showConnector: true,
  },
  estimated: {
    label: "Estimated",
    nodeColor: "var(--warn)",
    filled: false,
    textColor: "var(--warn)",
    showConnector: false,
  },
  missing: {
    label: "Missing",
    nodeColor: "var(--ink-400)",
    filled: false,
    textColor: "var(--ink-400)",
    showConnector: false,
  },
};

export function DataQualityIndicator({ type, source }: DataQualityIndicatorProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = TIER_CONFIG[type] ?? TIER_CONFIG.missing;

  return (
    <div
      style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Node glyph */}
      <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
        <Node size={8} filled={config.filled} color={config.nodeColor} title={config.label} />
        {config.showConnector && (
          <span
            aria-hidden
            style={{ display: "inline-block", width: 6, height: 1.5, background: config.nodeColor, opacity: 0.7 }}
          />
        )}
      </span>
      {/* Mono-caps word (always visible — not color alone) */}
      <span className="mono-caps" style={{ fontSize: 10, color: config.textColor }}>
        {config.label}
      </span>

      {/* Tooltip */}
      {isHovered && source && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            minWidth: 180,
            maxWidth: 280,
            background: "var(--concrete-0)",
            boxShadow: "var(--raised)",
            borderRadius: "var(--radius-md)",
            padding: "10px 14px",
            zIndex: 50,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--ink-900)",
              marginBottom: 4,
            }}
          >
            {config.label}
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              color: "var(--ink-500)",
              whiteSpace: "normal",
              lineHeight: 1.5,
            }}
          >
            {source}
          </div>
        </div>
      )}
    </div>
  );
}
