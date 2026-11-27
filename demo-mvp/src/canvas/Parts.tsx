import type { AssemblyHit } from "../engine";

/**
 * Per-building similarity under a result. The building that carried the card is
 * bold; Unlike streams read "not B". No separators, so wrapping never strands one.
 */
export function Parts({
  hit,
  letterOf,
  avoid,
  compact,
}: {
  hit: AssemblyHit;
  letterOf: (nodeId: string) => string;
  avoid: string[];
  compact?: boolean;
}) {
  const entries = Object.entries(hit.parts);
  return (
    <span className={`parts num${compact ? " parts--compact" : ""}`} aria-label={entries.map(([nid, s]) => `${avoid.includes(nid) ? "unlike " : ""}${letterOf(nid)} ${s.toFixed(2)}`).join(", ")}>
      {entries.map(([nid, s]) => (
        <span key={nid} className={`part${nid === hit.carrier ? " is-carrier" : ""}${avoid.includes(nid) ? " is-avoid" : ""}`} aria-hidden>
          {avoid.includes(nid) ? "not " : ""}
          {letterOf(nid)} {s.toFixed(2)}
        </span>
      ))}
    </span>
  );
}
