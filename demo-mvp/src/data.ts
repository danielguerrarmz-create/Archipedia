import type { DemoData, Meta, Project } from "./types";

const base = import.meta.env.BASE_URL;

async function getJSON<T>(name: string): Promise<T> {
  const res = await fetch(`${base}data/${name}`);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export async function loadDemoData(): Promise<DemoData> {
  const [projects, meta] = await Promise.all([getJSON<Project[]>("projects.json"), getJSON<Meta>("meta.json")]);
  return { projects, byId: new Map(projects.map((p) => [p.id, p])), meta };
}

/** Stable small integer from a string, so rotations and pin seeds never jump between renders. */
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

export function place(p: Project): string {
  return [p.city, p.country].filter(Boolean).join(", ");
}

/** Year first, so the number survives when a long credit truncates. */
export function metaLine(p: Project): string {
  return [p.year, p.country, p.architect].filter(Boolean).join(" · ");
}

export function citation(p: Project, accessed: string): string {
  const where = place(p);
  return (
    `${p.architect.replace(/\.+$/, "")}. ${p.title}${where ? `, ${where}` : ""}, ${p.year}.` +
    (p.source ? ` ArchDaily, ${p.source} (accessed ${accessed}). Photographs: credited on the ArchDaily page.` : "")
  );
}

const STOP = new Set(["a", "an", "the", "in", "of", "on", "at", "by", "for", "with", "and", "or", "to", "like", "that", "feel", "feels", "looks", "building", "buildings"]);

/**
 * Keyword filter over names and metadata. It is not semantic search and the UI says so.
 * A project matches if ANY meaningful word matches; more matched words rank higher.
 */
export function filterProjects(projects: Project[], q: string): Project[] {
  const terms = q.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((t) => t && !STOP.has(t));
  if (!terms.length) return projects;
  const scored: { p: Project; n: number }[] = [];
  for (const p of projects) {
    const hay = `${p.title} ${p.architect} ${p.city ?? ""} ${p.country} ${p.typology ?? ""} ${p.year}`.toLowerCase();
    const n = terms.filter((t) => hay.includes(t)).length;
    if (n) scored.push({ p, n });
  }
  return scored.sort((a, b) => b.n - a.n).map((s) => s.p);
}
