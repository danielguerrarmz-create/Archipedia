import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { useLocation } from 'wouter';
import { ResultsNodeData, PrecedentProject } from '../../types/nodes';
import { X, Play } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { toAbsoluteUrl } from '../../lib/navigatorApi';
import { NodeFrame, FuserState } from './BaseNode';

interface ResultsNodeProps {
  data: ResultsNodeData;
  selected?: boolean;
  id?: string;
}

export const ResultsNode: React.FC<ResultsNodeProps> = ({ data, selected, id }) => {
  const [, setLocation] = useLocation();
  const { deleteNode, executeFromNode, nodes } = useCanvasStore();
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [resultCount, setResultCount] = useState(data.resultCount || 0);
  const [projects, setProjects] = useState<PrecedentProject[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const node = nodes.find((n) => n.id === id);
    const nodeData = node?.data as any;
    if (!nodeData) return;
    if (nodeData.executionStatus === 'success') {
      setStatus('success');
      const results = nodeData.executionResult?.results || [];
      const projectList = nodeData.executionResult?.projects || [];
      setResultCount(nodeData.executionResult?.count || results.length || projectList.length || 0);
      if (projectList.length > 0) {
        setProjects(projectList);
      } else if (results.length > 0) {
        setProjects(results.map((r: any) => ({
          id: r.project_id || r.image_id || r.id || '',
          title: r.title || r.project_id || 'Result',
          thumbnail: toAbsoluteUrl(r.thumb_url) || '',
        })));
      }
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

  const fuser: FuserState =
    status === 'running' ? 'running' : status === 'error' ? 'error' : status === 'success' ? 'resolved' : 'ready';

  return (
    <NodeFrame
      data={{ ...data, resultCount } as ResultsNodeData}
      selected={selected}
      index={(data as any).__index}
      state={fuser}
      media
      noHandles
      headerActions={
        <>
          <button className="an-node__btn" onClick={handleRun} onMouseDown={(e) => e.stopPropagation()} disabled={status === 'running'} title="Run"><Play size={9} /> RUN</button>
          <button className="an-node__btn an-node__btn--icon" onClick={(e) => { e.stopPropagation(); if (id) deleteNode(id); }} onMouseDown={(e) => e.stopPropagation()}><X size={11} /></button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="an-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="an-field-label">RESULTS</span>
          <span className="an-num mono-meta" style={{ fontSize: 11, color: 'var(--ink-700)' }}>{resultCount}</span>
        </div>

        {errorMessage && (
          <div className="mono-meta" style={{ fontSize: 10, color: 'var(--error)' }}>{errorMessage}</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
          {projects.length > 0 ? (
            projects.slice(0, 12).map((project, i) => (
              <div
                key={project.id || i}
                className="an-field"
                style={{ width: '100%', paddingBottom: '100%', position: 'relative', overflow: 'hidden', cursor: 'pointer', padding: 0 }}
                title={project.title}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (project.id) setLocation(`/project/${encodeURIComponent(project.id)}`);
                }}
              >
                {project.thumbnail ? (
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : null}
              </div>
            ))
          ) : (
            Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="an-field" style={{ width: '100%', paddingBottom: '100%', position: 'relative' }} />
            ))
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Left} id="input" style={{ top: '50%' }} />
      <Handle type="source" position={Position.Right} id="output" style={{ top: '50%' }} />
    </NodeFrame>
  );
};
