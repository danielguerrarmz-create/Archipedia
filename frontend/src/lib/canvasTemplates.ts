import { Node, Connection } from 'reactflow';
import { NodeData, PrecedentProject } from '../types/nodes';
import {
  createPrecedentNode,
  createOperatorANDNode,
  createOperatorNOTNode,
  createResultsNode,
  createGenerateNode,
  createValidateNode,
} from './nodeFactory';

export interface SeededGraph {
  nodes: Node<NodeData>[];
  edges: Array<Partial<Connection>>;
}

export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  /** Compact mono flow string for the empty-state card. */
  flow: string;
  build: () => SeededGraph;
}

const COL = 320; // horizontal spacing between stages
const ROW = 220; // vertical spacing between stacked inputs

function emptyPrecedent(): PrecedentProject[] {
  return [];
}

/**
 * Three one-click starter graphs. They wire the engine handle ids
 * ('output' → 'input-0' / 'input') so they execute out of the box, while the
 * node bodies inherit the Concrete & Signal frame.
 */
export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'combine-two',
    name: 'Combine two references',
    description: 'Match references shared by two precedents.',
    flow: 'P + P → MATCH BOTH → RESULTS',
    build: () => {
      const a = createPrecedentNode({ x: 0, y: 0 }, emptyPrecedent());
      const b = createPrecedentNode({ x: 0, y: ROW }, emptyPrecedent());
      const op = createOperatorANDNode({ x: COL, y: ROW / 2 });
      const out = createResultsNode({ x: COL * 2, y: ROW / 2 }, 0);
      return {
        nodes: [a, b, op, out],
        edges: [
          { source: a.id, sourceHandle: 'output', target: op.id, targetHandle: 'input-0' },
          { source: b.id, sourceHandle: 'output', target: op.id, targetHandle: 'input-1' },
          { source: op.id, sourceHandle: 'output', target: out.id, targetHandle: 'input' },
        ],
      };
    },
  },
  {
    id: 'like-a-not-b',
    name: 'Like A but not B',
    description: 'Keep references like A while excluding those near B.',
    flow: 'P + P → EXCLUDE → RESULTS',
    build: () => {
      const a = createPrecedentNode({ x: 0, y: 0 }, emptyPrecedent());
      const b = createPrecedentNode({ x: 0, y: ROW }, emptyPrecedent());
      const op = createOperatorNOTNode({ x: COL, y: ROW / 2 });
      const out = createResultsNode({ x: COL * 2, y: ROW / 2 }, 0);
      return {
        nodes: [a, b, op, out],
        edges: [
          { source: a.id, sourceHandle: 'output', target: op.id, targetHandle: 'include' },
          { source: b.id, sourceHandle: 'output', target: op.id, targetHandle: 'exclude' },
          { source: op.id, sourceHandle: 'output', target: out.id, targetHandle: 'input' },
        ],
      };
    },
  },
  {
    id: 'generate-validate',
    name: 'Generate → Validate',
    description: 'Generate a render from a precedent, then validate it.',
    flow: 'P → GENERATE → VALIDATE → RESULTS',
    build: () => {
      const a = createPrecedentNode({ x: 0, y: ROW / 2 }, emptyPrecedent());
      const gen = createGenerateNode({ x: COL, y: ROW / 2 });
      const val = createValidateNode({ x: COL * 2, y: ROW / 2 });
      const out = createResultsNode({ x: COL * 3, y: ROW / 2 }, 0);
      return {
        nodes: [a, gen, val, out],
        edges: [
          { source: a.id, sourceHandle: 'output', target: gen.id, targetHandle: 'projects' },
          { source: gen.id, sourceHandle: 'output', target: val.id, targetHandle: 'input' },
          { source: val.id, sourceHandle: 'output', target: out.id, targetHandle: 'input' },
        ],
      };
    },
  },
];

/* ── "Open in canvas" hand-off from results ──────────────────────────────────
   Seeds a single Precedent node from a project and navigates to /canvas with it
   selected. NodeCanvas reads `__pendingCanvasSeed` from sessionStorage on mount.
   The UI engineer wires the button on result cards; this is the helper to call.
   ────────────────────────────────────────────────────────────────────────── */

export interface CanvasSeedProject {
  id: string;
  title: string;
  thumbnail?: string;
  typology?: string;
  materials?: string | string[];
  climate?: string | string[];
}

export const PENDING_CANVAS_SEED_KEY = '__pendingCanvasSeed';

function toPrecedentProject(p: CanvasSeedProject): PrecedentProject {
  return {
    id: p.id,
    title: p.title,
    thumbnail: p.thumbnail || '',
    attributes: {
      circulation: p.typology || '',
      materiality: Array.isArray(p.materials) ? p.materials.join('+') : (p.materials || ''),
      climate: Array.isArray(p.climate) ? p.climate.join('+') : (p.climate || ''),
    },
  };
}

/**
 * openProjectInCanvas — stash a Precedent seed and navigate to /canvas.
 *
 * @param project  the result-card project to seed a Precedent node from
 * @param navigate optional router navigate fn (e.g. wouter's setLocation). If
 *                 omitted, falls back to window.location.assign('/canvas').
 */
export function openProjectInCanvas(
  project: CanvasSeedProject,
  navigate?: (to: string) => void,
): void {
  try {
    sessionStorage.setItem(
      PENDING_CANVAS_SEED_KEY,
      JSON.stringify([toPrecedentProject(project)]),
    );
  } catch {
    /* sessionStorage may be unavailable; navigation still proceeds */
  }
  if (navigate) navigate('/canvas');
  else window.location.assign('/canvas');
}

/** Read & clear any pending seed (called by NodeCanvas on mount). */
export function consumePendingCanvasSeed(): PrecedentProject[] | null {
  try {
    const raw = sessionStorage.getItem(PENDING_CANVAS_SEED_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_CANVAS_SEED_KEY);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
