import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CustomSelectionBoxProps {
  x: number;
  y: number;
  width: number;
  height: number;
  onGroup: () => void;
  onUngroup?: () => void;
  onSaveWorkflow: () => void;
  selectedCount: number;
  canUngroup?: boolean;
}

export const CustomSelectionBox: React.FC<CustomSelectionBoxProps> = ({
  x,
  y,
  width,
  height,
  onGroup,
  onUngroup,
  onSaveWorkflow,
  selectedCount,
  canUngroup = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const padding = 8; // Padding offset
  const frameWidth = 1.5; // Frame thickness — signal hairline

  const corner = (pos: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute',
    width: 7,
    height: 7,
    background: 'var(--concrete-sunken)',
    boxShadow: 'var(--deboss)',
    borderRadius: 'var(--radius-sm)',
    ...pos,
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x - padding}px`,
        top: `${y - padding}px`,
        width: `${width + padding * 2}px`,
        height: `${height + padding * 2}px`,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {/* Frame — signal hairline */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: `${frameWidth}px solid var(--signal)`,
          borderRadius: 'var(--radius-md)',
          background: 'var(--signal-tint)',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />
      {/* Debossed corner node handles */}
      <div style={corner({ left: -3, top: -3 })} />
      <div style={corner({ right: -3, top: -3 })} />
      <div style={corner({ left: -3, bottom: -3 })} />
      <div style={corner({ right: -3, bottom: -3 })} />

      {/* Dropdown Menu at Top — raised */}
      <div
        style={{
          position: 'absolute',
          top: `-${34 + frameWidth}px`,
          left: '0',
          background: 'var(--concrete-100)',
          boxShadow: 'var(--raised)',
          borderRadius: 'var(--radius-md)',
          minWidth: '180px',
          pointerEvents: 'auto',
          fontFamily: 'var(--font-mono)',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDropdownOpen(!isDropdownOpen);
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            textAlign: 'left',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            color: 'var(--ink-700)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--concrete-sunken)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span>Selection ({selectedCount})</span>
          {isDropdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        
        {isDropdownOpen && (
          <div style={{ borderTop: '1px solid var(--hairline)' }}>
            {canUngroup && onUngroup ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUngroup();
                  setIsDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: 'var(--ink-700)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--concrete-sunken)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Ungroup
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onGroup();
                  setIsDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: 'var(--ink-700)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--concrete-sunken)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Group ({selectedCount} nodes)
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSaveWorkflow();
                setIsDropdownOpen(false);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                textAlign: 'left',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                color: 'var(--ink-700)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--concrete-sunken)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Save Workflow
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

