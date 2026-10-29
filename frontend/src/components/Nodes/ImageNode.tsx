import React, { useState, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { BaseNodeData } from '../../types/nodes';
import { Upload } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { NodeFrame, FuserState } from './BaseNode';
import { UploadPrivacyNote } from '../UploadPrivacyNote';

interface ImageNodeData extends BaseNodeData {
  type: 'image';
  imageUrl?: string;
  imageFile?: File;
}

interface ImageNodeProps {
  data: ImageNodeData;
  selected?: boolean;
  id?: string;
}

export const ImageNode: React.FC<ImageNodeProps> = ({ data, selected, id }) => {
  const { deleteNode, executeFromNode, updateNode } = useCanvasStore();
  const [imageUrl, setImageUrl] = useState(data.imageUrl || '');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRun = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;
    updateNode(id, { executionStatus: 'running', executionError: undefined });
    await executeFromNode(id);
  };

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const nextUrl = e.target?.result as string;
        setImageUrl(nextUrl);
        if (id) updateNode(id, { imageUrl: nextUrl, imageFile: file });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleClick = () => fileInputRef.current?.click();

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const status = (data as any).executionStatus as string | undefined;
  const err = ((data as any).executionError as string | undefined) || undefined;
  const results = (data as any).executionResult?.results;
  const resultCount = Array.isArray(results) ? results.length : 0;

  const fuser: FuserState =
    status === 'running' ? 'running'
    : status === 'error' ? 'error'
    : status === 'success' ? 'resolved'
    : imageUrl ? 'ready' : 'empty';

  return (
    <NodeFrame
      data={data}
      selected={selected}
      index={(data as any).__index}
      state={fuser}
      media
      sublabel="Find by image"
      onDelete={(e) => { e.stopPropagation(); if (id) deleteNode(id); }}
      primaryAction={{ label: 'Run', runningLabel: 'Searching', onClick: handleRun, running: status === 'running', disabled: !imageUrl }}
      noHandles
    >
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {imageUrl ? (
          <div className="an-field" style={{ width: '100%', aspectRatio: '16/9', padding: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={handleClick}>
            <img src={imageUrl} alt="Uploaded reference" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <div
            onClick={handleClick}
            className="an-field"
            style={{
              width: '100%', aspectRatio: '16/9',
              outline: isDragging ? '1px dashed var(--signal)' : '1px dashed var(--studio-line-strong)',
              outlineOffset: -3,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer', color: 'var(--studio-stone)',
            }}
          >
            <Upload size={26} />
            <div className="an-field-label">Click or drop an image</div>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInputChange} style={{ display: 'none' }} />

        {!imageUrl && <UploadPrivacyNote tone="dark" />}

        {status === 'error' && (
          <div className="an-field" style={{ boxShadow: 'inset 0 0 0 1px var(--error)', color: 'var(--error)', fontSize: 10, lineHeight: 1.4 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Run failed</div>
            <div style={{ opacity: 0.85 }}>{err || 'Unknown error'}</div>
          </div>
        )}

        {status === 'success' && resultCount > 0 && (
          <div className="an-field" style={{ fontSize: 10, color: 'var(--studio-stone)', textAlign: 'center' }}>
            Found {resultCount} visually similar matches
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Left} id="input" style={{ top: '50%' }} />
      <Handle type="source" position={Position.Right} id="output" style={{ top: '50%' }} />
    </NodeFrame>
  );
};
