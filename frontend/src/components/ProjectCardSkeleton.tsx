import { Skeleton } from "./ui/skeleton";

/*
 * ProjectCardSkeleton — Concrete & Signal.
 * concrete-100 + hairline, opacity breathe (via Skeleton).
 */
export function ProjectCardSkeleton() {
  return (
    <div
      style={{
        width: 280,
        background: "var(--concrete-0)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--raised)",
        overflow: "hidden",
      }}
    >
      {/* Image placeholder */}
      <Skeleton style={{ width: "100%", height: 200, borderRadius: 0 }} />
      <div style={{ padding: "12px 16px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton style={{ height: 16, width: "72%", borderRadius: "var(--radius-sm)" }} />
        <Skeleton style={{ height: 11, width: "48%", borderRadius: "var(--radius-sm)" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <Skeleton style={{ height: 11, width: 64, borderRadius: "var(--radius-sm)" }} />
          <Skeleton style={{ height: 11, width: 48, borderRadius: "var(--radius-sm)" }} />
        </div>
      </div>
    </div>
  );
}
