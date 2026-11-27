/**
 * AddNodeModal — a compact command palette for adding nodes by CLICK/keyboard.
 * Anchored as a small popover immediately to the right of the floating rail (it
 * does NOT cover the canvas). Dark, to sit on the black studio ground. Open from
 * the rail (+), the `/` key, or double-clicking empty canvas.
 *
 * Two sections: searchable node types (grouped by family) + starter templates.
 * Esc / outside-click closes; Enter adds the first match.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { X, CornerDownLeft } from "lucide-react";
import { STARTER_TEMPLATES, type SeededGraph } from "../../lib/canvasTemplates";
import {
  getNodeGlyph,
  getNodeCategory,
  CATEGORY_ACCENT,
  type NodeCategory,
} from "../Nodes/BaseNode";

interface NodeEntry {
  type: string;
  label: string;
  sub: string;
  desc: string;
}

const CATALOG: { category: NodeCategory; label: string; entries: NodeEntry[] }[] = [
  {
    category: "input",
    label: "INPUT",
    entries: [
      { type: "precedent", label: "Precedent", sub: "PROJECT", desc: "A real built project to start from" },
      { type: "image", label: "Image search", sub: "VISUAL", desc: "Match by an uploaded image" },
      { type: "text", label: "Text", sub: "PROMPT", desc: "Describe what you're after" },
      { type: "styleReference", label: "Style reference", sub: "STYLE", desc: "Extract material / palette cues" },
    ],
  },
  {
    category: "operator",
    label: "OPERATOR",
    entries: [
      { type: "operatorAND", label: "Match both", sub: "AND", desc: "Keep what's similar to both inputs" },
      { type: "operatorOR", label: "Match either", sub: "OR", desc: "Combine two sets of matches" },
      { type: "operatorNOT", label: "Exclude", sub: "NOT", desc: "Remove anything like the exclude set" },
      { type: "attributeFilter", label: "Attribute filter", sub: "FILTER", desc: "Weight visual / spatial / regional" },
      { type: "scalar", label: "Scalar constraints", sub: "RANGE", desc: "Bound area, height, etc." },
    ],
  },
  {
    category: "generate",
    label: "GENERATE",
    entries: [{ type: "generate", label: "Generate", sub: "RENDER", desc: "Spin new directions from the set" }],
  },
  {
    category: "output",
    label: "OUTPUT",
    entries: [
      { type: "validate", label: "Validate", sub: "CHECK", desc: "Check a generated image against the index" },
      { type: "results", label: "Results", sub: "OUTPUT", desc: "The ranked grid of matches" },
    ],
  },
];

const ALL_ENTRIES = CATALOG.flatMap((f) => f.entries.map((e) => ({ ...e, category: f.category })));

export function AddNodeModal({
  open,
  onClose,
  onAdd,
  onSeedTemplate,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (type: string) => void;
  onSeedTemplate: (seed: SeededGraph) => void;
}) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const needle = q.trim().toLowerCase();
  const filteredFamilies = useMemo(() => {
    if (!needle) return CATALOG;
    return CATALOG.map((f) => ({
      ...f,
      entries: f.entries.filter(
        (e) =>
          e.label.toLowerCase().includes(needle) ||
          e.sub.toLowerCase().includes(needle) ||
          e.desc.toLowerCase().includes(needle) ||
          f.label.toLowerCase().includes(needle),
      ),
    })).filter((f) => f.entries.length > 0);
  }, [needle]);

  const firstMatch = useMemo(() => {
    if (!needle) return null;
    return (
      ALL_ENTRIES.find(
        (e) =>
          e.label.toLowerCase().includes(needle) ||
          e.sub.toLowerCase().includes(needle) ||
          e.desc.toLowerCase().includes(needle),
      ) ?? null
    );
  }, [needle]);

  if (!open) return null;

  const choose = (type: string) => {
    onAdd(type);
    onClose();
  };

  return (
    <>
      {/* transparent click-catcher — closes on outside click, canvas stays visible */}
      <div onMouseDown={onClose} style={{ position: "fixed", inset: 0, zIndex: 190, background: "transparent" }} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add a node"
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          left: 66,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 200,
          width: 320,
          maxHeight: "min(620px, 78%)",
          display: "flex",
          flexDirection: "column",
          background: "var(--studio-ground-2, #16150f)",
          border: "1px solid var(--studio-line-strong)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 18px 50px -16px rgba(0,0,0,0.85), 0 2px 8px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}
      >
        {/* search header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 12px",
            borderBottom: "1px solid var(--studio-line)",
          }}
        >
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && firstMatch) choose(firstMatch.type);
            }}
            placeholder="Add a node…"
            aria-label="Search node types"
            style={{
              flex: 1,
              minWidth: 0,
              height: 30,
              padding: "0 4px",
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--studio-ink)",
            }}
          />
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ display: "grid", placeItems: "center", width: 24, height: 24, border: "none", background: "transparent", color: "var(--studio-stone)", cursor: "pointer", borderRadius: "var(--radius-sm)" }}
          >
            <X size={15} />
          </button>
        </div>

        {/* list */}
        <div style={{ overflowY: "auto", padding: "6px 6px 8px" }}>
          {filteredFamilies.length === 0 && (
            <div className="mono-meta" style={{ padding: "20px 12px", color: "var(--studio-stone-dim)", textAlign: "center" }}>
              No nodes match “{q}”.
            </div>
          )}

          {filteredFamilies.map((fam) => (
            <div key={fam.category} style={{ marginBottom: 4 }}>
              <div className="mono-caps" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 8px 4px", fontSize: 9.5, color: CATEGORY_ACCENT[fam.category] }}>
                <span style={{ width: 4, height: 4, borderRadius: 1, background: "currentColor" }} />
                {fam.label}
              </div>
              {fam.entries.map((entry) => {
                const Glyph = getNodeGlyph(entry.type);
                const accent = CATEGORY_ACCENT[getNodeCategory(entry.type)];
                const isFirst = firstMatch?.type === entry.type;
                return (
                  <button
                    key={entry.type}
                    onClick={() => choose(entry.type)}
                    className="add-node-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "7px 8px",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      background: isFirst ? "rgba(31,63,255,0.16)" : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ display: "grid", placeItems: "center", width: 26, height: 26, flexShrink: 0, borderRadius: "var(--radius-sm)", background: "var(--studio-ground-deep, #131210)", border: "1px solid var(--studio-line)", color: accent }}>
                      <Glyph size={14} />
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 550, color: "var(--studio-ink)" }}>{entry.label}</span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--studio-stone)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.desc}</span>
                    </span>
                    <span className="mono-meta" style={{ marginLeft: "auto", fontSize: 9.5, color: "var(--studio-stone-dim)", flexShrink: 0 }}>{entry.sub}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", borderTop: "1px solid var(--studio-line)", color: "var(--studio-stone-dim)" }}>
          <CornerDownLeft size={12} />
          <span className="mono-meta" style={{ fontSize: 10 }}>Enter adds top match · Esc closes</span>
        </div>
      </div>

      <style>{`
        .add-node-row:hover { background: rgba(255,255,255,0.06) !important; }
        .add-node-row:focus-visible { box-shadow: 0 0 0 2px var(--focus-ring-on-dark, rgba(241,239,233,0.5)); }
      `}</style>
    </>
  );
}

export default AddNodeModal;
