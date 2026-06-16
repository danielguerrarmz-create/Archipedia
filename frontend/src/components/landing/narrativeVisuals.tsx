/**
 * narrativeVisuals — the four right-hand visuals for the NarrativeSection beats:
 *   SearchGridVisual   (01 Search)  — 6 real thumbs as raised cards + MatchStamp
 *   CompareVisual      (02 Compare) — 2 images + connector + MatchStamp between
 *   ComposeVisual lives in ComposeCanvasVignette.tsx (near-full-bleed)
 *   CiteVisual         (04 Cite)    — a board/PDF sheet mockup with mono sources
 *
 * All real imagery comes from the frozen manifest. Titles are sanitized.
 */
import { Thumb } from "./Thumb";
import { MatchStamp } from "../motif";
import { PinnedCard } from "./PinnedCard";
import { Pushpin } from "./Pushpin";
import {
  sanitizeTitle,
  clampWords,
  safeArchitect,
} from "./landingShared";
import type { HeroPrecedent } from "../../data/heroPrecedents";

/* ── 01 SEARCH ─────────────────────────────────────────────────────────── */
const SCORES = [0.94, 0.88, 0.83, 0.79, 0.74, 0.68];
// stable, varied pin positions/tilts/rotations so the grid reads "pinned up"
const GRID_PINS = [
  { rot: -2.5, pinXPct: 42, tilt: -18 },
  { rot: 2, pinXPct: 58, tilt: 16 },
  { rot: -1.5, pinXPct: 47, tilt: -20 },
  { rot: 2.5, pinXPct: 61, tilt: 14 },
  { rot: -2, pinXPct: 38, tilt: -15 },
  { rot: 1.8, pinXPct: 55, tilt: 19 },
];

export function SearchGridVisual({ precedents }: { precedents: HeroPrecedent[] }) {
  const six = precedents.slice(0, 6);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "26px 18px", paddingTop: 14 }}>
      {six.map((p, i) => (
        <PinnedCard
          key={p.id}
          thumb={p.thumb}
          title={clampWords(p.title, 3)}
          meta={p.country || "—"}
          aspect={1.5}
          rot={GRID_PINS[i].rot}
          pinXPct={GRID_PINS[i].pinXPct}
          tilt={GRID_PINS[i].tilt}
          pinSize={28}
          eager={i < 3}
          badge={<MatchStamp score={SCORES[i]} noSignal />}
        />
      ))}
    </div>
  );
}

/* ── 02 COMPARE ────────────────────────────────────────────────────────── */
export function CompareVisual({ precedents }: { precedents: HeroPrecedent[] }) {
  const [a, b] = [precedents[0], precedents[6] ?? precedents[1]];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: 0,
        paddingTop: 18,
      }}
    >
      <PinnedCard thumb={a.thumb} title={clampWords(a.title, 4)} meta={a.country || "—"} rot={-2.5} pinXPct={44} tilt={-18} eager />
      {/* connector + MatchStamp between */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 8px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <svg width="40" height="2" viewBox="0 0 40 2" aria-hidden style={{ flexShrink: 0 }}>
          <line x1="0" y1="1" x2="16" y2="1" stroke="var(--hairline-strong)" strokeWidth="1.5" />
          <line x1="24" y1="1" x2="40" y2="1" stroke="var(--hairline-strong)" strokeWidth="1.5" />
          <rect x="18" y="-1" width="4" height="4" rx="1" fill="var(--ink-700)" />
        </svg>
        <div style={{ marginTop: 10 }}>
          <MatchStamp score={0.91} reason="Strong visual proximity" noSignal />
        </div>
      </div>
      <PinnedCard thumb={b.thumb} title={clampWords(b.title, 4)} meta={b.country || "—"} rot={2.5} pinXPct={56} tilt={16} eager />
    </div>
  );
}

/* ── 04 CITE / EXPORT ──────────────────────────────────────────────────── */
export function CiteVisual({ precedents }: { precedents: HeroPrecedent[] }) {
  const rows = precedents.slice(0, 4);
  return (
    <div
      style={{
        position: "relative",
        background: "var(--concrete-0)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--elev-modal)",
        padding: "clamp(20px, 3vw, 32px)",
        maxWidth: 560,
        transform: "rotate(-0.8deg)",
      }}
    >
      {/* the sheet itself is pinned to the wall (a visual artifact, not text) */}
      <Pushpin size={34} tilt={14} style={{ position: "absolute", top: -25, left: "58%", transform: "translateX(-50%)", zIndex: 5 }} />
      {/* sheet header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 14,
          borderBottom: "1px solid var(--hairline)",
          marginBottom: 18,
        }}
      >
        <span
          className="mono-caps"
          style={{ color: "var(--ink-900)", letterSpacing: "0.14em" }}
        >
          PRECEDENT SHEET
        </span>
        <span className="mono-meta" style={{ color: "var(--ink-400)" }}>
          PDF · A4
        </span>
      </div>

      {/* thumbnail strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 18 }}>
        {rows.map((p, i) => (
          <Thumb key={p.id} src={p.thumb} alt={sanitizeTitle(p.title)} aspect={1} radius="var(--radius-sm)" eager={i < 2} />
        ))}
      </div>

      {/* source captions (mono) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((p, i) => (
          <div
            key={p.id}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "baseline",
              paddingBottom: 10,
              borderBottom: i < rows.length - 1 ? "1px solid var(--hairline)" : "none",
            }}
          >
            <span className="mono-meta" style={{ color: "var(--ink-400)", flexShrink: 0 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="mono-meta" style={{ color: "var(--ink-700)", lineHeight: 1.5 }}>
              {safeArchitect(p.architect)} · {clampWords(p.title, 6)} · {p.country || "—"} · {2018 + i}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
