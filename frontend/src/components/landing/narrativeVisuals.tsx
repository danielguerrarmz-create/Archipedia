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
import {
  sanitizeTitle,
  clampWords,
  safeArchitect,
} from "./landingShared";
import type { HeroPrecedent } from "../../data/heroPrecedents";

/* ── 01 SEARCH ─────────────────────────────────────────────────────────── */
const SCORES = [0.94, 0.88, 0.83, 0.79, 0.74, 0.68];

export function SearchGridVisual({ precedents }: { precedents: HeroPrecedent[] }) {
  const six = precedents.slice(0, 6);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
      {six.map((p, i) => (
        <div
          key={p.id}
          style={{
            position: "relative",
            background: "var(--concrete-100)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--raised)",
            overflow: "hidden",
          }}
        >
          <Thumb
            src={p.thumb}
            alt={sanitizeTitle(p.title)}
            aspect={1.5}
            radius="0"
            eager={i < 3}
          />
          <div style={{ position: "absolute", left: 6, bottom: 6 }}>
            <MatchStamp score={SCORES[i]} noSignal />
          </div>
        </div>
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
      }}
    >
      <CompareTile p={a} />
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
      <CompareTile p={b} />
    </div>
  );
}

function CompareTile({ p }: { p: HeroPrecedent }) {
  return (
    <div
      style={{
        background: "var(--concrete-100)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--raised)",
        overflow: "hidden",
      }}
    >
      <Thumb src={p.thumb} alt={sanitizeTitle(p.title)} aspect={1.5} radius="0" eager />
      <div style={{ padding: "10px 12px" }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--ink-900)",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {clampWords(p.title, 5)}
        </div>
        <div className="mono-meta" style={{ marginTop: 3 }}>
          {p.country || "—"}
        </div>
      </div>
    </div>
  );
}

/* ── 04 CITE / EXPORT ──────────────────────────────────────────────────── */
export function CiteVisual({ precedents }: { precedents: HeroPrecedent[] }) {
  const rows = precedents.slice(0, 4);
  return (
    <div
      style={{
        background: "var(--concrete-0)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--elev-modal)",
        padding: "clamp(20px, 3vw, 32px)",
        maxWidth: 560,
      }}
    >
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
