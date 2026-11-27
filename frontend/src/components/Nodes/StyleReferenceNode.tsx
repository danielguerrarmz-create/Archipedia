import React, { useState, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { StyleReferenceNodeData } from '../../types/nodes';
import { Upload } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { NodeFrame, FuserState } from './BaseNode';
import { UploadPrivacyNote } from '../UploadPrivacyNote';

interface StyleReferenceNodeProps {
  data: StyleReferenceNodeData;
  selected?: boolean;
  id?: string;
}

export const StyleReferenceNode: React.FC<StyleReferenceNodeProps> = ({ data, selected, id }) => {
  const { deleteNode, updateNode, executeFromNode } = useCanvasStore();
  const [imageUrl, setImageUrl] = useState(data.imageUrl || '');
  const [isDragging, setIsDragging] = useState(false);
  const [extractMaterials, setExtractMaterials] = useState(data.extractMaterials !== false);
  const [extractPalette, setExtractPalette] = useState(data.extractPalette !== false);
  const [extractMassing, setExtractMassing] = useState(data.extractMassing || false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRun = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id && imageUrl) {
      updateNode(id, { imageUrl, extractMaterials, extractPalette, extractMassing, status: 'extracting', error: undefined });
      await executeFromNode(id);
    }
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

  const status = data.status || (data as any).executionStatus;
  const isExtracting = status === 'extracting' || status === 'running';
  const error = data.error || (data as any).executionError;
  const executionResult = (data as any).executionResult;
  const styleDescription = executionResult?.styleDescription || data.styleDescription || '';

  const fuser: FuserState =
    isExtracting ? 'running'
    : status === 'error' ? 'error'
    : status === 'complete' || styleDescription ? 'resolved'
    : imageUrl ? 'ready' : 'empty';

  const toggle = (
    label: string,
    checked: boolean,
    set: (v: boolean) => void,
    key: 'extractMaterials' | 'extractPalette' | 'extractMassing',
  ) => (
    <label
      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--studio-stone)', cursor: 'pointer' }}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => { set(e.target.checked); if (id) updateNode(id, { [key]: e.target.checked } as any); }}
        style={{ margin: 0 }}
      />
      {label}
    </label>
  );

  return (
    <NodeFrame
      data={data}
      selected={selected}
      index={(data as any).__index}
      state={fuser}
      media
      sublabel="Extract a style"
      onDelete={(e) => { e.stopPropagation(); if (id) deleteNode(id); }}
      primaryAction={{ label: 'Extract', runningLabel: 'Extracting', onClick: handleRun, running: isExtracting, disabled: !imageUrl }}
      noHandles
    >
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {imageUrl ? (
          <div className="an-field" style={{ width: '100%', aspectRatio: '16/10', padding: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={handleClick}>
            <img src={imageUrl} alt="Style reference" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <div
            onClick={handleClick}
            className="an-field"
            style={{
              width: '100%', aspectRatio: '16/10',
              outline: isDragging ? '1px dashed var(--signal)' : '1px dashed var(--studio-line-strong)',
              outlineOffset: -3,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer', color: 'var(--studio-stone)',
            }}
          >
            <Upload size={24} />
            <div className="an-field-label">Drop reference image</div>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInputChange} style={{ display: 'none' }} />

        {!imageUrl && <UploadPrivacyNote tone="dark" />}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {toggle('Materials', extractMaterials, setExtractMaterials, 'extractMaterials')}
          {toggle('Palette', extractPalette, setExtractPalette, 'extractPalette')}
          {toggle('Massing', extractMassing, setExtractMassing, 'extractMassing')}
        </div>

        {styleDescription && (
          <div className="an-field" style={{ fontSize: 10, lineHeight: 1.5, color: 'var(--studio-stone)', maxHeight: 80, overflow: 'auto' }}>
            {styleDescription}
          </div>
        )}

        {status === 'error' && error && (
          <div className="an-field" style={{ boxShadow: 'inset 0 0 0 1px var(--error)', color: 'var(--error)', fontSize: 10 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Extraction failed</div>
            <div style={{ opacity: 0.85 }}>{error}</div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} id="style-output" style={{ top: '50%' }} />
    </NodeFrame>
  );
};
