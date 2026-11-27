/**
 * CanvasRail — the minimal floating left icon-rail (Fuser/Flora model), replacing
 * the old fat tabbed palette so the canvas reads as open studio space. Just the
 * essentials: add a node (opens the command palette), browse templates, and
 * re-frame the view. Tooltips on hover; 44px targets.
 */
import { Plus, LayoutGrid, Maximize2 } from "lucide-react";

function RailButton({
  label,
  onClick,
  primary,
  children,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="canvas-rail__btn"
      data-primary={primary ? "true" : undefined}
      style={{
        display: "grid",
        placeItems: "center",
        width: 40,
        height: 40,
        border: "none",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        color: primary ? "#fff" : "var(--ink-700)",
        background: primary ? "var(--ink-900)" : "transparent",
        boxShadow: primary ? "var(--emboss)" : "none",
        transition: "background var(--dur-1) var(--ease-press), color var(--dur-1) var(--ease-press)",
      }}
    >
      {children}
    </button>
  );
}

export function CanvasRail({
  onAddNode,
  onTemplates,
  onFit,
}: {
  onAddNode: () => void;
  onTemplates: () => void;
  onFit: () => void;
}) {
  return (
    <div
      className="canvas-rail"
      style={{
        position: "absolute",
        left: 16,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 5,
        background: "var(--concrete-100)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--raised)",
      }}
    >
      <RailButton label="Add node  ·  /" onClick={onAddNode} primary>
        <Plus size={19} strokeWidth={2} />
      </RailButton>
      <RailButton label="Templates" onClick={onTemplates}>
        <LayoutGrid size={18} strokeWidth={1.75} />
      </RailButton>
      <div style={{ height: 1, background: "var(--hairline)", margin: "2px 6px" }} />
      <RailButton label="Fit to view" onClick={onFit}>
        <Maximize2 size={17} strokeWidth={1.75} />
      </RailButton>
      <style>{`
        .canvas-rail__btn:not([data-primary]):hover { background: var(--concrete-200); color: var(--ink-900); }
      `}</style>
    </div>
  );
}

export default CanvasRail;
