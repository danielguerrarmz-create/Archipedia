import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { ValidateNodeData } from '../../types/nodes';
import { useCanvasStore } from '../../stores/canvasStore';
import { NodeFrame, FuserState } from './BaseNode';

interface ValidateNodeProps {
  data: ValidateNodeData;
  selected?: boolean;
  id?: string;
}

export const ValidateNode: React.FC<ValidateNodeProps> = ({ data, selected, id }) => {
  const { deleteNode, updateNode, executeFromNode } = useCanvasStore();
  const [topK, setTopK] = useState(data.topK || 5);
  const [minSimilarity, setMinSimilarity] = useState(data.minSimilarity || 0.5);

  const handleRun = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;
    updateNode(id, { topK, minSimilarity, status: 'validating', error: undefined });
    await executeFromNode(id);
  };

  const status = data.status || (data as any).executionStatus;
  const isValidating = status === 'validating' || status === 'running';
  const error = data.error || (data as any).executionError;

  const executionResult = (data as any).executionResult;
  const validatedProjects = executionResult?.validatedProjects || data.validatedProjects || [];
  const validationScore = executionResult?.validationScore || data.validationScore || 0;
  const inputImageUrl = data.inputImageUrl;

  const fuser: FuserState =
    isValidating ? 'running'
    : status === 'error' ? 'error'
    : status === 'complete' || validatedProjects.length > 0 ? 'resolved'
    : 'ready';

  return (
    <NodeFrame
      data={data}
      selected={selected}
      index={(data as any).__index}
      state={fuser}
      media
      sublabel="Find real projects"
      onDelete={(e) => { e.stopPropagation(); if (id) deleteNode(id); }}
      primaryAction={{ label: 'Validate', runningLabel: 'Searching', onClick: handleRun, running: isValidating }}
      noHandles
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Input preview + score */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div className="an-field" style={{ width: 72, height: 72, padding: 0, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {inputImageUrl ? (
              <img src={inputImageUrl} alt="Input concept" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span className="an-field-label" style={{ textAlign: 'center', padding: 6 }}>Connect image</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div className="an-field-label" style={{ marginBottom: 4 }}>Your concept</div>
            {validationScore > 0 && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, color: 'var(--studio-ink)' }}>
                {Math.round(validationScore * 100)}%
                <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--studio-stone)', marginLeft: 4 }}>validated</span>
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div className="an-field-label" style={{ marginBottom: 4 }}>Results</div>
            <select
              value={topK}
              onChange={(e) => { const val = parseInt(e.target.value); setTopK(val); if (id) updateNode(id, { topK: val }); }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="an-field"
              style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--studio-ink)', border: 'none' }}
            >
              <option value={3}>Top 3</option>
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <div className="an-field-label" style={{ marginBottom: 4 }}>Min. similarity</div>
            <select
              value={minSimilarity}
              onChange={(e) => { const val = parseFloat(e.target.value); setMinSimilarity(val); if (id) updateNode(id, { minSimilarity: val }); }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="an-field"
              style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--studio-ink)', border: 'none' }}
            >
              <option value={0.3}>30%</option>
              <option value={0.5}>50%</option>
              <option value={0.7}>70%</option>
            </select>
          </div>
        </div>

        {/* Similar built projects */}
        {validatedProjects.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="an-field-label">Similar built projects</div>
            {validatedProjects.slice(0, topK).map((project) => (
              <div key={project.project_id} className="an-field" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, background: 'var(--studio-ground-deep)' }}>
                  {project.thumb_url && (
                    <img src={project.thumb_url} alt={project.title || 'Project'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--studio-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {project.title || project.project_id}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--studio-stone)' }}>
                    {project.typology}{project.country && ` · ${project.country}`}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--studio-ink)', flexShrink: 0 }}>
                  {Math.round(project.similarity * 100)}%
                </div>
              </div>
            ))}
          </div>
        )}

        {status === 'error' && error && (
          <div className="an-field" style={{ boxShadow: 'inset 0 0 0 1px var(--error)', color: 'var(--error)', fontSize: 10 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Validation failed</div>
            <div style={{ opacity: 0.85 }}>{error}</div>
          </div>
        )}

        {!isValidating && validatedProjects.length === 0 && !error && (
          <div className="an-field" style={{ textAlign: 'center', color: 'var(--studio-stone)', fontSize: 10, lineHeight: 1.4 }}>
            Connect an image and click Validate to find similar real projects.
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Left} id="image-input" style={{ top: '50%' }} />
      <Handle type="source" position={Position.Right} id="results-output" style={{ top: '50%' }} />
    </NodeFrame>
  );
};
