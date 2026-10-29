import React from 'react';
import { MousePointer2, Hand, Type, Frame, Square } from 'lucide-react';
import { Editor } from 'tldraw';

type Tool = 'select' | 'hand' | 'text' | 'frame' | 'rect';

interface ToolBarProps {
  editor: Editor | null;
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

const tools: { id: Tool; icon: React.ReactNode; label: string; shortcut: string }[] = [
  { id: 'select', icon: <MousePointer2 size={20} />, label: 'Select', shortcut: 'V' },
  { id: 'hand', icon: <Hand size={20} />, label: 'Pan', shortcut: 'H' },
  { id: 'text', icon: <Type size={20} />, label: 'Text', shortcut: 'T' },
  { id: 'frame', icon: <Frame size={20} />, label: 'Frame', shortcut: 'F' },
  { id: 'rect', icon: <Square size={20} />, label: 'Shape', shortcut: 'R' },
];

export function ToolBar({ editor, activeTool, onToolChange }: ToolBarProps) {
  const handleToolClick = (tool: Tool) => {
    onToolChange(tool);
    
    if (!editor) return;
    
    // Map our tools to tldraw tools
    switch (tool) {
      case 'select':
        editor.setCurrentTool('select');
        break;
      case 'hand':
        editor.setCurrentTool('hand');
        break;
      case 'text':
        editor.setCurrentTool('text');
        break;
      case 'frame':
        // For frame, we'll use a custom tool or create shape directly
        editor.setCurrentTool('select');
        break;
      case 'rect':
        editor.setCurrentTool('geo');
        break;
    }
  };

  return (
    <div
      style={{
        width: 48,
        background: 'var(--concrete-100)',
        borderRight: '1px solid var(--hairline)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 12,
        gap: 4,
        flexShrink: 0,
      }}
    >
      {tools.map((tool) => {
        const active = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            title={`${tool.label} (${tool.shortcut})`}
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: active ? 'var(--concrete-sunken)' : 'transparent',
              boxShadow: active ? 'var(--deboss)' : 'none',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: active ? 'var(--signal)' : 'var(--ink-500)',
              transition: 'box-shadow var(--dur-1) var(--ease-press), color var(--dur-1) var(--ease-press)',
            }}
          >
            {tool.icon}
          </button>
        );
      })}

      <div style={{ width: 24, height: 1, background: 'var(--hairline)', margin: '8px 0' }} />

      {/* Snap toggle could go here */}
    </div>
  );
}

