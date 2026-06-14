import React from 'react';
import { Sparkles, Plus, Save, Filter, SortAsc, Play, RotateCcw } from 'lucide-react';
import { ViewModeToggle } from './ViewModeToggle';
import { WorkflowGeneratorDialog } from '../Dialogs/WorkflowGeneratorDialog';
import { useCanvasStore } from '../../stores/canvasStore';

interface CanvasToolbarProps {
  viewMode: 'results' | 'workflow';
  onToggleMode: () => void;
  selectedCount: number;
  onAddNode?: () => void;
}

/** Raised, pressable secondary action. */
const ghostBtn: React.CSSProperties = {
  height: 32,
  padding: '0 14px',
  background: 'var(--concrete-100)',
  boxShadow: 'var(--emboss)',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: 'var(--ink-700)',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  transition: 'box-shadow var(--dur-1) var(--ease-press)',
};

/** The single signal action (Run / primary). */
const signalBtn: React.CSSProperties = {
  height: 32,
  padding: '0 18px',
  background: 'var(--signal)',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  fontWeight: 500,
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  boxShadow: 'var(--emboss)',
  transition: 'background var(--dur-1) var(--ease-press)',
};

const press = (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.boxShadow = 'var(--deboss)'; };
const lift = (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.boxShadow = 'var(--emboss)'; };

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  viewMode,
  onToggleMode,
  selectedCount,
  onAddNode,
}) => {
  const [showWorkflowDialog, setShowWorkflowDialog] = React.useState(false);
  const { executeWorkflow, clearExecutionResults, isExecuting } = useCanvasStore();

  return (
    <>
      <div
        style={{
          height: 48,
          padding: '0 40px',
          background: 'var(--concrete-100)',
          borderBottom: '1px solid var(--hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <ViewModeToggle mode={viewMode} onToggle={onToggleMode} selectedCount={selectedCount} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {viewMode === 'results' ? (
            <>
              <button style={ghostBtn} onMouseEnter={press} onMouseLeave={lift}><Filter size={16} /> Filters</button>
              <button style={ghostBtn} onMouseEnter={press} onMouseLeave={lift}><SortAsc size={16} /> Sort</button>
              {selectedCount > 0 && (
                <button onClick={onToggleMode} style={signalBtn}>
                  Build workflow ({selectedCount})
                </button>
              )}
            </>
          ) : (
            <>
              {/* The one signal action: Run */}
              <button
                onClick={() => executeWorkflow()}
                disabled={isExecuting}
                style={{ ...signalBtn, background: isExecuting ? 'var(--ink-300)' : 'var(--signal)', cursor: isExecuting ? 'not-allowed' : 'pointer' }}
              >
                <Play size={16} />
                {isExecuting ? 'Running…' : 'Run workflow'}
              </button>
              <button onClick={() => clearExecutionResults()} disabled={isExecuting} style={{ ...ghostBtn, opacity: isExecuting ? 0.5 : 1 }} onMouseEnter={press} onMouseLeave={lift}>
                <RotateCcw size={16} /> Clear results
              </button>
              <button onClick={() => setShowWorkflowDialog(true)} style={ghostBtn} onMouseEnter={press} onMouseLeave={lift}>
                <Sparkles size={16} /> Generate workflow
              </button>
              {onAddNode && (
                <button onClick={onAddNode} style={ghostBtn} onMouseEnter={press} onMouseLeave={lift}>
                  <Plus size={16} /> Add node
                </button>
              )}
              <button style={ghostBtn} onMouseEnter={press} onMouseLeave={lift}><Save size={16} /> Save</button>
            </>
          )}
        </div>
      </div>
      {showWorkflowDialog && (
        <WorkflowGeneratorDialog open={showWorkflowDialog} onClose={() => setShowWorkflowDialog(false)} />
      )}
    </>
  );
};
