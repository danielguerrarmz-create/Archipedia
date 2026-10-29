import { type DragEvent as ReactDragEvent, type ReactNode, createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Handle,
  Position,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type OnSelectionChangeParams,
  type Edge,
  type Node,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import { assemble, type AssemblyHit, type AssemblyResult, type Constraint, type Evidence, type Vectors } from "../engine";
import { Parts } from "./Parts";
import { filterProjects, metaLine } from "../data";
import type { DemoData } from "../types";

/* ── Node data ──────────────────────────────────────────────────────────── */
type PrecedentData = { kind: "precedent"; letter: string; projectId: string | null; imageIndex: number };
type FilterData = { kind: "filter" } & Constraint;
type AssembleData = { kind: "assemble"; weights: Record<string, number>; modes: Record<string, "include" | "avoid"> };
type ResultsData = { kind: "results" };
type AnyData = PrecedentData | FilterData | AssembleData | ResultsData;
type Kind = AnyData["kind"];

/* Layout: buildings in a two-column grid on the left, filters under them, Blend then
   Results to the right. Uses measured node heights, so tall nodes never overlap. */
const EST_H: Record<Kind, number> = { precedent: 340, filter: 290, assemble: 250, results: 400 };
const W: Record<Kind, number> = { precedent: 230, filter: 230, assemble: 280, results: 320 };
const GAP = 28;
const COL_GAP = 56;

function tidy(nodes: Node<AnyData>[]): Node<AnyData>[] {
  const h = (n: Node<AnyData>) => n.height ?? EST_H[n.data.kind];
  const of = (k: Kind) => nodes.filter((n) => n.data.kind === k);
  const pos = new Map<string, { x: number; y: number }>();
  const pre = of("precedent").sort((a, b) => ((a.data as PrecedentData).letter < (b.data as PrecedentData).letter ? -1 : 1));
  const cols = Math.max(1, Math.min(4, Math.ceil(Math.sqrt(pre.length))));
  let y = 0;
  for (let r = 0; r * cols < pre.length; r++) {
    const row = pre.slice(r * cols, r * cols + cols);
    row.forEach((n, c) => pos.set(n.id, { x: c * (W.precedent + 20), y }));
    y += Math.max(...row.map(h)) + GAP;
  }
  const fil = of("filter");
  fil.forEach((n, i) => pos.set(n.id, { x: i * (W.filter + 20), y }));
  if (fil.length) y += Math.max(...fil.map(h)) + GAP;
  const leftW = Math.max(cols * W.precedent + (cols - 1) * 20, fil.length * (W.filter + 20) - 20);
  const blendX = (pre.length || fil.length ? leftW : 0) + COL_GAP;
  let by = 0;
  for (const n of of("assemble")) {
    pos.set(n.id, { x: blendX, y: by });
    by += h(n) + GAP;
  }
  const resX = blendX + (of("assemble").length ? W.assemble + COL_GAP : 0);
  let ry = 0;
  for (const n of of("results")) {
    pos.set(n.id, { x: resX, y: ry });
    ry += h(n) + GAP;
  }
  return nodes.map((n) => ({ ...n, position: pos.get(n.id) ?? n.position }));
}

const START_NODES: Node<AnyData>[] = [
  { id: "pre-1", type: "precedent", position: { x: 0, y: 0 }, data: { kind: "precedent", letter: "A", projectId: "p_le_carrier_cabin_gauthier_cammas_1036699", imageIndex: 0 } },
  { id: "pre-2", type: "precedent", position: { x: 0, y: 450 }, data: { kind: "precedent", letter: "B", projectId: "p_river_chapel_la_barca_clement_molinier_1036905", imageIndex: 0 } },
  { id: "asm-1", type: "assemble", position: { x: 300, y: 150 }, data: { kind: "assemble", weights: { "pre-1": 70, "pre-2": 30 }, modes: {} } },
  { id: "fil-1", type: "filter", position: { x: 300, y: 450 }, data: { kind: "filter", countries: [], yearMin: null, yearMax: null, architect: "" } },
  { id: "res-1", type: "results", position: { x: 640, y: 110 }, data: { kind: "results" } },
];
const START_EDGES: Edge[] = [
  { id: "e-pre-1-asm-1", source: "pre-1", target: "asm-1" },
  { id: "e-pre-2-asm-1", source: "pre-2", target: "asm-1" },
  { id: "e-fil-1-asm-1", source: "fil-1", target: "asm-1" },
  { id: "e-asm-1-res-1", source: "asm-1", target: "res-1" },
];

const GRAPH_KEY = "archipedia-demo-graph-v2";

function loadGraph(data: DemoData): { nodes: Node<AnyData>[]; edges: Edge[] } | null {
  try {
    const raw = localStorage.getItem(GRAPH_KEY);
    if (!raw) return null;
    const g = JSON.parse(raw) as { nodes: Node<AnyData>[]; edges: Edge[] };
    if (!Array.isArray(g.nodes) || !Array.isArray(g.edges)) return null;
    if (!g.nodes.every((n) => n.type && n.data && n.data.kind)) return null;
    // A building that left the index becomes an empty building, rather than losing the whole graph.
    const nodes = g.nodes.map((n) =>
      n.data.kind === "precedent" && n.data.projectId && !data.byId.has(n.data.projectId)
        ? { ...n, data: { ...n.data, projectId: null } }
        : n,
    );
    return { nodes, edges: g.edges };
  } catch {
    return null;
  }
}

function saveGraph(nodes: Node<AnyData>[], edges: Edge[]) {
  try {
    const slim = nodes.map(({ id, type, position, data }) => ({ id, type, position, data }));
    const es = edges.map(({ id, source, target }) => ({ id, source, target }));
    localStorage.setItem(GRAPH_KEY, JSON.stringify({ nodes: slim, edges: es }));
  } catch {
    /* storage unavailable: the canvas still works for this visit */
  }
}

/* ── Shared context so node bodies can read data and write their own config ─ */
interface Ctx {
  data: DemoData;
  inputsOf: (id: string) => { precedents: Node<PrecedentData>[]; filters: Node<FilterData>[] };
  resultOf: (id: string) => AssemblyResult | null;
  blendOf: (id: string) => AssemblyResult | null;
  letterOf: (nodeId: string) => string;
  patch: (id: string, p: Partial<AnyData>) => void;
  remove: (id: string) => void;
  onOpen: (id: string, photo?: number) => void;
}
const CanvasCtx = createContext<Ctx | null>(null);
const useCanvas = () => useContext(CanvasCtx)!;

/* Results can be dragged onto the canvas (new Building) or onto a Building (replace it). */
const DND = "application/archipedia-precedent";
function dragProject(e: ReactDragEvent, id: string, photo: number) {
  e.dataTransfer.setData(DND, JSON.stringify({ id, photo }));
  e.dataTransfer.effectAllowed = "copy";
}

/* ── Shared node frame: raised concrete, mono header, ink square ports ──── */
function Frame({ id, title, tag, width, children, inPort, outPort, dark }: {
  id: string; title: string; tag?: string; width: number; children: ReactNode; inPort?: boolean; outPort?: boolean; dark?: boolean;
}) {
  const { remove } = useCanvas();
  return (
    <div className="nf" style={{ width }}>
      {inPort && <Handle type="target" position={Position.Left} className="port" />}
      <div className="nf__head">
        <span className="mono-caps">{title}</span>
        <span className="nf__head-right">
          {tag && <span className={`nf__tag${dark ? " is-dark" : ""}`}>{tag}</span>}
          <button type="button" className="nf__x nodrag" onClick={() => remove(id)} aria-label={`Remove ${title}${tag ? ` ${tag}` : ""}`} title="Remove (undo with Ctrl+Z)">
            ×
          </button>
        </span>
      </div>
      <div className="nf__body">{children}</div>
      {outPort && <Handle type="source" position={Position.Right} className="port port--out" />}
    </div>
  );
}

/* ── Precedent: a real project, and the one photo that carries the idea ── */
function PrecedentNode({ id, data }: NodeProps<PrecedentData>) {
  const { data: d, patch } = useCanvas();
  const p = data.projectId ? d.byId.get(data.projectId) : undefined;
  const [picking, setPicking] = useState(!p);
  const [q, setQ] = useState("");
  const options = useMemo(() => filterProjects(d.projects, q).slice(0, 8), [d.projects, q]);

  return (
    <Frame id={id} title="Building" tag={data.letter} width={230} outPort>
      {p && !picking ? (
        <>
          <div className="nf__img">
            <img src={p.images[data.imageIndex] ?? p.image} alt={p.title} draggable={false} />
          </div>
          <p className="nf__title">{p.title}</p>
          <p className="nf__meta">{metaLine(p)}</p>
          {p.images.length > 1 && (
            <>
              <p className="nf__label">Which photo carries the idea?</p>
              <div className="nf__motifs nodrag" role="group" aria-label={`Photo used for ${data.letter}`}>
                {p.images.map((src, i) => (
                  <button key={src} type="button" className={i === data.imageIndex ? "is-on" : ""} onClick={() => patch(id, { imageIndex: i })} aria-label={`Use photo ${i + 1} of ${p.images.length}`} aria-pressed={i === data.imageIndex}>
                    <img src={src} alt="" draggable={false} />
                  </button>
                ))}
              </div>
            </>
          )}
          <button type="button" className="nf__link nodrag" onClick={() => setPicking(true)}>Change building</button>
        </>
      ) : (
        <div className="nf__picker nodrag nowheel">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, architect or country" aria-label={`Find a building for ${data.letter}`} />
          <ul>
            {options.map((o) => (
              <li key={o.id}>
                <button type="button" onClick={() => { patch(id, { projectId: o.id, imageIndex: 0 }); setPicking(false); setQ(""); }}>
                  <img src={o.image} alt="" />
                  <span><b>{o.title}</b><i>{o.architect}</i></span>
                </button>
              </li>
            ))}
            {!options.length && <li className="nf__none">No match. Try one word, like “house”.</li>}
          </ul>
          {p && <button type="button" className="nf__link" onClick={() => setPicking(false)}>Cancel</button>}
        </div>
      )}
    </Frame>
  );
}

/* ── Attributes: hard constraints from real metadata ────────────────────── */
function yearOf(v: string): number | null {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  return digits ? Number(digits) : null;
}

export function filterSummary(f: Constraint): string[] {
  const out: string[] = [];
  if (f.countries.length) out.push(f.countries.join(" or "));
  if (f.yearMin != null && f.yearMax != null) out.push(`${f.yearMin} to ${f.yearMax}`);
  else if (f.yearMin != null) out.push(`${f.yearMin} or later`);
  else if (f.yearMax != null) out.push(`${f.yearMax} or earlier`);
  if (f.architect.trim()) out.push(`architect “${f.architect.trim()}”`);
  return out;
}

function FilterNode({ id, data }: NodeProps<FilterData>) {
  const { data: d, patch } = useCanvas();
  const countries = useMemo(() => [...new Set(d.projects.map((p) => p.country))].sort(), [d.projects]);
  return (
    <Frame id={id} title="Filter" width={230} outPort>
      <div className="nf__form nodrag nowheel">
        <label>
          <span>Country</span>
          <select value="" onChange={(e) => e.target.value && patch(id, { countries: [...data.countries, e.target.value] })}>
            <option value="">{data.countries.length ? "Add another country" : "Any country"}</option>
            {countries.filter((c) => !data.countries.includes(c)).map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        {data.countries.length > 0 && (
          <div className="chips">
            {data.countries.map((c) => (
              <button key={c} type="button" onClick={() => patch(id, { countries: data.countries.filter((x) => x !== c) })} aria-label={`Remove ${c}`}>{c} ×</button>
            ))}
          </div>
        )}
        <div className="nf__row">
          <label><span>Built from</span><input inputMode="numeric" value={data.yearMin ?? ""} onChange={(e) => patch(id, { yearMin: yearOf(e.target.value) })} placeholder="Year" /></label>
          <label><span>To</span><input inputMode="numeric" value={data.yearMax ?? ""} onChange={(e) => patch(id, { yearMax: yearOf(e.target.value) })} placeholder="Year" /></label>
        </div>
        <label><span>Architect</span><input value={data.architect} onChange={(e) => patch(id, { architect: e.target.value })} placeholder="Any" /></label>
      </div>
    </Frame>
  );
}

/* ── Assemble: the designer-steerable fusion, with explicit weights ─────── */
function BlendControls({ id, data }: { id: string; data: AssembleData }) {
  const { data: d, inputsOf, patch, blendOf } = useCanvas();
  const res = blendOf(id);
  const { precedents: wired, filters } = inputsOf(id);
  const precedents = [...wired].sort((a, b) => (a.data.letter < b.data.letter ? -1 : 1));
  const filled = precedents.filter((n) => n.data.projectId);
  const likeTotal = filled.reduce((a, n) => a + ((data.modes[n.id] ?? "include") === "include" ? data.weights[n.id] ?? 50 : 0), 0);
  const active = filters.flatMap((f) => filterSummary(f.data));

  return (
    <>
      {precedents.length === 0 ? (
        <p className="nf__hint">Connect buildings here. Each one pulls the results toward itself.</p>
      ) : (
        <ul className="streams nodrag nowheel">
          {precedents.map((n) => {
            const p = n.data.projectId ? d.byId.get(n.data.projectId) : undefined;
            const w = data.weights[n.id] ?? 50;
            const mode = data.modes[n.id] ?? "include";
            const share = p && likeTotal > 0 ? Math.round((w / likeTotal) * 100) : null;
            return (
              <li key={n.id}>
                <div className="streams__top">
                  <span className="nf__tag">{n.data.letter}</span>
                  <span className="streams__name" title={p?.title}>{p?.title ?? "No building yet"}</span>
                  <button
                    type="button"
                    className={`mode${mode === "avoid" ? " is-avoid" : ""}`}
                    onClick={() => patch(id, { modes: { ...data.modes, [n.id]: mode === "avoid" ? "include" : "avoid" } })}
                    aria-pressed={mode === "avoid"}
                    aria-label={`${mode === "avoid" ? "Unlike" : "Like"}, building ${n.data.letter}. Toggle to ${mode === "avoid" ? "pull toward" : "push away from"} it`}
                  >
                    {mode === "avoid" ? "Unlike" : "Like"}
                  </button>
                </div>
                <div className="streams__slider">
                  <input type="range" min={0} max={100} value={w} onChange={(e) => patch(id, { weights: { ...data.weights, [n.id]: Number(e.target.value) } })} aria-label={`Weight of ${n.data.letter}`} aria-valuetext={`${w} of 100`} />
                  <span className="num streams__w">{w}</span>
                </div>
                <p className="streams__share">
                  {!p ? "Pick a building to use this stream" : mode === "avoid" ? `pushes away with weight ${w}` : share == null ? "" : `${share}% of the pull`}
                </p>
              </li>
            );
          })}
        </ul>
      )}
      <p className="nf__meta">
        {filters.length === 0
          ? "No filter connected"
          : !active.length
            ? "Filter connected, nothing set"
            : `Filtered: ${active.join(" · ")}${res && !res.empty ? ` · ${res.total - res.pool} of ${res.total} removed` : ""}`}
      </p>
    </>
  );
}

function AssembleNode({ id, data }: NodeProps<AssembleData>) {
  return (
    <Frame id={id} title="Blend" width={280} inPort outPort>
      <BlendControls id={id} data={data} />
    </Frame>
  );
}

/* ── Results: the fused ranking, live ───────────────────────────────────── */
const EMPTY_COPY: Record<NonNullable<AssemblyResult["empty"]>, string> = {
  "no-evidence": "Connect at least one building to Blend.",
  "no-building": "Pick a building in the connected Building node.",
  "no-like": "Every building is set to Unlike or weight 0. Like at least one.",
  "filtered-out": "No building passes these filters. Loosen them.",
};

function ResultsNode({ id }: NodeProps<ResultsData>) {
  const { resultOf, onOpen, letterOf } = useCanvas();
  const r = resultOf(id);
  return (
    <Frame id={id} title="Results" tag={r && r.hits.length ? `best 6 of ${r.pool}` : undefined} width={320} inPort>
      {!r ? (
        <p className="nf__hint">Connect a Blend node, or a single building, to see matches.</p>
      ) : r.empty ? (
        <p className="nf__hint">{EMPTY_COPY[r.empty]}</p>
      ) : (
        <ol className="rgrid nodrag">
          {r.hits.slice(0, 6).map((h, i) => (
            <li key={h.project.id} draggable onDragStart={(e) => dragProject(e, h.project.id, h.image)}>
              <button type="button" onClick={() => onOpen(h.project.id, h.image)} title={`${h.project.title} · ${h.project.architect}`} aria-label={`${i + 1}. ${h.project.title}, open study`}>
                <img src={h.project.images[h.image] ?? h.project.image} alt="" draggable={false} />
                <span className="rgrid__rank num">{String(i + 1).padStart(2, "0")}</span>
              </button>
              <Parts hit={h} letterOf={letterOf} avoid={r.avoid} compact />
            </li>
          ))}
        </ol>
      )}
    </Frame>
  );
}

const nodeTypes = { precedent: PrecedentNode, filter: FilterNode, assemble: AssembleNode, results: ResultsNode };

const ACCEPTS: Record<string, string[]> = {
  assemble: ["precedent", "filter"],
  results: ["assemble", "precedent"],
};

function useNarrow(px = 760) {
  const q = `(max-width: ${px}px)`;
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setNarrow(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [q]);
  return narrow;
}

export interface Published {
  hits: AssemblyHit[];
  pool: number;
  total: number;
  letters: Record<string, string>;
  avoid: string[];
}

interface Props {
  data: DemoData;
  vectors: Vectors;
  onOpen: (id: string, photo?: number) => void;
  onResults: (r: Published) => void;
  addRequest: { id: string; nonce: number } | null;
  pinned: Set<string>;
  onTogglePin: (id: string, photo?: number) => void;
}

const TITLE_KEY = "archipedia-demo-study-title";
const COUNTRY_CHIPS = 10;

/* ── The canvas ─────────────────────────────────────────────────────────── */
function Canvas({ data, vectors, onOpen, onResults, addRequest, pinned, onTogglePin }: Props) {
  const initial = useMemo(() => loadGraph(data) ?? { nodes: START_NODES, edges: START_EDGES }, [data]);
  const [nodes, setNodes, onNodesChange] = useNodesState<AnyData>(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const flow = useReactFlow();
  const narrow = useNarrow();
  const seq = useRef(Math.max(10, ...initial.nodes.map((n) => Number(n.id.split("-")[1]) || 0)));
  // Lay out again once React Flow has measured the nodes (fresh start, reset, or an added node).
  const pendingTidy = useRef(!loadGraph(data));
  useEffect(() => {
    if (!pendingTidy.current || !nodes.length || nodes.some((n) => n.height == null)) return;
    pendingTidy.current = false;
    setNodes((ns) => tidy(ns));
    window.setTimeout(() => flow.fitView({ padding: 0.06, maxZoom: 1, duration: 250 }), 40);
  }, [nodes, setNodes, flow]);

  useEffect(() => saveGraph(nodes, edges), [nodes, edges]);

  // General undo: a capped stack of graph snapshots, pushed before every structural change.
  const latest = useRef({ nodes, edges });
  latest.current = { nodes, edges };
  const history = useRef<{ nodes: Node<AnyData>[]; edges: Edge[] }[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const snapshot = useCallback(() => {
    history.current.push({ nodes: latest.current.nodes, edges: latest.current.edges });
    if (history.current.length > 40) history.current.shift();
    setCanUndo(true);
  }, []);
  const undoLast = useCallback(() => {
    const prev = history.current.pop();
    setCanUndo(history.current.length > 0);
    if (!prev) return;
    setNodes(prev.nodes);
    setEdges(prev.edges);
  }, [setNodes, setEdges]);

  const onNodesChangeSafe = useCallback((changes: NodeChange[]) => {
    if (changes.some((c) => c.type === "remove")) snapshot();
    onNodesChange(changes);
  }, [onNodesChange, snapshot]);
  const onEdgesChangeSafe = useCallback((changes: EdgeChange[]) => {
    if (changes.some((c) => c.type === "remove")) snapshot();
    onEdgesChange(changes);
  }, [onEdgesChange, snapshot]);

  const remove = useCallback((id: string) => {
    snapshot();
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
  }, [snapshot, setNodes, setEdges]);

  // Delete/Backspace only act on the canvas while the pointer or keyboard is working in it.
  const centreRef = useRef<HTMLDivElement>(null);
  const [inCanvas, setInCanvas] = useState(false);
  useEffect(() => {
    const on = (e: Event) => setInCanvas(!!centreRef.current?.contains(e.target as HTMLElement));
    document.addEventListener("pointerdown", on, true);
    document.addEventListener("focusin", on, true);
    return () => {
      document.removeEventListener("pointerdown", on, true);
      document.removeEventListener("focusin", on, true);
    };
  }, []);

  // The right panel follows the selected node, as the old canvas did.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const onSelectionChange = useCallback(({ nodes: sel }: OnSelectionChangeParams) => setSelectedId(sel[0]?.id ?? null), []);

  const patch = useCallback((id: string, p: Partial<AnyData>) => {
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...p } as AnyData } : n)));
  }, [setNodes]);

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const letterOf = useCallback((nid: string) => {
    const n = byId.get(nid);
    return n?.data.kind === "precedent" ? n.data.letter : "?";
  }, [byId]);

  const inputsOf = useCallback((id: string) => {
    const src = edges.filter((e) => e.target === id).map((e) => byId.get(e.source)).filter(Boolean) as Node<AnyData>[];
    return {
      precedents: src.filter((n) => n.type === "precedent") as Node<PrecedentData>[],
      filters: src.filter((n) => n.type === "filter") as Node<FilterData>[],
    };
  }, [edges, byId]);

  // Evaluate every Blend node once per change; Results read from them.
  const assembled = useMemo(() => {
    const out = new Map<string, AssemblyResult>();
    for (const n of nodes) {
      if (n.type !== "assemble") continue;
      const a = n.data as AssembleData;
      const { precedents, filters } = inputsOf(n.id);
      const evidence: Evidence[] = precedents.map((s) => ({
        nodeId: s.id,
        projectId: s.data.projectId ?? "",
        imageIndex: s.data.imageIndex,
        weight: a.weights[s.id] ?? 50,
        mode: a.modes[s.id] ?? "include",
      }));
      out.set(n.id, assemble(data, vectors, evidence, filters.map((f) => f.data), 12));
    }
    return out;
  }, [nodes, inputsOf, data, vectors]);

  const blendOf = useCallback((id: string) => assembled.get(id) ?? null, [assembled]);

  const resultOf = useCallback((id: string): AssemblyResult | null => {
    const e = edges.find((x) => x.target === id);
    const src = e && byId.get(e.source);
    if (!src) return null;
    if (src.type === "assemble") return assembled.get(src.id) ?? null;
    const pd = src.data as PrecedentData;
    if (src.type === "precedent") {
      return assemble(data, vectors, [{ nodeId: src.id, projectId: pd.projectId ?? "", imageIndex: pd.imageIndex, weight: 1, mode: "include" }], [], 12);
    }
    return null;
  }, [edges, byId, assembled, data, vectors]);

  // Publish the first Results node's ranking, only when it actually changes.
  const lastSig = useRef("");
  useEffect(() => {
    const r = nodes.find((n) => n.type === "results");
    const res = r ? resultOf(r.id) : null;
    const hits = res?.hits ?? [];
    const letters: Record<string, string> = {};
    nodes.forEach((n) => { if (n.data.kind === "precedent") letters[n.id] = n.data.letter; });
    const avoid = res?.avoid ?? [];
    const sig = JSON.stringify([hits.map((h) => [h.project.id, h.score.toFixed(4), h.image, h.carrier]), res?.pool, res?.total, letters, avoid]);
    if (sig === lastSig.current) return;
    lastSig.current = sig;
    onResults({ hits, pool: res?.pool ?? 0, total: res?.total ?? 0, letters, avoid });
  }, [nodes, resultOf, onResults]);

  const isValidConnection = useCallback((c: Connection) => {
    const s = c.source ? byId.get(c.source) : undefined;
    const t = c.target ? byId.get(c.target) : undefined;
    return !!s && !!t && (ACCEPTS[t.type ?? ""] ?? []).includes(s.type ?? "");
  }, [byId]);

  const label = useCallback((s: string, t: string) => {
    const name = (id: string) => {
      const n = byId.get(id);
      if (!n) return id;
      if (n.data.kind === "precedent") return `building ${n.data.letter}`;
      return n.data.kind === "assemble" ? "Blend" : n.data.kind === "filter" ? "Filter" : "Results";
    };
    return `From ${name(s)} to ${name(t)}`;
  }, [byId]);

  const wire = useCallback((es: Edge[], source: string, target: string) => {
    const t = byId.get(target);
    // A Results node shows one ranking: a new wire replaces the old one.
    const kept = t?.type === "results" ? es.filter((e) => e.target !== target) : es;
    if (kept.some((e) => e.source === source && e.target === target)) return kept;
    return [...kept, { id: `e-${source}-${target}`, source, target }];
  }, [byId]);

  const onConnect = useCallback((c: Connection) => {
    if (!c.source || !c.target) return;
    snapshot();
    setEdges((es) => wire(es, c.source!, c.target!));
  }, [setEdges, wire, snapshot]);

  // Next free letter, so deleting B never renames C.
  const nextLetter = useCallback(() => {
    const used = new Set(nodes.flatMap((n) => (n.data.kind === "precedent" ? [n.data.letter] : [])));
    for (let i = 0; i < 26; i++) {
      const l = String.fromCharCode(65 + i);
      if (!used.has(l)) return l;
    }
    return `P${used.size + 1}`;
  }, [nodes]);


  // A free spot for a new node, from measured positions. Existing nodes never move.
  const freeSlot = useCallback((kind: Kind) => {
    const h = (n: Node<AnyData>) => n.height ?? EST_H[n.data.kind];
    const w = (n: Node<AnyData>) => n.width ?? W[n.data.kind];
    const same = nodes.filter((n) => n.data.kind === kind);
    if (same.length) {
      const x = Math.min(...same.map((n) => n.position.x));
      const column = nodes.filter((n) => n.position.x < x + W[kind] && n.position.x + w(n) > x);
      return { x, y: Math.max(...column.map((n) => n.position.y + h(n))) + GAP };
    }
    const rightOf = (kinds: Kind[]) => {
      const ns = nodes.filter((n) => kinds.includes(n.data.kind));
      return ns.length ? Math.max(...ns.map((n) => n.position.x + w(n))) + COL_GAP : 0;
    };
    if (kind === "filter") {
      const pre = nodes.filter((n) => n.data.kind === "precedent");
      return { x: pre.length ? Math.min(...pre.map((n) => n.position.x)) : 0, y: pre.length ? Math.max(...pre.map((n) => n.position.y + h(n))) + GAP : 0 };
    }
    if (kind === "assemble") return { x: rightOf(["precedent", "filter"]), y: 0 };
    if (kind === "results") return { x: rightOf(["precedent", "filter", "assemble"]), y: 0 };
    return { x: 0, y: 0 };
  }, [nodes]);

  const add = useCallback((kind: Kind, projectId?: string, at?: { x: number; y: number }, photo = 0) => {
    snapshot();
    const id = `${kind.slice(0, 3)}-${++seq.current}`;
    const dataFor: Record<Kind, AnyData> = {
      precedent: { kind: "precedent", letter: nextLetter(), projectId: projectId ?? null, imageIndex: photo },
      filter: { kind: "filter", countries: [], yearMin: null, yearMax: null, architect: "" },
      assemble: { kind: "assemble", weights: {}, modes: {} },
      results: { kind: "results" },
    };
    const node: Node<AnyData> = { id, type: kind, position: at ?? freeSlot(kind), data: dataFor[kind] };
    setNodes((ns) => [...ns.map((n) => (n.selected ? { ...n, selected: false } : n)), node]);

    // Auto-wire into the obvious place, so a new node is useful without a drag.
    const firstBlend = nodes.find((n) => n.type === "assemble");
    const firstResults = nodes.find((n) => n.type === "results");
    setEdges((es) => {
      if ((kind === "precedent" || kind === "filter") && firstBlend) return wire(es, id, firstBlend.id);
      if (kind === "precedent" && firstResults) return wire(es, id, firstResults.id);
      if (kind === "assemble") {
        const blendIds = new Set(nodes.filter((n) => n.type === "assemble").map((n) => n.id));
        const feeding = new Set(es.filter((e) => blendIds.has(e.target)).map((e) => e.source));
        let next = es;
        for (const n of nodes) {
          if ((n.type === "precedent" || n.type === "filter") && !feeding.has(n.id)) next = wire(next, n.id, id);
        }
        // Results that only showed a single building now show the blend, but only if it has buildings to blend.
        const gotBuildings = next.some((e) => e.target === id && byId.get(e.source)?.type === "precedent");
        const resultsFree = firstResults && !es.some((e) => e.target === firstResults.id);
        if (firstResults && (resultsFree || (gotBuildings && !next.some((e) => e.target === firstResults.id && blendIds.has(e.source))))) {
          next = wire(next, id, firstResults.id);
        }
        return next;
      }
      if (kind === "results") {
        if (firstBlend) return wire(es, firstBlend.id, id);
        const firstBuilding = nodes.find((n) => n.type === "precedent");
        return firstBuilding ? wire(es, firstBuilding.id, id) : es;
      }
      return es;
    });
    // Put the keyboard where the work is: the new building's search field, else the node.
    window.setTimeout(() => {
      const sel = `.react-flow__node[data-id="${id}"]`;
      const el = document.querySelector<HTMLElement>(`${sel} input`) ?? document.querySelector<HTMLElement>(sel);
      el?.focus();
      // Bring the new node into view without zooming the rest out of reach.
      if (!at) flow.fitView({ padding: 0.06, maxZoom: 1, minZoom: 0.6, duration: 250 });
    }, 120);
  }, [nodes, byId, nextLetter, setNodes, setEdges, wire, snapshot, freeSlot, flow]);

  // Drop a dragged result: on a Building it replaces that building, elsewhere it becomes a new one.
  const onDragOver = useCallback((e: ReactDragEvent) => {
    if (!e.dataTransfer.types.includes(DND)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);
  const onDrop = useCallback((e: ReactDragEvent) => {
    const raw = e.dataTransfer.getData(DND);
    if (!raw) return;
    e.preventDefault();
    const { id: pid, photo } = JSON.parse(raw) as { id: string; photo: number };
    const target = (e.target as HTMLElement).closest<HTMLElement>(".react-flow__node");
    const hit = target ? byId.get(target.dataset.id ?? "") : undefined;
    if (hit?.data.kind === "precedent") {
      snapshot();
      patch(hit.id, { projectId: pid, imageIndex: photo });
      return;
    }
    add("precedent", pid, flow.screenToFlowPosition({ x: e.clientX, y: e.clientY }), photo);
  }, [byId, patch, add, flow, snapshot]);

  const lastNonce = useRef<number | null>(null);
  useEffect(() => {
    if (addRequest && addRequest.nonce !== lastNonce.current) {
      lastNonce.current = addRequest.nonce;
      add("precedent", addRequest.id);
    }
  }, [addRequest, add]);

  const reset = () => {
    snapshot();
    setTitle("A cabin, with a little chapel in it");
    pendingTidy.current = true;
    setNodes(START_NODES.map((n) => ({ ...n })));
    setEdges(START_EDGES);
  };
  const tidyNow = () => {
    snapshot();
    setNodes((ns) => tidy(ns));
    window.setTimeout(() => flow.fitView({ padding: 0.06, maxZoom: 1, duration: 250 }), 40);
  };
  const [undo, setUndo] = useState(false);
  const clear = () => {
    snapshot();
    setUndo(true);
    setNodes([]);
    setEdges([]);
  };
  const restore = () => {
    undoLast();
    setUndo(false);
    window.setTimeout(() => flow.fitView({ padding: 0.06, maxZoom: 1 }), 60);
  };
  useEffect(() => {
    if (!undo) return;
    const t = window.setTimeout(() => setUndo(false), 10000);
    return () => window.clearTimeout(t);
  }, [undo]);

  // Keyboard: Ctrl/Cmd+Z undoes, Esc deselects. Never while typing in a field.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable=true]")) return;
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undoLast();
      } else if (e.key === "Escape") {
        setNodes((ns) => ns.map((n) => (n.selected ? { ...n, selected: false } : n)));
        setEdges((es) => es.map((x) => (x.selected ? { ...x, selected: false } : x)));
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [undoLast, setNodes, setEdges]);

  // Save and load a canvas as a file.
  const fileRef = useRef<HTMLInputElement>(null);
  const download = () => {
    const blob = new Blob([JSON.stringify({ app: "archipedia-demo", version: 1, nodes: nodes.map(({ id, type, position, data }) => ({ id, type, position, data })), edges: edges.map(({ id, source, target }) => ({ id, source, target })) }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "archipedia-canvas.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadFile = async (f: File) => {
    try {
      const g = JSON.parse(await f.text()) as { nodes?: Node<AnyData>[]; edges?: Edge[] };
      if (!Array.isArray(g.nodes) || !Array.isArray(g.edges) || !g.nodes.every((n) => n.id && n.type && n.data?.kind)) throw new Error("not an Archipedia canvas file");
      snapshot();
      const ns = g.nodes.map((n) => (n.data.kind === "precedent" && n.data.projectId && !data.byId.has(n.data.projectId) ? { ...n, data: { ...n.data, projectId: null } } : n));
      seq.current = Math.max(seq.current, ...ns.map((n) => Number(n.id.split("-")[1]) || 0));
      setNodes(ns);
      setEdges(g.edges.filter((e) => ns.some((n) => n.id === e.source) && ns.some((n) => n.id === e.target)));
      setLoadError(null);
      window.setTimeout(() => flow.fitView({ padding: 0.06, maxZoom: 1 }), 80);
    } catch (err) {
      setLoadError((err as Error).message);
    }
  };

  // Phones: one readable column at 1:1, no pan or zoom, the page scrolls normally.
  const stacked = useMemo(() => {
    if (!narrow) return null;
    const order: Kind[] = ["assemble", "results", "precedent", "filter"];
    let y = 0;
    const pos = new Map<string, { x: number; y: number }>();
    for (const k of order) {
      for (const n of nodes.filter((m) => m.data.kind === k)) {
        pos.set(n.id, { x: 0, y });
        y += (n.height ?? EST_H[k]) + GAP;
      }
    }
    return { pos, height: Math.max(320, y + 24) };
  }, [narrow, nodes]);
  // Screen-reader names for wires, computed at render so new nodes are named too.
  const shownEdges = useMemo(() => edges.map((e) => ({ ...e, zIndex: 5, ariaLabel: label(e.source, e.target) })), [edges, label]);
  const shownNodes = stacked ? nodes.map((n) => ({ ...n, position: stacked.pos.get(n.id) ?? n.position, draggable: false })) : nodes;

  useEffect(() => {
    if (narrow) flow.setViewport({ x: 12, y: 12, zoom: 1 });
    else window.setTimeout(() => flow.fitView({ padding: 0.06, maxZoom: 1 }), 60);
  }, [narrow, flow]);

  // Refit when the window changes size, so the graph never opens tiny.
  useEffect(() => {
    if (narrow) return;
    let t = 0;
    const on = () => { window.clearTimeout(t); t = window.setTimeout(() => flow.fitView({ padding: 0.06, maxZoom: 1 }), 150); };
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [narrow, flow]);

  const ctx: Ctx = useMemo(() => ({ data, inputsOf, resultOf, blendOf, letterOf, patch, remove, onOpen }), [data, inputsOf, resultOf, blendOf, letterOf, patch, remove, onOpen]);

  // ── Right panel state ──
  const [title, setTitle] = useState(() => {
    try {
      return localStorage.getItem(TITLE_KEY) ?? "A cabin, with a little chapel in it";
    } catch {
      return "A cabin, with a little chapel in it";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(TITLE_KEY, title);
    } catch {
      /* fine for this visit */
    }
  }, [title]);

  const sel = selectedId ? byId.get(selectedId) : undefined;
  // What a node feeds or is fed by, so selecting a Building shows the Blend it belongs to.
  const blendFor = (n?: Node<AnyData>) => {
    if (!n) return undefined;
    if (n.type === "assemble") return n;
    if (n.type === "results") return byId.get(edges.find((e) => e.target === n.id)?.source ?? "");
    return byId.get(edges.find((e) => e.source === n.id && byId.get(e.target)?.type === "assemble")?.target ?? "");
  };
  const selBlend = blendFor(sel);
  const blend = (selBlend?.type === "assemble" ? selBlend : nodes.find((n) => n.type === "assemble")) as Node<AssembleData> | undefined;
  const filter = ((sel?.type === "filter" ? sel : undefined) ??
    nodes.find((n) => n.type === "filter" && (!blend || edges.some((e) => e.source === n.id && e.target === blend.id))) ??
    nodes.find((n) => n.type === "filter")) as Node<FilterData> | undefined;
  const resultsNode = (sel?.type === "results" ? sel : undefined) ??
    nodes.find((n) => n.type === "results" && (!blend || edges.some((e) => e.target === n.id && e.source === blend.id))) ??
    nodes.find((n) => n.type === "results");
  const panelResult = resultsNode ? resultOf(resultsNode.id) : blend ? blendOf(blend.id) : null;
  const multi = nodes.filter((n) => n.type === "assemble").length > 1 || nodes.filter((n) => n.type === "results").length > 1;
  const ordinal = (n?: Node<AnyData>) => (n ? nodes.filter((m) => m.type === n.type).findIndex((m) => m.id === n.id) + 1 : 0);
  const followNote = multi
    ? `Showing Blend ${ordinal(blend)}${resultsNode ? ` and Results ${ordinal(resultsNode)}` : ""}${sel ? ", from your selection." : ". Select a node to follow it."}`
    : null;
  const countries = useMemo(() => {
    const count = new Map<string, number>();
    data.projects.forEach((p) => count.set(p.country, (count.get(p.country) ?? 0) + 1));
    return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, COUNTRY_CHIPS).map(([c]) => c);
  }, [data.projects]);
  const toggleCountry = (c: string) => {
    if (!filter) return;
    const has = filter.data.countries.includes(c);
    patch(filter.id, { countries: has ? filter.data.countries.filter((x) => x !== c) : [...filter.data.countries, c] });
  };

  const PALETTE: { kind: Kind; label: string; desc: string }[] = [
    { kind: "precedent", label: "Building", desc: "A real project, and the photo that carries the idea" },
    { kind: "filter", label: "Filter", desc: "Country, years, architect" },
    { kind: "assemble", label: "Blend", desc: "Weights how hard each building pulls" },
    { kind: "results", label: "Results", desc: "The ranked matches, live" },
  ];

  return (
    <CanvasCtx.Provider value={ctx}>
      <div className="ws">
        <aside className="ws-left" aria-label="Add to the canvas">
          <p className="mono-caps ws-label">Add</p>
          <ul className="palette">
            {PALETTE.map((it) => (
              <li key={it.kind}>
                <button type="button" className={`palette__item palette__item--${it.kind}`} onClick={() => add(it.kind)}>
                  <span className="palette__glyph" aria-hidden />
                  <span>
                    <b>{it.label}</b>
                    <i>{it.desc}</i>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mono-caps ws-label">Canvas</p>
          <div className="ws-actions">
            <button type="button" className="link-quiet" onClick={undoLast} disabled={!canUndo}>Undo</button>
            <button type="button" className="link-quiet" onClick={tidyNow}>Tidy</button>
            <button type="button" className="link-quiet" onClick={reset}>Reset</button>
            <button type="button" className="link-quiet" onClick={clear}>Clear</button>
          </div>
          {undo && (
            <p className="canvas-undo" role="status">
              Canvas cleared.{" "}
              <button type="button" className="link-quiet" onClick={restore}>
                Undo
              </button>
            </p>
          )}
          <p className="mono-caps ws-label">File</p>
          <div className="ws-actions">
            <button type="button" className="link-quiet" onClick={download}>Save as file</button>
            <button type="button" className="link-quiet" onClick={() => fileRef.current?.click()}>Open file</button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ""; }} />
          </div>
          {loadError && <p className="ws-note" role="alert">Could not open that file: {loadError}.</p>}
          <details className="ws-keys">
            <summary className="mono-caps">How to use</summary>
            <dl>
              <div><dt>Click Add</dt><dd>new piece, connected for you</dd></div>
              <div><dt>Drag a result</dt><dd>onto the canvas: a new Building. Onto a Building: replace it</dd></div>
              <div><dt>Port to port</dt><dd>drag to rewire</dd></div>
              <div><dt>Delete or ×</dt><dd>remove the selection</dd></div>
              <div><dt>Ctrl + Z</dt><dd>undo</dd></div>
              <div><dt>Esc</dt><dd>deselect</dd></div>
              <div><dt>Shift + drag</dt><dd>select several</dd></div>
              <div><dt>Scroll</dt><dd>pan; zoom with + and −</dd></div>
            </dl>
          </details>
        </aside>

        <div className="ws-center" ref={centreRef}>
          <div className="canvas-window" style={stacked ? { height: stacked.height } : undefined}>
            {nodes.length === 0 && (
              <div className="canvas-empty">
                <p>An empty canvas. Add a Building to start, or Reset to the cabin and chapel.</p>
              </div>
            )}
            <ReactFlow
              nodes={shownNodes}
              edges={shownEdges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChangeSafe}
              onEdgesChange={onEdgesChangeSafe}
              onSelectionChange={onSelectionChange}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onConnect={onConnect}
              isValidConnection={isValidConnection}
              defaultEdgeOptions={{ type: "step" }}
              fitView={!narrow}
              fitViewOptions={{ padding: 0.06, maxZoom: 1, minZoom: 0.6 }}
              minZoom={0.45}
              maxZoom={1.4}
              zoomOnScroll={false}
              panOnScroll={!narrow}
              preventScrolling={!narrow}
              panOnDrag={!narrow}
              zoomOnPinch={!narrow}
              zoomOnDoubleClick={false}
              proOptions={{ hideAttribution: true }}
              deleteKeyCode={inCanvas ? ["Backspace", "Delete"] : null}
              elevateEdgesOnSelect
            >
              <Background variant={BackgroundVariant.Lines} gap={30} color="rgba(21,22,26,0.06)" />
              {!narrow && <Controls showInteractive={false} />}
              {!narrow && (
                <MiniMap
                  pannable
                  zoomable
                  ariaLabel="Canvas overview"
                  nodeColor={(n) => (n.type === "assemble" ? "#15161a" : n.type === "results" ? "#3a3c42" : "#989ba2")}
                  maskColor="rgba(236,236,233,0.7)"
                />
              )}
            </ReactFlow>
          </div>
        </div>

        <aside className="ws-right" aria-label="Research panel">
          <section className="ws-sec">
            <label className="mono-caps ws-label" htmlFor="study-name">Research</label>
            <input id="study-name" className="ws-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Name this study" />
          </section>

          <section className="ws-sec">
            <p className="mono-caps ws-label">Weights{multi && blend ? ` · Blend ${ordinal(blend)}` : ""}</p>
            {blend ? (
              <BlendControls id={blend.id} data={blend.data} />
            ) : (
              <p className="nf__hint">
                Add a Blend to weight your buildings.{" "}
                <button type="button" className="link-quiet" onClick={() => add("assemble")}>Add Blend</button>
              </p>
            )}
          </section>

          <section className="ws-sec">
            <p className="mono-caps ws-label">
              Filters {filter && filterSummary(filter.data).length ? `(${filterSummary(filter.data).length})` : ""}
            </p>
            {filter ? (
              <>
                <div className="chips chips--panel" role="group" aria-label="Countries">
                  {countries.map((c) => {
                    const on = filter.data.countries.includes(c);
                    return (
                      <button key={c} type="button" className={on ? "is-on" : ""} aria-pressed={on} onClick={() => toggleCountry(c)}>
                        {c}
                      </button>
                    );
                  })}
                </div>
                <p className="ws-note">
                  {filterSummary(filter.data).length ? `Showing ${filterSummary(filter.data).join(" · ")}.` : "Any country, any year."} Years and
                  architect live on the Filter node.
                </p>
              </>
            ) : (
              <p className="nf__hint">
                No filter yet.{" "}
                <button type="button" className="link-quiet" onClick={() => add("filter")}>Add a Filter</button>
              </p>
            )}
          </section>

          <section className="ws-sec ws-results">
            <p className="mono-caps ws-label">
              Ranked results {panelResult && !panelResult.empty ? `(${panelResult.pool})` : ""}
            </p>
            {!panelResult ? (
              <p className="nf__hint">Connect a Blend to Results to rank buildings.</p>
            ) : panelResult.empty ? (
              <p className="nf__hint">{EMPTY_COPY[panelResult.empty]}</p>
            ) : (
              <>
                <p className="ws-note">
                  {followNote ? `${followNote} ` : ""}Badge: blended similarity, 0 to 1. Under each card, similarity to each building; the
                  bold one carried it. Drag a card onto the canvas to blend it in.
                </p>
                <ol className="ws-cards">
                  {panelResult.hits.map((h, i) => {
                    const on = pinned.has(h.project.id);
                    return (
                      <li key={h.project.id} className="ws-card" draggable onDragStart={(e) => dragProject(e, h.project.id, h.image)}>
                        <button type="button" className="ws-card__img" onClick={() => onOpen(h.project.id, h.image)} aria-label={`${h.project.title}. Open close-up`}>
                          <img src={h.project.images[h.image] ?? h.project.image} alt="" loading="lazy" />
                          <span className="stamp-rank">
                            <span className="num">{String(i + 1).padStart(2, "0")}</span>
                            <span className="dist num">{h.score.toFixed(2)}</span>
                          </span>
                        </button>
                        <div className="ws-card__body">
                          <b>{h.project.title}</b>
                          <span className="ws-card__meta">{h.project.year} · {h.project.country} · {h.project.architect}</span>
                          <Parts hit={h} letterOf={letterOf} avoid={panelResult.avoid} />
                          <button type="button" className={`pin-toggle${on ? " is-on" : ""}`} onClick={() => onTogglePin(h.project.id, h.image)} aria-pressed={on} aria-label={`${on ? "Unpin" : "Pin"} ${h.project.title}`}>
                            {on ? "✓ Pinned" : "Pin"}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </>
            )}
          </section>
        </aside>
      </div>
    </CanvasCtx.Provider>
  );
}

export const AssemblyCanvas = memo(function AssemblyCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
});
