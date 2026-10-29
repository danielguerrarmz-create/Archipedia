/**
 * PinnedCard — the shared "project template": a white polaroid frame holding a
 * precedent image + caption, pinned with a clear glass thumbtack at a tilt. This
 * is the same look as the hero board, carried across the home page so every
 * PROJECT / visual example reads as "pinned up". Text blocks never use this —
 * only project imagery and visual artifacts.
 */
import { Pushpin } from "./Pushpin";
import { Thumb } from "./Thumb";
import type { ReactNode } from "react";

export function PinnedCard({
  thumb,
  title,
  meta,
  aspect = 1.5,
  rot = 0,
  pinXPct = 50,
  tilt = -18,
  pinSize = 32,
  seed = 0,
  badge,
  eager,
}: {
  thumb: string;
  title?: string;
  meta?: string;
  aspect?: number;
  rot?: number;
  pinXPct?: number;
  tilt?: number;
  pinSize?: number;
  seed?: number;
  badge?: ReactNode;
  eager?: boolean;
}) {
  return (
    <figure
      style={{
        position: "relative",
        margin: 0,
        background: "var(--concrete-0)",
        padding: 8,
        transform: `rotate(${rot}deg)`,
        boxShadow:
          "0 1px 1px rgba(21,22,26,0.06), 0 12px 26px -12px rgba(21,22,26,0.3), 0 0 0 1px var(--hairline)",
      }}
    >
      <Pushpin
        size={pinSize}
        tilt={tilt}
        seed={seed}
        style={{ position: "absolute", top: -pinSize * 0.74, left: `${pinXPct}%`, transform: "translateX(-50%)", zIndex: 6 }}
      />
      <div style={{ position: "relative" }}>
        <Thumb src={thumb} alt={title || ""} aspect={aspect} radius="0" eager={eager} />
        {badge && <div style={{ position: "absolute", left: 6, bottom: 6 }}>{badge}</div>}
      </div>
      {(title || meta) && (
        <figcaption style={{ padding: "8px 4px 2px" }}>
          {title && (
            <span style={{ display: "block", fontFamily: "var(--font-display)", fontWeight: 650, fontSize: 12.5, lineHeight: 1.15, letterSpacing: "-0.01em", color: "var(--ink-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {title}
            </span>
          )}
          {meta && (
            /* ink-700 on concrete-0 card bg is ~10.5:1 — passes at 9.5px */
            <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ink-700)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {meta}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}

export default PinnedCard;
