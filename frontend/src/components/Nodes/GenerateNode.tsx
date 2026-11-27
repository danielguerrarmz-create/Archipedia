import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { GenerateNodeData, GeneratedImageData } from '../../types/nodes';
import { Sparkles, Check } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { NodeFrame, FuserState } from './BaseNode';

interface GenerateNodeProps {
  data: GenerateNodeData;
  selected?: boolean;
  id?: string;
}

export const GenerateNode: React.FC<GenerateNodeProps> = ({ data, selected, id }) => {
  const { deleteNode, updateNode, executeFromNode } = useCanvasStore();
  const [prompt, setPrompt] = useState(data.prompt || '');
  const [style, setStyle] = useState<'photorealistic' | 'render' | 'sketch'>(data.style || 'render');
  const [variationCount, setVariationCount] = useState<1 | 2 | 4>(data.variationCount || 4);

  const handleRun = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;
    updateNode(id, { prompt, style, variationCount, status: 'generating', error: undefined });
    await executeFromNode(id);
  };

  const handleSelectImage = useCallback((index: number) => {
    if (id) updateNode(id, { selectedImageIndex: index });
  }, [id, updateNode]);

  const executionStatus = (data as any).executionStatus;
  const nodeStatus = data.status;
  const status = executionStatus || nodeStatus;
  const isGenerating = (nodeStatus === 'generating' || nodeStatus === 'running') && !executionStatus;
  const isComplete = executionStatus === 'success' || status === 'complete';
  const error = data.error || (data as any).executionError;
  const executionResult = (data as any).executionResult;
  const generatedImages: GeneratedImageData[] = executionResult?.images || data.generatedImages || [];
  const selectedIndex = data.selectedImageIndex || 0;

  const styles = [
    { value: 'render', label: 'RENDER' },
    { value: 'photorealistic', label: 'PHOTO' },
    { value: 'sketch', label: 'SKETCH' },
  ] as const;

  const fuser: FuserState =
    isGenerating ? 'running' : status === 'error' ? 'error' : isComplete ? 'resolved' : 'ready';

  return (
    <NodeFrame
      data={data}
      selected={selected}
      index={(data as any).__index}
      state={fuser}
      media
      noHandles
      sublabel="Generate concept"
      onDelete={(e) => { e.stopPropagation(); if (id) deleteNode(id); }}
      primaryAction={{ label: 'Generate', runningLabel: 'Generating', onClick: handleRun, running: isGenerating, disabled: !prompt.trim() }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <div className="an-field-label" style={{ marginBottom: 6 }}>PROMPT</div>
          <textarea
            value={prompt}
            onChange={(e) => { setPrompt(e.target.value); if (id) updateNode(id, { prompt: e.target.value }); }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder="Describe your architectural concept..."
            className="an-field"
            style={{
              width: '100%', height: 70, resize: 'none', border: 'none', outline: 'none',
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--studio-ink)',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {styles.map(({ value, label }) => (
            <button
              key={value}
              className={`an-node__btn${style === value ? ' an-node__btn--signal' : ''}`}
              onClick={(e) => { e.stopPropagation(); setStyle(value); if (id) updateNode(id, { style: value }); }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {label}
            </button>
          ))}
          <select
            value={variationCount}
            onChange={(e) => { const val = parseInt(e.target.value) as 1 | 2 | 4; setVariationCount(val); if (id) updateNode(id, { variationCount: val }); }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="an-field"
            style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--studio-ink)', border: 'none' }}
          >
            <option value={1}>×1</option>
            <option value={2}>×2</option>
            <option value={4}>×4</option>
          </select>
        </div>

        {generatedImages.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: generatedImages.length > 2 ? 'repeat(2, 1fr)' : `repeat(${generatedImages.length}, 1fr)`, gap: 8 }}>
            {generatedImages.map((img, idx) => {
              const isSel = selectedIndex === idx;
              return (
                <button
                  key={img.id}
                  onClick={(e) => { e.stopPropagation(); handleSelectImage(idx); }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="an-field"
                  style={{
                    position: 'relative', aspectRatio: img.url ? '1' : 'auto', minHeight: img.url ? undefined : 60,
                    overflow: 'hidden', padding: 0, cursor: 'pointer',
                    boxShadow: isSel ? '0 0 0 1.5px var(--signal)' : undefined,
                  }}
                >
                  {img.url ? (
                    <img src={img.url} alt={`Generated concept ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--studio-stone)' }}>
                      <Sparkles size={16} />
                      {img.description && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--studio-stone)', textAlign: 'center', lineHeight: 1.2, maxHeight: 32, overflow: 'hidden' }}>
                          {img.description.slice(0, 60)}...
                        </span>
                      )}
                    </div>
                  )}
                  {isSel && (
                    <div style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, background: 'var(--signal)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={10} color="#fff" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {status === 'error' && error && (
          <div className="an-field" style={{ boxShadow: 'inset 0 0 0 1px var(--error)', color: 'var(--error)', fontSize: 10 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Generation failed</div>
            <div style={{ opacity: 0.85 }}>{error}</div>
          </div>
        )}
      </div>

      {/* Input: accept a precedent / style reference (template wires 'projects') */}
      <Handle type="target" position={Position.Left} id="projects" style={{ top: '44px' }} />
      <Handle type="target" position={Position.Left} id="style-input" style={{ top: '66px' }} />
      {/* Output: image stream (template wires 'output') */}
      <Handle type="source" position={Position.Right} id="output" style={{ top: '44px' }} />
      <Handle type="source" position={Position.Right} id="image-output" style={{ top: '66px' }} />
    </NodeFrame>
  );
};
