import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { OperatorORNodeData } from '../../types/nodes';
import { Plus, X, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { NodeFrame } from './BaseNode';

interface OperatorORNodeProps {
  data: OperatorORNodeData;
  selected?: boolean;
  id?: string;
}

export const OperatorORNode: React.FC<OperatorORNodeProps> = ({ data, selected, id }) => {
  const { deleteNode, executeFromNode } = useCanvasStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputs, setInputs] = useState(data.inputData || [
    { nodeId: 'input-a', results: [] },
    { nodeId: 'input-b', results: [] },
  ]);
  const [logic, setLogic] = useState<'hardMax' | 'softmax'>(data.logic || 'hardMax');

  const handleRun = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) await executeFromNode(id);
  };
  const addInput = () => setInputs([...inputs, { nodeId: `input-${inputs.length + 1}`, results: [] }]);
  const removeInput = (index: number) => { if (inputs.length > 2) setInputs(inputs.filter((_, i) => i !== index)); };

  return (
    <NodeFrame
      data={data}
      selected={selected}
      index={(data as any).__index}
      compact={!isExpanded}
      sublabel="Match either"
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
          <span className="mono-meta" style={{ fontSize: 10 }}><span className="an-num">{inputs.length}</span> inputs</span>
          <button className="an-node__btn" onClick={(e) => { e.stopPropagation(); addInput(); }}><Plus size={9} /> ADD</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div className="an-field-label" style={{ marginBottom: 8 }}>INPUTS</div>
            {inputs.map((input, index) => (
              <div key={input.nodeId} className="an-field" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono-meta" style={{ fontSize: 10 }}>Input {String.fromCharCode(65 + index)}</span>
                {inputs.length > 2 && (
                  <button className="an-node__btn an-node__btn--icon" onClick={(e) => { e.stopPropagation(); removeInput(index); }}><X size={9} /></button>
                )}
              </div>
            ))}
            <button className="an-node__btn" style={{ width: '100%', justifyContent: 'center' }} onClick={(e) => { e.stopPropagation(); addInput(); }}>
              <Plus size={11} /> ADD INPUT
            </button>
          </div>
          <div>
            <div className="an-field-label" style={{ marginBottom: 8 }}>LOGIC</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(['hardMax', 'softmax'] as const).map((l) => (
                <label key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--ink-700)', cursor: 'pointer' }}>
                  <input type="radio" checked={logic === l} onChange={() => setLogic(l)} onClick={(e) => e.stopPropagation()} />
                  {l === 'hardMax' ? 'Hard max (best wins)' : 'Softmax (smooth blend)'}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {inputs.map((_, index) => (
        <Handle key={`in-${index}`} type="target" position={Position.Left} id={`input-${index}`} style={{ top: `${48 + index * 22}px` }} />
      ))}
      <Handle type="source" position={Position.Right} id="output" style={{ top: '50%' }} />
    </NodeFrame>
  );
};
