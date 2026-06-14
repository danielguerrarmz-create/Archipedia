/**
 * ProofStrip — a thin hairline band of mono metrics that COUNT UP on enter,
 * divided by AxisTick-style node dividers. No logo wall.
 */
import { useCountUp } from "./landingShared";
import { Node } from "../motif";

interface Metric {
  value: number;
  suffix?: string;
  label: string;
}

const METRICS: Metric[] = [
  { value: 13411, label: "BUILT PROJECTS" },
  { value: 41, label: "TYPOLOGIES" },
  { value: 92, label: "COUNTRIES" },
];

export function ProofStrip({ motionOn }: { motionOn: boolean }) {
  return (
    <section
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
          alignItems: "stretch",
          flexWrap: "wrap",
        }}
      >
        {METRICS.map((m, i) => (
          <Stat key={m.label} metric={m} motionOn={motionOn} divider={i > 0} />
        ))}
      </div>
    </section>
  );
}

function Stat({ metric, motionOn, divider }: { metric: Metric; motionOn: boolean; divider: boolean }) {
  const { ref, value } = useCountUp(metric.value, motionOn);
  return (
    <div
      style={{
        flex: "1 1 180px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "20px 0 20px 24px",
        borderLeft: divider ? "1px solid var(--hairline)" : "none",
        marginLeft: divider ? -1 : 0,
      }}
    >
      <Node size={6} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <span
          ref={ref}
          className="mono"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 20,
            fontWeight: 500,
            color: "var(--ink-900)",
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "0.01em",
          }}
        >
          {value}
        </span>
        <span className="mono-caps" style={{ color: "var(--ink-500)" }}>
          {metric.label}
        </span>
      </div>
    </div>
  );
}

export default ProofStrip;
