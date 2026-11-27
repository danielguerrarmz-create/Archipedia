/**
 * ProofStrip — a thin hairline band of three mono metrics that COUNT UP on
 * enter, centered on the page. Deliberately minimal: no image card, no prose —
 * just the corpus numbers. The "every result carries its source" provenance
 * promise lives in the footer and the CITE narrative beat, not here.
 */
import { useCountUp } from "./landingShared";
import { Node } from "../motif";

/* ── Corpus metrics ─────────────────────────────────────────────────────────
   corpusCount: 669 is the last-known indexed project count (projects.csv rows).
   TODO: wire to a /stats endpoint in navigatorApi.ts when it exists.        */
interface Metric {
  value: number;
  suffix?: string;
  label: string;
}

function buildMetrics(corpusCount: number): Metric[] {
  return [
    { value: corpusCount, label: "INDEXED PROJECTS" },
    { value: 41, label: "TYPOLOGIES" },
    { value: 92, label: "COUNTRIES" },
  ];
}

/* ── Component ──────────────────────────────────────────────────────────── */
export function ProofStrip({
  motionOn,
  // 669 is the last-known index size; wire to a backend /stats endpoint later
  corpusCount = 669,
}: {
  motionOn: boolean;
  corpusCount?: number;
}) {
  const metrics = buildMetrics(corpusCount);

  return (
    <section
      aria-label="Corpus metrics"
      style={{
        borderTop: "1px solid var(--hairline)",
        borderBottom: "1px solid var(--hairline)",
        background: "var(--concrete-50)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "0 clamp(20px, 5vw, 48px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          rowGap: 0,
        }}
      >
        {metrics.map((m, i) => (
          <Stat key={m.label} metric={m} motionOn={motionOn} divider={i > 0} />
        ))}
      </div>
    </section>
  );
}

/* ── Stat cell ──────────────────────────────────────────────────────────── */
function Stat({
  metric,
  motionOn,
  divider,
}: {
  metric: Metric;
  motionOn: boolean;
  divider: boolean;
}) {
  const { ref, value } = useCountUp(metric.value, motionOn);
  return (
    <div
      style={{
        flex: "0 0 auto",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "18px clamp(20px, 3vw, 40px)",
        borderLeft: divider ? "1px solid var(--hairline)" : "none",
      }}
    >
      <Node size={6} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <span
          ref={ref}
          className="mono"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 25,
            fontWeight: 500,
            color: "var(--ink-900)",
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "0.01em",
          }}
        >
          {value}
        </span>
        {/* ink-700 on concrete-50 is ~8.4:1 — comfortably above 4.5:1 at this small size */}
        <span className="mono-caps" style={{ color: "var(--ink-700)" }}>
          {metric.label}
        </span>
      </div>
    </div>
  );
}

export default ProofStrip;
