import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { PrecedentNodeData, PrecedentProject } from '../../types/nodes';
import { X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { NodeFrame } from './BaseNode';

interface PrecedentNodeProps {
  data: PrecedentNodeData;
  selected?: boolean;
  id?: string;
}

export const PrecedentNode: React.FC<PrecedentNodeProps> = ({ data, selected, id }) => {
  const { deleteNode, updateNode } = useCanvasStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const projects = data.projects || [];
  const currentProject = projects[currentIndex];
  const isStacked = projects.length > 1;
  const isEmpty = projects.length === 0;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) deleteNode(id);
  };

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (id && projects.length > 1) {
      const updatedProjects = projects.filter((p) => p.id !== projectId);
      const newIndex = currentIndex >= updatedProjects.length ? updatedProjects.length - 1 : currentIndex;
      setCurrentIndex(Math.max(0, newIndex));
      updateNode(id, { projects: updatedProjects });
    } else if (id) {
      deleteNode(id);
    }
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : projects.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < projects.length - 1 ? prev + 1 : 0));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const dropData = e.dataTransfer.getData('application/archipedia-precedent');
    if (dropData && id) {
      try {
        const project: any = JSON.parse(dropData);
        const newProject: PrecedentProject = {
          id: project.id,
          title: project.name,
          thumbnail: project.imageUrl || project.url || '',
          attributes: {
            circulation: project.typology || '',
            materiality: project.materials?.join('+') || '',
            climate: project.climate || '',
          },
        };
        updateNode(id, { projects: [...projects, newProject] });
      } catch (error) {
        console.error('Error parsing dropped data:', error);
      }
    }
  };

  return (
    <NodeFrame
      data={data}
      selected={selected}
      index={(data as any).__index}
      state={isEmpty ? 'empty' : 'ready'}
      media
      noHandles
      sublabel="Reference project"
      onDelete={handleDelete}
      footerRight={isStacked ? <span className="an-num">{currentIndex + 1} / {projects.length}</span> : undefined}
    >
      <section
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
        onDrop={handleDrop}
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {currentProject ? (
          <>
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const projectId = currentProject.id || currentProject.title || 'unknown';
                window.open(`/project/${encodeURIComponent(projectId)}`, '_blank');
              }}
              className="an-field"
              style={{
                width: '100%', aspectRatio: '16/9', padding: 0,
                borderRadius: 'var(--radius-md)', overflow: 'hidden',
                position: 'relative', cursor: 'pointer',
              }}
            >
              {currentProject.thumbnail && currentProject.thumbnail.trim() ? (
                <img
                  src={currentProject.thumbnail}
                  alt={currentProject.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                style={{
                  width: '100%', height: '100%',
                  backgroundColor: 'var(--studio-ground-deep)',
                  display: currentProject.thumbnail && currentProject.thumbnail.trim() ? 'none' : 'flex',
                  alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6,
                  position: 'absolute', top: 0, left: 0, color: 'var(--studio-stone)',
                }}
              >
                <ImageIcon size={22} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{currentProject.title || 'Project'}</div>
              </div>

              {isStacked && (
                <>
                  <button onClick={handlePrevious} onMouseDown={(e) => e.stopPropagation()} className="an-node__btn an-node__btn--icon"
                    style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
                    <ChevronLeft size={13} />
                  </button>
                  <button onClick={handleNext} onMouseDown={(e) => e.stopPropagation()} className="an-node__btn an-node__btn--icon"
                    style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
                    <ChevronRight size={13} />
                  </button>
                  <button onClick={(e) => handleDeleteProject(e, currentProject.id)} onMouseDown={(e) => e.stopPropagation()} className="an-node__btn an-node__btn--icon"
                    style={{ position: 'absolute', top: 6, right: 6, zIndex: 10 }}>
                    <X size={11} />
                  </button>
                </>
              )}
            </div>

            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--studio-ink)' }}>{currentProject.title}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--studio-stone)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Object.entries(currentProject.attributes).slice(0, 2).map(([key, value]) => (
                <div key={key}>{key}: <span className="an-num">{value}</span></div>
              ))}
            </div>
          </>
        ) : (
          <div
            className="an-field"
            style={{
              width: '100%', aspectRatio: '16/9',
              outline: isDragOver ? '1px dashed var(--signal)' : '1px dashed var(--studio-line-strong)',
              outlineOffset: -3,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
              color: 'var(--studio-stone)',
            }}
          >
            <ImageIcon size={28} />
            <div className="an-field-label">Drop projects here</div>
          </div>
        )}
      </section>

      {/* Single output handle — Precedent is input-only */}
      <Handle type="source" position={Position.Right} id="output" style={{ top: '50%' }} />
    </NodeFrame>
  );
};
