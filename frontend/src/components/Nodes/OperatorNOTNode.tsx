import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { OperatorNOTNodeData } from '../../types/nodes';
import { X, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { NodeFrame } from './BaseNode';

interface OperatorNOTNodeProps {
  data: OperatorNOTNodeData;
  selected?: boolean;
  id?: string;
}

export const OperatorNOTNode: React.FC<OperatorNOTNodeProps> = ({ data, selected, id }) => {
  const { deleteNode, executeFromNode } = useCanvasStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [exclusionStrategy, setExclusionStrategy] = useState<'mask' | 'penalize'>(data.exclusionStrategy || 'mask');
  const [similarityThreshold, setSimilarityThreshold] = useState(data.similarityThreshold || 0.7);

  const handleRun = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) await executeFromNode(id);
  };

  return (
    <NodeFrame
      data={data}
      selected={selected}
      index={(data as any).__index}
      compact={!isExpanded}
      sublabel="Exclude"
      noHandles
      headerActions={
        <>
          <button className="an-node__btn" onClick={handleRun} onMouseDown={(e) => e.stopPropagation()} title="Run"><Play size={9} /> RUN</button>
          <button className="an-node__btn an-node__btn--icon" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} onMouseDown={(e) => e.stopPropagation()}>
            {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          <button className="an-node__btn an-node__btn--icon" onClick={(e) => { e.stopPropagation(); if (id) deleteNode(id); }} onMouseDown={(e) => e.stopPropagation()}><X size={11} /></button>
        </>
      }
    >
      {!isExpanded ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span className="mono-meta" style={{ fontSize: 10 }}>include − exclude</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="an-field">
            <div className="an-field-label" style={{ marginBottom: 4 }}>INCLUDE</div>
            <span className="mono-meta" style={{ fontSize: 10 }}>Keep this set</span>
          </div>
          <div className="an-field">
            <div className="an-field-label" style={{ marginBottom: 4 }}>EXCLUDE</div>
            <span className="mono-meta" style={{ fontSize: 10 }}>Remove items similar to this set</span>
          </div>
          <div>
            <div className="an-field-label" style={{ marginBottom: 8 }}>STRATEGY</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(['mask', 'penalize'] as const).map((s) => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--ink-700)', cursor: 'pointer' }}>
                  <input type="radio" checked={exclusionStrategy === s} onChange={() => setExclusionStrategy(s)} onClick={(e) => e.stopPropagation()} />
                  {s === 'mask' ? 'Mask (drop)' : 'Penalize (down-rank)'}
                </label>
              ))}
            </div>
          </div>
          <div className="an-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="an-field-label">THRESHOLD</span>
              <span className="an-num mono-meta" style={{ fontSize: 10 }}>{similarityThreshold.toFixed(2)}</span>
            </div>
            <input
              type="range" min={0} max={1} step={0.05} value={similarityThreshold}
              onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
              onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}
              style={{
                width: '100%', height: 4, appearance: 'none', outline: 'none', cursor: 'pointer', borderRadius: 2,
                background: `linear-gradient(to right, var(--signal) 0%, var(--signal) ${similarityThreshold * 100}%, var(--hairline) ${similarityThreshold * 100}%, var(--hairline) 100%)`,
              }}
            />
          </div>
        </div>
      )}

      <Handle type="target" position={Position.Left} id="include" style={{ top: '42px' }} />
      <Handle type="target" position={Position.Left} id="exclude" style={{ top: '66px' }} />
      <Handle type="source" position={Position.Right} id="output" style={{ top: '50%' }} />
    </NodeFrame>
  );
};
