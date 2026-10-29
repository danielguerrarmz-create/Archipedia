/**
 * Search by Assembly, in the browser.
 *
 * Every number here comes from real DINOv2 vectors exported from the production
 * FAISS index (vectors.bin, int8 with a per-row scale in scales.bin). One measure
 * everywhere: cosine similarity, higher is closer. A project's similarity to a
 * query image is its best match over the images its card shows, and the result
 * remembers WHICH image matched so the UI can show it. An assembly fuses several
 * evidence streams with explicit weights. Nothing is rescaled into a percentage.
 */
import type { DemoData, Project } from "./types";

export interface Vectors {
  dim: number;
  data: Int8Array;
  scale: Float32Array;
}

export async function loadVectors(meta: DemoData["meta"]): Promise<Vectors> {
  const base = `${import.meta.env.BASE_URL}data/`;
  const { file, scales, dim, rows } = meta.vectors;
  const [a, b] = await Promise.all([fetch(base + file), fetch(base + scales)]);
  if (!a.ok || !b.ok) throw new Error(`image vectors: HTTP ${a.status}/${b.status}`);
  const data = new Int8Array(await a.arrayBuffer());
  const scale = new Float32Array(await b.arrayBuffer());
  // Static hosts often answer a missing file with index.html and a 200. Reject anything
  // that is not exactly the expected size rather than score against garbage.
  if (data.length !== rows * dim || scale.length !== rows) {
    throw new Error(`image vectors have the wrong size (${data.length} bytes, expected ${rows * dim})`);
  }
  return { dim, data, scale };
}

function cosine(v: Vectors, a: number, b: number): number {
  const { dim, data } = v;
  let s = 0;
  const oa = a * dim;
  const ob = b * dim;
  for (let i = 0; i < dim; i++) s += data[oa + i] * data[ob + i];
  return s * v.scale[a] * v.scale[b];
}

export interface Match {
  score: number;
  /** Index into the candidate project's images of the photo that matched best. */
  image: number;
}

const cache = new Map<number, Match[]>();

/** Similarity of every project to one query image row (cached per row). */
export function scoreAgainst(data: DemoData, v: Vectors, queryRow: number): Match[] {
  const hit = cache.get(queryRow);
  if (hit) return hit;
  const out = data.projects.map((p) => {
    const [start, count] = p.v;
    let best = -2;
    let image = 0;
    for (let r = start; r < start + count; r++) {
      const s = cosine(v, queryRow, r);
      if (s > best) {
        best = s;
        image = r - start;
      }
    }
    return { score: best, image };
  });
  cache.set(queryRow, out);
  return out;
}

export interface Evidence {
  /** Canvas node id (or any label key), so the UI can label each contribution. */
  nodeId: string;
  projectId: string;
  /** Which of the project's images carries the idea (0..count-1). */
  imageIndex: number;
  /** Relative weight from the slider, any positive scale. */
  weight: number;
  /** "avoid" subtracts this stream: like A, but not like B. */
  mode: "include" | "avoid";
}

export interface Constraint {
  countries: string[];
  yearMin: number | null;
  yearMax: number | null;
  architect: string;
}

export interface AssemblyHit {
  project: Project;
  /** Weighted cosine after fusion. */
  score: number;
  /** Raw cosine per evidence stream, keyed by node id. */
  parts: Record<string, number>;
  /** The candidate's photo that matched the heaviest liked stream best. */
  image: number;
  /** The liked stream that contributed most to this card's score. */
  carrier: string | null;
}

export interface AssemblyResult {
  hits: AssemblyHit[];
  /** Candidates that passed every filter, before ranking. */
  pool: number;
  /** Candidates before filters (every project not used as a building). */
  total: number;
  /** Streams set to Unlike, by node id. */
  avoid: string[];
  /** Why there is nothing to show, when there is nothing. */
  empty: null | "no-evidence" | "no-building" | "no-like" | "filtered-out";
}

export function passes(p: Project, c: Constraint): boolean {
  if (c.countries.length && !c.countries.includes(p.country)) return false;
  if (c.yearMin != null && Number.isFinite(c.yearMin) && p.year < c.yearMin) return false;
  if (c.yearMax != null && Number.isFinite(c.yearMax) && p.year > c.yearMax) return false;
  if (c.architect.trim() && !p.architect.toLowerCase().includes(c.architect.trim().toLowerCase())) return false;
  return true;
}

/** Normalised share of each stream: likes sum to 1, unlikes are a share of the like total. */
export function shares(evidence: Evidence[]): Record<string, number> {
  const live = evidence.filter((e) => e.weight > 0);
  const total = live.filter((e) => e.mode === "include").reduce((a, e) => a + e.weight, 0);
  const out: Record<string, number> = {};
  for (const e of live) out[e.nodeId] = total ? e.weight / total : 0;
  return out;
}

export function assemble(
  data: DemoData,
  v: Vectors,
  evidence: Evidence[],
  constraints: Constraint[],
  limit = 12,
): AssemblyResult {
  const none = (empty: AssemblyResult["empty"]): AssemblyResult => ({ hits: [], pool: 0, total: 0, avoid: [], empty });
  if (!evidence.length) return none("no-evidence");
  const valid = evidence.filter((e) => data.byId.has(e.projectId));
  if (!valid.length) return none("no-building");
  const live = valid.filter((e) => e.weight > 0);
  const include = live.filter((e) => e.mode === "include");
  if (!include.length) return none("no-like");

  const w = shares(live);
  // Every connected building is excluded from its own results, whatever its weight,
  // so the candidate count does not jump when a slider touches 0.
  const sources = new Set(valid.map((e) => e.projectId));

  const streams = live.map((e) => {
    const p = data.byId.get(e.projectId)!;
    const row = p.v[0] + Math.min(Math.max(0, e.imageIndex), p.v[1] - 1);
    return { e, s: scoreAgainst(data, v, row), w: w[e.nodeId] };
  });

  const hits: AssemblyHit[] = [];
  let pool = 0;
  let total = 0;
  data.projects.forEach((p, k) => {
    if (sources.has(p.id)) return;
    total++;
    if (!constraints.every((c) => passes(p, c))) return;
    pool++;
    let score = 0;
    let image = 0;
    let carrier: string | null = null;
    let best = -Infinity;
    const parts: Record<string, number> = {};
    for (const { e, s, w: share } of streams) {
      parts[e.nodeId] = s[k].score;
      if (e.mode === "include") {
        const c = share * s[k].score;
        score += c;
        if (c > best) {
          best = c;
          carrier = e.nodeId;
          image = s[k].image;
        }
      } else {
        score -= share * s[k].score;
      }
    }
    hits.push({ project: p, score, parts, image, carrier });
  });
  hits.sort((a, b) => b.score - a.score);
  return {
    hits: hits.slice(0, limit),
    pool,
    total,
    avoid: live.filter((e) => e.mode === "avoid").map((e) => e.nodeId),
    empty: pool ? null : "filtered-out",
  };
}
