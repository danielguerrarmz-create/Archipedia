import React from 'react';
import { Handle, Position } from 'reactflow';
import { NodeData, NodeType } from '../../types/nodes';
import {
  Search, Image as ImageIcon, Type, Layers, Sliders, Filter,
  GitMerge, Combine, Ban, LayoutGrid, Sparkles, ShieldCheck, Palette, Box, Brain, Settings, Stamp,
  X, Play, Loader2,
} from 'lucide-react';
import { getNodeTypeDefinition } from '../../lib/NodeRegistry';

/* ─────────────────────────────────────────────────────────────────────────
   "Concrete & Signal" BaseNode
   A node is a die pressed into concrete: a debossed SEAT holding an embossed
   BODY. The 5-state Fuser progression (EMPTY → READY → RUNNING → RESOLVED →
   STAMPED, plus ERROR) is expressed purely through emboss/deboss + a single
   header status square. Selection is orthogonal and always wins.
   ───────────────────────────────────────────────────────────────────────── */

export type FuserState = 'empty' | 'ready' | 'running' | 'resolved' | 'stamped' | 'error';

/** The four brand families. Drives the debossed glyph + footer micro-tick only. */
export type NodeCategory = 'input' | 'operator' | 'generate' | 'output';

const CATEGORY_BY_TYPE: Record<string, NodeCategory> = {
  precedent: 'input',
  stackedPrecedent: 'input',
  image: 'input',
  text: 'input',
  styleReference: 'input',
  attributeFilter: 'operator',
  scalar: 'operator',
  operatorAND: 'operator',
  operatorOR: 'operator',
  operatorNOT: 'operator',
  generate: 'generate',
  'image-gen': 'generate',
  llm: 'generate',
  '3d': 'generate',
  validate: 'output',
  results: 'output',
  collection: 'output',
  overseer: 'operator',
};

export const CATEGORY_ACCENT: Record<NodeCategory, string> = {
  input: 'var(--cat-input)',
  operator: 'var(--cat-operator)',
  generate: 'var(--cat-generate)',
  output: 'var(--cat-output)',
};

const CATEGORY_LABEL: Record<NodeCategory, string> = {
  input: 'INPUT',
  operator: 'OPERATOR',
  generate: 'GENERATE',
  output: 'OUTPUT',
};

export function getNodeCategory(type: NodeType | string): NodeCategory {
  return CATEGORY_BY_TYPE[type as string] || 'operator';
}

/** Category glyph (lucide) for a node type — debossed in the header. */
export function getNodeGlyph(type: NodeType | string): React.ComponentType<{ size?: number }> {
  const map: Record<string, React.ComponentType<{ size?: number }>> = {
    precedent: ImageIcon,
    stackedPrecedent: Layers,
    image: Search,
    text: Type,
    styleReference: Palette,
    attributeFilter: Filter,
    scalar: Sliders,
    operatorAND: Combine,
    operatorOR: GitMerge,
    operatorNOT: Ban,
    generate: Sparkles,
    'image-gen': Sparkles,
    llm: Brain,
    '3d': Box,
    validate: ShieldCheck,
    results: LayoutGrid,
    collection: LayoutGrid,
    overseer: Settings,
  };
  return map[type as string] || Settings;
}

/** Map an execution / node status into the 5-state Fuser progression. */
export function deriveFuserState(data: NodeData): FuserState {
  const exec = (data as any).executionStatus as string | undefined;
  const status = (data as any).status as string | undefined;
  if ((data as any).stamped === true) return 'stamped';
  if (exec === 'error' || status === 'error') return 'error';
  if (exec === 'running' || status === 'running' || status === 'generating' || status === 'validating' || status === 'extracting') return 'running';
  if (exec === 'success' || status === 'complete') return 'resolved';
  // EMPTY vs READY: empty when no meaningful input/content yet
  if ((data as any).__empty === true) return 'empty';
  return 'ready';
}

/** The one primary verb-action per node (rendered as the single Signal button). */
export interface PrimaryAction {
  /** Plain verb at rest, e.g. "Run", "Generate", "Validate". */
  label: string;
  /** Verb shown while running, e.g. "Generating". Defaults to label. */
  runningLabel?: string;
  onClick: (e: React.MouseEvent) => void;
  running?: boolean;
  disabled?: boolean;
}

interface NodeFrameProps {
  data: NodeData;
  selected?: boolean;
  /** Override the derived 5-state (e.g. operator nodes with local status). */
  state?: FuserState;
  /** Stable per-canvas index for the P·NN stamp. */
  index?: number;
  /** Optional sub-label under the mono-caps title (plain language). */
  sublabel?: string;
  /**
   * Delete handler — when provided the frame renders a single, legible delete
   * icon (lucide X, aria-label "Delete node") in the header. Preferred over
   * passing a bespoke delete button via `headerActions`.
   */
  onDelete?: (e: React.MouseEvent) => void;
  /**
   * The ONE primary action for this node — rendered as the single Signal
   * button in the footer with a plain verb ("Run" / "Generate" / "Validate").
   */
  primaryAction?: PrimaryAction;
  /** Optional extra header-right controls (e.g. expand/collapse chevron). */
  headerActions?: React.ReactNode;
  /** Footer right slot override (defaults to result count / port summary). */
  footerRight?: React.ReactNode;
  compact?: boolean;
  media?: boolean;
  /** When true, frame renders no handles (the node renders its own). */
  noHandles?: boolean;
  children: React.ReactNode;
}

/**
 * NodeFrame — the shared seat/body chrome. Node types render their content as
 * `children` and let the frame own the materiality, header, footer and ports.
 */
export const NodeFrame: React.FC<NodeFrameProps> = ({
  data,
  selected,
  state,
  index,
  sublabel,
  onDelete,
  primaryAction,
  headerActions,
  footerRight,
  compact,
  media,
  noHandles,
  children,
}) => {
  const nodeDef = getNodeTypeDefinition(data.type);
  const category = getNodeCategory(data.type);
  const accent = CATEGORY_ACCENT[category];
  const Glyph = getNodeGlyph(data.type);
  const fuser = state ?? deriveFuserState(data);

  const inputPorts = nodeDef.inputs.length > 0 ? nodeDef.inputs : (data.inputs || []);
  const outputPorts = nodeDef.outputs.length > 0 ? nodeDef.outputs : (data.outputs || []);

  const resolvedCount =
    (data as any).resultCount ??
    (data as any).executionResult?.count ??
    (data as any).executionResult?.results?.length ??
    (Array.isArray((data as any).outputResults) ? (data as any).outputResults.length : undefined);

  const classes = [
    'an-node',
    compact ? 'an-node--compact' : '',
    media ? 'an-node--media' : '',
    selected ? 'is-selected' : '',
    `is-${fuser}`,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={{ ['--cat-accent' as any]: accent }}>
      <div className="an-node__body">
        {/* HEADER — category glyph · plain title (+ optional sublabel) · delete */}
        <div className="an-node__header">
          <span className="an-node__cat"><Glyph size={15} /></span>
          <span className="an-node__titlewrap">
            <span className="an-node__title">{data.label || nodeDef.label}</span>
            {sublabel && <span className="an-node__sub">{sublabel}</span>}
          </span>
          <span className="an-node__square" aria-hidden />
          {headerActions}
          {onDelete && (
            <button
              className="an-node__del"
              onClick={onDelete}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label="Delete node"
              title="Delete node"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* CONTENT */}
        <div className="an-node__content">{children}</div>

        {/* FOOTER — only when there's an action or a result to show */}
        {(footerRight || primaryAction || (fuser === 'resolved' && resolvedCount != null) || fuser === 'stamped') && (
          <div className="an-node__footer">
            {footerRight ?? (primaryAction ? (
              <button
                className="an-node__btn an-node__btn--signal"
                onClick={primaryAction.onClick}
                onMouseDown={(e) => e.stopPropagation()}
                disabled={primaryAction.disabled || primaryAction.running}
              >
                {primaryAction.running
                  ? <Loader2 size={11} className="animate-spin" />
                  : <Play size={11} />}
                {primaryAction.running
                  ? (primaryAction.runningLabel ?? primaryAction.label)
                  : primaryAction.label}
              </button>
            ) : fuser === 'resolved' && resolvedCount != null ? (
              <span className="resolved-tag">{resolvedCount} found</span>
            ) : fuser === 'stamped' ? (
              <span className="resolved-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Stamp size={10} /> Stamped
              </span>
            ) : null)}
          </div>
        )}
      </div>

      {/* PORTS — 8px ink squares, vertically distributed */}
      {!noHandles && (
        <>
          {inputPorts.map((input, i) => (
            <Handle
              key={`in-${input.id}`}
              type="target"
              position={Position.Left}
              id={input.id}
              style={{ top: `${48 + i * 22}px` }}
            />
          ))}
          {outputPorts.map((output, i) => (
            <Handle
              key={`out-${output.id}`}
              type="source"
              position={Position.Right}
              id={output.id}
              style={{ top: `${48 + i * 22}px` }}
            />
          ))}
        </>
      )}
    </div>
  );
};

/* ── Backwards-compatible default BaseNode ───────────────────────────────────
   Existing node types that import { BaseNode } and pass children keep working;
   they now inherit the concrete frame. borderColor/backgroundColor props are
   accepted but ignored (candy fills are dead under the rebrand).
   ────────────────────────────────────────────────────────────────────────── */
interface BaseNodeProps {
  data: NodeData;
  selected?: boolean;
  children: React.ReactNode;
  index?: number;
  sublabel?: string;
  headerActions?: React.ReactNode;
  compact?: boolean;
  media?: boolean;
  /** legacy props — accepted, ignored */
  borderColor?: string;
  backgroundColor?: string;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  data, selected, children, index, sublabel, headerActions, compact, media,
}) => (
  <NodeFrame
    data={data}
    selected={selected}
    index={index}
    sublabel={sublabel}
    headerActions={headerActions}
    compact={compact}
    media={media}
  >
    {children}
  </NodeFrame>
);

export default BaseNode;
