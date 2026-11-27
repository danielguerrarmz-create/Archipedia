import React from 'react';
import { Node } from './motif/Node';

/*
 * ErrorPanel — Concrete & Signal.
 * Broken-connector glyph (two nodes + severed line).
 * Honest message "Couldn't reach the index" + Retry primary CTA.
 * No color-only status encoding — the glyph + text carry the meaning.
 */

export interface ErrorPanelProps {
  message?: string;
  detail?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

function BrokenConnectorGlyph() {
  return (
    <svg width="64" height="32" viewBox="0 0 64 32" fill="none" aria-hidden style={{ display: "block" }}>
      {/* Left node */}
      <rect x="2" y="12" width="12" height="12" rx="2" fill="var(--ink-300)" />
      {/* Severed left wire segment */}
      <line x1="14" y1="18" x2="26" y2="18" stroke="var(--hairline-strong)" strokeWidth="1.5" />
      {/* Gap in the middle (broken connector) */}
      <line x1="38" y1="18" x2="50" y2="18" stroke="var(--hairline-strong)" strokeWidth="1.5" strokeDasharray="3 2" />
      {/* Right node (hollow = unresolved) */}
      <rect x="50" y="12" width="12" height="12" rx="2" fill="none" stroke="var(--ink-300)" strokeWidth="1.5" />
      {/* Break mark */}
      <line x1="29" y1="13" x2="33" y2="23" stroke="var(--error)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="33" y1="13" x2="29" y2="23" stroke="var(--error)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ErrorPanel({
  message = "Couldn't reach the index",
  detail,
  onRetry,
  retryLabel = "Retry",
}: ErrorPanelProps) {
  const [isPressed, setIsPressed] = React.useState(false);

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
        gap: 14,
      }}
      role="alert"
    >
      {/* Glyph */}
      <BrokenConnectorGlyph />

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
        {message}
      </h3>

      {detail && (
        <p
          className="mono-meta"
          style={{ color: "var(--ink-400)", margin: 0, maxWidth: 360 }}
        >
          {detail}
        </p>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          style={{
            marginTop: 8,
            height: 40,
            padding: "0 24px",
            background: "var(--signal)",
            color: "#fff",
            boxShadow: isPressed ? "var(--deboss)" : "var(--emboss)",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            fontWeight: 500,
            transform: isPressed ? "translateY(1px) scale(0.99)" : "none",
            transition:
              "background var(--dur-1) var(--ease-press), box-shadow var(--dur-1) var(--ease-press), transform var(--dur-1) var(--ease-press)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--signal-hover)";
          }}
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}

export default ErrorPanel;
