import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { OperatorANDNodeData } from '../../types/nodes';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { NodeFrame, FuserState } from './BaseNode';

interface OperatorANDNodeProps {
  data: OperatorANDNodeData;
  selected?: boolean;
  id?: string;
}

export const OperatorANDNode: React.FC<OperatorANDNodeProps> = ({ data, selected, id }) => {
  const { deleteNode, executeFromNode, nodes } = useCanvasStore();
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [resultCount, setResultCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputs, setInputs] = useState(data.inputData || [
    { nodeId: 'input-a', weight: 60, results: [] },
    { nodeId: 'input-b', weight: 40, results: [] },
  ]);
  const [logic, setLogic] = useState<'weightedSum' | 'product'>(data.logic || 'weightedSum');

  useEffect(() => {
    if (!id) return;
    const node = nodes.find((n) => n.id === id);
    const nodeData = node?.data as any;
    if (!nodeData) return;
    if (nodeData.executionStatus === 'success') {
      setStatus('success');
      setResultCount(nodeData.executionResult?.count || nodeData.executionResult?.results?.length || 0);
      setErrorMessage(null);
    } else if (nodeData.executionStatus === 'error') {
      setStatus('error');
      setErrorMessage(nodeData.executionError || 'Execution failed');
    } else if (nodeData.executionStatus === 'running') {
      setStatus('running');
    }
  }, [id, nodes]);

  const handleRun = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;
    setStatus('running');
    setErrorMessage(null);
    try {
      await executeFromNode(id);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Execution failed');
    }
  };

  const updateWeight = (index: number, weight: number) => {
    const newInputs = [...inputs];
    newInputs[index].weight = weight;
    const total = newInputs.reduce((sum, inp) => sum + inp.weight, 0);
    if (total > 0) newInputs.forEach((inp) => { inp.weight = Math.round((inp.weight / total) * 100); });
    setInputs(newInputs);
  };

  const addInput = () => setInputs([...inputs, { nodeId: `input-${inputs.length + 1}`, weight: 0, results: [] }]);
  const removeInput = (index: number) => {
    if (inputs.length > 2) setInputs(inputs.filter((_, i) => i !== index));
  };

  const fuser: FuserState =
    status === 'running' ? 'running' : status === 'error' ? 'error' : status === 'success' ? 'resolved' : 'ready';

  return (
    <NodeFrame
      data={data}
      selected={selected}
      index={(data as any).__index}
      state={fuser}
      compact={!isExpanded}
      sublabel="Match both"
      noHandles
      onDelete={(e) => { e.stopPropagation(); if (id) deleteNode(id); }}
      primaryAction={{ label: 'Run', runningLabel: 'Running', onClick: handleRun, running: status === 'running' }}
      headerActions={
        <button className="an-node__btn an-node__btn--icon" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} onMouseDown={(e) => e.stopPropagation()} aria-label={isExpanded ? 'Collapse' : 'Expand'}>
          {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
      }
    >
      {!isExpanded ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--studio-stone)' }}><span className="an-num">{inputs.length}</span> inputs</span>
          {status === 'success' && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--studio-stone)' }}><span className="an-num">{resultCount}</span> found</span>}
          {status === 'error' && errorMessage && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--error)' }}>{errorMessage}</span>
          )}
          <button className="an-node__btn" onClick={(e) => { e.stopPropagation(); addInput(); }} onMouseDown={(e) => e.stopPropagation()}><Plus size={9} /> Add input</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div className="an-field-label" style={{ marginBottom: 8 }}>Inputs</div>
            {inputs.map((input, index) => (
              <div key={input.nodeId} className="an-field" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--studio-stone)' }}>Input {String.fromCharCode(65 + index)}</span>
                  <span className="an-num" style={{ fontSize: 10 }}>{input.weight}%</span>
                </div>
                <input
                  type="range" min={0} max={100} value={input.weight}
                  onChange={(e) => updateWeight(index, parseInt(e.target.value))}
                  onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}
                  style={{
                    width: '100%', height: 4, appearance: 'none', outline: 'none', cursor: 'pointer',
                    borderRadius: 2,
                    background: `linear-gradient(to right, var(--signal) 0%, var(--signal) ${input.weight}%, var(--studio-line) ${input.weight}%, var(--studio-line) 100%)`,
                  }}
                />
                {inputs.length > 2 && (
                  <button className="an-node__btn" style={{ marginTop: 6 }} onClick={(e) => { e.stopPropagation(); removeInput(index); }}>
                    <X size={9} /> Remove
                  </button>
                )}
              </div>
            ))}
            <button className="an-node__btn" style={{ width: '100%', justifyContent: 'center' }} onClick={(e) => { e.stopPropagation(); addInput(); }} onMouseDown={(e) => e.stopPropagation()}>
              <Plus size={11} /> Add input
            </button>
          </div>

          <div>
            <div className="an-field-label" style={{ marginBottom: 8 }}>Logic</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(['weightedSum', 'product'] as const).map((l) => (
                <label key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--studio-stone)', cursor: 'pointer' }}>
                  <input type="radio" checked={logic === l} onChange={() => setLogic(l)} onClick={(e) => e.stopPropagation()} />
                  {l === 'weightedSum' ? 'Weighted sum' : 'Product'}
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
