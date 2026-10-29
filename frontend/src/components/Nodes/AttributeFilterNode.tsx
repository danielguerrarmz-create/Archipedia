import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { AttributeFilterNodeData } from '../../types/nodes';
import { useCanvasStore } from '../../stores/canvasStore';
import { NodeFrame } from './BaseNode';

interface AttributeFilterNodeProps {
  data: AttributeFilterNodeData;
  selected?: boolean;
  id?: string;
}

export const AttributeFilterNode: React.FC<AttributeFilterNodeProps> = ({ data, selected, id }) => {
  const { deleteNode, executeFromNode } = useCanvasStore();
  const [weights, setWeights] = useState(data.weights || { visual: 40, spatial: 10, regional: 50 });
  const [keywords, setKeywords] = useState(data.keywords || '');
  const [inputCount] = useState(12);
  const [outputCount, setOutputCount] = useState(8);

  const handleRun = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) await executeFromNode(id);
  };

  const handleWeightChange = (key: 'visual' | 'spatial' | 'regional', value: number) => {
    const newWeights = { ...weights, [key]: value };
    const total = newWeights.visual + newWeights.spatial + newWeights.regional;
    if (total > 0) {
      setWeights({
        visual: Math.round((newWeights.visual / total) * 100),
        spatial: Math.round((newWeights.spatial / total) * 100),
        regional: Math.round((newWeights.regional / total) * 100),
      });
    }
  };

  const handleApplyFilters = () => {
    if (keywords.trim()) {
      const keywordCount = keywords.split(/\s+/).length;
      setOutputCount(Math.max(0, inputCount - keywordCount * 2));
    } else {
      setOutputCount(inputCount);
    }
  };

  const sliders = [
    { key: 'visual' as const, label: 'Visual', description: 'Similarity to visual reference' },
    { key: 'spatial' as const, label: 'Spatial', description: 'Circulation, corridor ratio, etc.' },
    { key: 'regional' as const, label: 'Regional', description: 'Climate, geography, typology' },
  ];

  return (
    <NodeFrame
      data={data}
      selected={selected}
      index={(data as any).__index}
      state="ready"
      sublabel="Weight & filter"
      onDelete={(e) => { e.stopPropagation(); if (id) deleteNode(id); }}
      primaryAction={{ label: 'Run', onClick: handleRun }}
      noHandles
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Input summary */}
        <div className="an-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="an-field-label">Input</span>
          <span className="an-num" style={{ fontSize: 11 }}>{inputCount} projects</span>
        </div>

        {/* Fusion weights */}
        <div>
          <div className="an-field-label" style={{ marginBottom: 10 }}>Fusion weights</div>
          {sliders.map((slider) => (
            <div key={slider.key} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--studio-ink)' }}>{slider.label}</span>
                <span className="an-num" style={{ fontSize: 11 }}>{weights[slider.key]}%</span>
              </div>
              <div onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                <input
                  type="range" min={0} max={100} value={weights[slider.key]}
                  onChange={(e) => handleWeightChange(slider.key, parseInt(e.target.value))}
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{
                    width: '100%', height: 4, appearance: 'none', outline: 'none', cursor: 'pointer', borderRadius: 2,
                    background: `linear-gradient(to right, var(--signal) 0%, var(--signal) ${weights[slider.key]}%, var(--studio-line) ${weights[slider.key]}%, var(--studio-line) 100%)`,
                  }}
                />
              </div>
              <div style={{ fontSize: 9, color: 'var(--studio-stone-dim)', marginTop: 2 }}>{slider.description}</div>
            </div>
          ))}
        </div>

        {/* Keyword search */}
        <div>
          <div className="an-field-label" style={{ marginBottom: 6 }}>Keywords</div>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder="e.g. mediterranean, stone, courtyard…"
            className="an-field"
            style={{ width: '100%', border: 'none', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--studio-ink)' }}
          />
        </div>

        {/* Output summary */}
        <div className="an-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="an-field-label">Output</span>
          <span className="an-num" style={{ fontSize: 11 }}>{outputCount} kept · {inputCount - outputCount} filtered</span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="an-node__btn"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={(e) => { e.stopPropagation(); setWeights({ visual: 33, spatial: 33, regional: 34 }); setKeywords(''); setOutputCount(inputCount); }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            Reset
          </button>
          <button
            className="an-node__btn"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={(e) => { e.stopPropagation(); handleApplyFilters(); }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            Apply
          </button>
        </div>
      </div>

      <Handle type="target" position={Position.Left} id="input" style={{ top: '50%' }} />
      <Handle type="source" position={Position.Right} id="output" style={{ top: '50%' }} />
    </NodeFrame>
  );
};
