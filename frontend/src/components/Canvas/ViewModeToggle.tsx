import React from 'react';
import { LayoutGrid, Workflow } from 'lucide-react';

interface ViewModeToggleProps {
  mode: 'results' | 'workflow';
  onToggle: () => void;
  selectedCount?: number;
}

/**
 * Debossed segmented control with a signal underline on the active segment.
 * No yellow/green pills — depth + the one accent.
 */
export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  mode,
  onToggle,
  selectedCount = 0,
}) => {
  const seg = (active: boolean): React.CSSProperties => ({
    height: 32,
    padding: '0 16px',
    background: 'transparent',
    border: 'none',
    borderBottom: `2px solid ${active ? 'var(--signal)' : 'transparent'}`,
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: active ? 'var(--ink-900)' : 'var(--ink-400)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'color var(--dur-1) var(--ease-press), border-color var(--dur-1) var(--ease-press)',
    position: 'relative',
  });

  return (
    <div
      className="deboss"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '2px 4px',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <button onClick={onToggle} style={seg(mode === 'results')}>
        <LayoutGrid size={14} />
        Results
      </button>
      <button onClick={onToggle} style={seg(mode === 'workflow')}>
        <Workflow size={14} />
        Workflow
        {selectedCount > 0 && mode === 'results' && (
          <span
            className="mono-meta"
            style={{
              marginLeft: 2,
              fontSize: 10,
              color: 'var(--signal)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {selectedCount}
          </span>
        )}
      </button>
    </div>
  );
};
