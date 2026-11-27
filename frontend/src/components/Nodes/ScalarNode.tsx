import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { ScalarNodeData, ScalarConstraint } from '../../types/nodes';
import { Plus, X } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { NodeFrame } from './BaseNode';

interface ScalarNodeProps {
  data: ScalarNodeData;
  selected?: boolean;
  id?: string;
}

const availableScalars = [
  { name: 'Floor Count', unit: 'floors', key: 'floorCount', defaultMin: 1, defaultMax: 10 },
  { name: 'Height', unit: 'm', key: 'heightM', defaultMin: 10, defaultMax: 100 },
  { name: 'WWR', unit: '%', key: 'wwr', defaultMin: 10, defaultMax: 80 },
  { name: 'Site Area', unit: 'm²', key: 'siteArea', defaultMin: 100, defaultMax: 10000 },
  { name: 'Density', unit: 'units/ha', key: 'density', defaultMin: 10, defaultMax: 200 },
];

export const ScalarNode: React.FC<ScalarNodeProps> = ({ data, selected, id }) => {
  const { deleteNode, executeFromNode } = useCanvasStore();
  const [constraints, setConstraints] = useState<ScalarConstraint[]>(data.constraints || []);
  const [matchingCount, setMatchingCount] = useState(data.matchingCount || 0);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customUnit, setCustomUnit] = useState('');
  const [customMin, setCustomMin] = useState(0);
  const [customMax, setCustomMax] = useState(100);

  const handleRun = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) await executeFromNode(id);
  };

  const addConstraint = (scalar: typeof availableScalars[0]) => {
    if (constraints.find((c) => c.key === scalar.key)) return;
    setConstraints([...constraints, { name: scalar.name, min: scalar.defaultMin, max: scalar.defaultMax, unit: scalar.unit, key: scalar.key }]);
  };

  const addCustomConstraint = () => {
    if (!customName.trim() || !customUnit.trim()) return;
    const key = `custom-${Date.now()}`;
    setConstraints([...constraints, { name: customName, min: customMin, max: customMax, unit: customUnit, key }]);
    setCustomName(''); setCustomUnit(''); setCustomMin(0); setCustomMax(100); setShowCustomForm(false);
  };

  const removeConstraint = (key: string) => setConstraints(constraints.filter((c) => c.key !== key));

  const updateConstraint = (key: string, field: 'min' | 'max', value: number) => {
    setConstraints(constraints.map((c) => {
      if (c.key === key) {
        const updated = { ...c, [field]: value };
        if (field === 'min' && updated.min > updated.max) updated.max = updated.min;
        else if (field === 'max' && updated.max < updated.min) updated.min = updated.max;
        return updated;
      }
      return c;
    }));
    setMatchingCount(Math.max(0, 34 - constraints.length * 4));
  };

  const availableToAdd = availableScalars.filter((s) => !constraints.find((c) => c.key === s.key));

  const numInput = {
    width: '100%', padding: '6px', fontFamily: 'var(--font-mono)', fontSize: 10,
    border: 'none', outline: 'none', color: 'var(--studio-ink)',
  } as const;

  return (
    <NodeFrame
      data={data}
      selected={selected}
      index={(data as any).__index}
      state="ready"
      sublabel="Numeric constraints"
      onDelete={(e) => { e.stopPropagation(); if (id) deleteNode(id); }}
      primaryAction={{ label: 'Run', onClick: handleRun }}
      noHandles
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Input summary */}
        <div className="an-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="an-field-label">Input</span>
          <span className="an-field-label" style={{ color: 'var(--studio-stone)' }}>Project list</span>
        </div>

        {/* Parameters */}
        <div>
          <div className="an-field-label" style={{ marginBottom: 10 }}>Parameters</div>
          {constraints.length === 0 ? (
            <div className="an-field" style={{ textAlign: 'center', fontSize: 10, color: 'var(--studio-stone)' }}>
              No constraints yet. Add one below.
            </div>
          ) : (
            constraints.map((constraint) => (
              <div key={constraint.key} className="an-field" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--studio-ink)' }}>{constraint.name}</span>
                  <button className="an-node__btn an-node__btn--icon" onClick={(e) => { e.stopPropagation(); removeConstraint(constraint.key); }} aria-label="Remove constraint">
                    <X size={11} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <div className="an-field-label" style={{ marginBottom: 4 }}>Min</div>
                    <input type="number" value={constraint.min} onChange={(e) => updateConstraint(constraint.key, 'min', parseInt(e.target.value) || 0)} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} style={{ ...numInput, background: 'var(--studio-ground-deep)', borderRadius: 'var(--radius-sm)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="an-field-label" style={{ marginBottom: 4 }}>Max</div>
                    <input type="number" value={constraint.max} onChange={(e) => updateConstraint(constraint.key, 'max', parseInt(e.target.value) || 0)} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} style={{ ...numInput, background: 'var(--studio-ground-deep)', borderRadius: 'var(--radius-sm)' }} />
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--studio-stone)', paddingBottom: 7 }}>{constraint.unit}</span>
                </div>
              </div>
            ))
          )}

          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {availableToAdd.length > 0 && (
              <select
                onChange={(e) => { if (e.target.value) { const s = availableScalars.find((x) => x.key === e.target.value); if (s) addConstraint(s); e.target.value = ''; } }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="an-field"
                style={{ width: '100%', border: 'none', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--studio-ink)', cursor: 'pointer' }}
              >
                <option value="">+ Add from template…</option>
                {availableToAdd.map((s) => (
                  <option key={s.key} value={s.key}>{s.name} ({s.unit})</option>
                ))}
              </select>
            )}
            {!showCustomForm ? (
              <button className="an-node__btn" style={{ width: '100%', justifyContent: 'center' }} onClick={(e) => { e.stopPropagation(); setShowCustomForm(true); }} onMouseDown={(e) => e.stopPropagation()}>
                <Plus size={11} /> Custom parameter
              </button>
            ) : (
              <div className="an-field" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input type="text" placeholder="Parameter name" value={customName} onChange={(e) => setCustomName(e.target.value)} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} style={{ ...numInput, background: 'var(--studio-ground-deep)', borderRadius: 'var(--radius-sm)' }} />
                <input type="text" placeholder="Unit (e.g. m, %)" value={customUnit} onChange={(e) => setCustomUnit(e.target.value)} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} style={{ ...numInput, background: 'var(--studio-ground-deep)', borderRadius: 'var(--radius-sm)' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="number" placeholder="Min" value={customMin} onChange={(e) => setCustomMin(parseInt(e.target.value) || 0)} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} style={{ ...numInput, flex: 1, background: 'var(--studio-ground-deep)', borderRadius: 'var(--radius-sm)' }} />
                  <input type="number" placeholder="Max" value={customMax} onChange={(e) => setCustomMax(parseInt(e.target.value) || 100)} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} style={{ ...numInput, flex: 1, background: 'var(--studio-ground-deep)', borderRadius: 'var(--radius-sm)' }} />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="an-node__btn" style={{ flex: 1, justifyContent: 'center' }} onClick={(e) => { e.stopPropagation(); addCustomConstraint(); }} onMouseDown={(e) => e.stopPropagation()}>Add</button>
                  <button className="an-node__btn" style={{ flex: 1, justifyContent: 'center' }} onClick={(e) => { e.stopPropagation(); setShowCustomForm(false); setCustomName(''); setCustomUnit(''); setCustomMin(0); setCustomMax(100); }} onMouseDown={(e) => e.stopPropagation()}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Output summary */}
        <div className="an-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="an-field-label">Output</span>
          <span className="an-num" style={{ fontSize: 11 }}>{matchingCount} match all</span>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button className="an-node__btn" style={{ flex: 1, justifyContent: 'center' }} onClick={(e) => { e.stopPropagation(); setConstraints([]); setMatchingCount(34); }} onMouseDown={(e) => e.stopPropagation()}>Reset</button>
          <button className="an-node__btn" style={{ flex: 1, justifyContent: 'center' }} onClick={(e) => { e.stopPropagation(); setMatchingCount(Math.max(0, 34 - constraints.length * 4)); }} onMouseDown={(e) => e.stopPropagation()}>Apply</button>
        </div>
      </div>

      <Handle type="target" position={Position.Left} id="input" style={{ top: '50%' }} />
      <Handle type="source" position={Position.Right} id="output" style={{ top: '50%' }} />
    </NodeFrame>
  );
};
