/**
 * ConnectorLoader — replaces all spinners. A connector "draws" between two
 * nodes; a signal union nub blinks at the join. "Searching = reaching toward
 * an unresolved node." Honors prefers-reduced-motion (static connected pair).
 */
import type { CSSProperties } from "react";

export interface ConnectorLoaderProps {
  size?: number;          // total width in px
  light?: boolean;        // white nodes (for use inside a signal button)
  caption?: string;       // optional mono-caps caption below
  style?: CSSProperties;
}

export function ConnectorLoader({ size = 48, light = false, caption, style }: ConnectorLoaderProps) {
  const node = light ? "#fff" : "var(--ink-700)";
  const wire = light ? "rgba(255,255,255,.6)" : "var(--hairline-strong)";
  const nodeSize = Math.max(5, Math.round(size / 8));
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6, ...style }}>
      <style>{`
        @keyframes an-wire-draw { 0%{transform:scaleX(0);opacity:.4} 60%{transform:scaleX(1);opacity:1} 100%{transform:scaleX(1);opacity:1} }
        @keyframes an-union-blink { 0%,40%{opacity:0;transform:scale(.6)} 60%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(.6)} }
        @media (prefers-reduced-motion: reduce){
          .an-loader-wire{transform:scaleX(1)!important;animation:none!important;opacity:1!important}
          .an-loader-union{animation:none!important;opacity:1!important;transform:none!important}
        }
      `}</style>
      <span style={{ display: "inline-flex", alignItems: "center", width: size }}>
        <span style={{ width: nodeSize, height: nodeSize, borderRadius: "var(--radius-sm)", background: node, flexShrink: 0 }} />
        <span style={{ position: "relative", flex: 1, height: 1.5, margin: "0 1px" }}>
          <span
            className="an-loader-wire"
            style={{ position: "absolute", inset: 0, background: wire, transformOrigin: "left center",
              animation: "an-wire-draw 1.2s var(--ease-emerge) infinite" }}
          />
          <span
            className="an-loader-union"
            style={{ position: "absolute", right: -2, top: "50%", width: 4, height: 4, marginTop: -2,
              borderRadius: "var(--radius-sm)", background: light ? "#fff" : "var(--signal)",
              animation: "an-union-blink 1.2s var(--ease-emerge) infinite" }}
          />
        </span>
        <span style={{ width: nodeSize, height: nodeSize, borderRadius: "var(--radius-sm)", background: node, opacity: 0.5, flexShrink: 0 }} />
      </span>
      {caption && <span className="mono-caps">{caption}</span>}
    </span>
  );
}

export default ConnectorLoader;
