import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { TextNodeData } from '../../types/nodes';
import { useCanvasStore } from '../../stores/canvasStore';
import { NodeFrame, FuserState } from './BaseNode';

interface TextNodeProps {
  data: TextNodeData;
  selected?: boolean;
  id?: string;
}

export const TextNode: React.FC<TextNodeProps> = ({ data, selected, id }) => {
  const { deleteNode, executeFromNode, updateNode } = useCanvasStore();
  const [textValue, setTextValue] = useState(data.content || '');

  const handleRun = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;
    updateNode(id, { executionStatus: 'running', executionError: undefined });
    await executeFromNode(id);
  };

  const status = (data as any).executionStatus as string | undefined;
  const err = ((data as any).executionError as string | undefined) || undefined;
  const results = (data as any).executionResult?.results;
  const resultCount = Array.isArray(results) ? results.length : 0;

  const fuser: FuserState =
    status === 'running' ? 'running'
    : status === 'error' ? 'error'
    : status === 'success' ? 'resolved'
    : textValue.trim() ? 'ready' : 'empty';

  return (
    <NodeFrame
      data={data}
      selected={selected}
      index={(data as any).__index}
      state={fuser}
      sublabel="Describe a concept"
      onDelete={(e) => { e.stopPropagation(); if (id) deleteNode(id); }}
      primaryAction={{ label: 'Run', runningLabel: 'Running', onClick: handleRun, running: status === 'running' }}
      noHandles
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="an-field-label">Text</div>
        <textarea
          value={textValue}
          onChange={(e) => {
            const next = e.target.value;
            setTextValue(next);
            if (id) updateNode(id, { content: next });
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="Enter text content…"
          className="an-field"
          style={{
            width: '100%', minHeight: 96, resize: 'vertical', border: 'none', outline: 'none',
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--studio-ink)',
          }}
        />

        {status === 'error' && (
          <div className="an-field" style={{ boxShadow: 'inset 0 0 0 1px var(--error)', color: 'var(--error)', fontSize: 10, lineHeight: 1.4 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Run failed</div>
            <div style={{ opacity: 0.85 }}>{err || 'Unknown error'}</div>
            <div style={{ opacity: 0.6, marginTop: 6 }}>
              Make sure the backend is running on <code>http://localhost:8000</code>.
            </div>
          </div>
        )}

        {status === 'success' && resultCount > 0 && (
          <div className="an-field" style={{ fontSize: 10, color: 'var(--studio-stone)', textAlign: 'center' }}>
            Found {resultCount} matching projects
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Left} id="input" style={{ top: '50%' }} />
      <Handle type="source" position={Position.Right} id="output" style={{ top: '50%' }} />
    </NodeFrame>
  );
};
