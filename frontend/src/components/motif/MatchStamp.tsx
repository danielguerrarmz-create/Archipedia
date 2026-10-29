/**
 * MatchStamp — replaces the color-only MatchReasonBadge. Encodes match strength
 * REDUNDANTLY (filled/hollow node count + tier WORD + mono %), so it never
 * relies on color alone (WCAG 1.4.1). A debossed stamp on a concrete chip.
 *
 *   Strong  (>= .80): ■■■   Close (.60–.79): ■■□   Related (< .60): ■□□
 *
 * `score` accepts 0–1 or 0–100 (auto-normalized). On results views Signal may
 * carry the % for the single strongest match (pass `signalPct`); otherwise the
 * node-fill carries the tier and the % stays ink.
 */
import type { CSSProperties } from "react";
import { Node } from "./Node";

export type MatchTier = "strong" | "close" | "related";

export function tierFromScore(score: number): MatchTier {
  const s = score > 1 ? score / 100 : score;
  if (s >= 0.8) return "strong";
  if (s >= 0.6) return "close";
  return "related";
}

const TIER_LABEL: Record<MatchTier, string> = { strong: "Strong", close: "Close", related: "Related" };
const TIER_FILLED: Record<MatchTier, number> = { strong: 3, close: 2, related: 1 };

export interface MatchStampProps {
  score: number;
  reason?: string;
  signalPct?: boolean;   // let the % carry Signal (strongest match on the page)
  noSignal?: boolean;    // render entirely in ink (no Klein-blue) — e.g. marketing surfaces
  style?: CSSProperties;
}

export function MatchStamp({ score, reason, signalPct = false, noSignal = false, style }: MatchStampProps) {
  // Normalize to a 0–1 ratio, then guard against 0/NaN ever rendering "0%"
  // (which reads as broken). A stamp is only shown for an actual match, so the
  // floor is a sensible "related" tier value rather than zero.
  const raw = Number.isFinite(score) ? (score > 1 ? score / 100 : score) : 0;
  const ratio = raw > 0 ? raw : 0.6;
  const tier = tierFromScore(ratio);
  const filled = TIER_FILLED[tier];
  const pct = Math.round(ratio * 100);
  return (
    <span
      className="stamp"
      title={reason}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 8px",
        background: "var(--concrete-0)",
        boxShadow: "var(--emboss)",
        borderRadius: "var(--radius-sm)",
        ...style,
      }}
    >
      <span style={{ display: "inline-flex", gap: 2 }} aria-hidden>
        {[0, 1, 2].map((i) => (
          <Node key={i} size={6} filled={i < filled} signal={!noSignal && tier === "strong" && i < filled} />
        ))}
      </span>
      <span className="mono-caps" style={{ color: "var(--ink-900)", letterSpacing: "0.1em" }}>
        {TIER_LABEL[tier]}
      </span>
      <span
        className="mono-meta"
        style={{ color: !noSignal && signalPct && tier === "strong" ? "var(--signal)" : "var(--ink-700)", fontWeight: 500 }}
      >
        {pct}%
      </span>
    </span>
  );
}

export default MatchStamp;
