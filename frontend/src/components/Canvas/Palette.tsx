import React, { useState } from 'react';
import { ReactFlowInstance } from 'reactflow';
import { useSearchStore, SearchResult } from '../../stores/searchStore';
import { STARTER_TEMPLATES, SeededGraph } from '../../lib/canvasTemplates';
import {
  getNodeGlyph,
  getNodeCategory,
  CATEGORY_ACCENT,
  NodeCategory,
} from '../Nodes/BaseNode';
import { ImageIcon } from 'lucide-react';

type Tab = 'nodes' | 'library' | 'templates';

interface PaletteEntry {
  type: string; // drag payload for application/archipedia-node-type
  label: string;
  sub: string;
}

/** Node families → entries. Drag contracts are UNCHANGED. */
const FAMILIES: { category: NodeCategory; label: string; entries: PaletteEntry[] }[] = [
  {
    category: 'input',
    label: 'INPUT',
    entries: [
      { type: 'precedent', label: 'Precedent', sub: 'PROJECT' },
      { type: 'image', label: 'Image search', sub: 'VISUAL' },
      { type: 'text', label: 'Text', sub: 'PROMPT' },
      { type: 'styleReference', label: 'Style reference', sub: 'STYLE' },
    ],
  },
  {
    category: 'operator',
    label: 'OPERATOR',
    entries: [
      { type: 'operatorAND', label: 'Match both', sub: 'AND' },
      { type: 'operatorOR', label: 'Match either', sub: 'OR' },
      { type: 'operatorNOT', label: 'Exclude', sub: 'NOT' },
      { type: 'attributeFilter', label: 'Attribute filter', sub: 'FILTER' },
      { type: 'scalar', label: 'Scalar constraints', sub: 'RANGE' },
    ],
  },
  {
    category: 'generate',
    label: 'GENERATE',
    entries: [
      { type: 'generate', label: 'Generate', sub: 'RENDER' },
    ],
  },
  {
    category: 'output',
    label: 'OUTPUT',
    entries: [
      { type: 'validate', label: 'Validate', sub: 'CHECK' },
      { type: 'results', label: 'Results', sub: 'OUTPUT' },
    ],
  },
];

interface PaletteProps {
  onSeedTemplate: (seed: SeededGraph) => void;
  reactFlowInstance: ReactFlowInstance | null;
}

const NodeChip: React.FC<{ entry: PaletteEntry }> = ({ entry }) => {
  const Glyph = getNodeGlyph(entry.type);
  const accent = CATEGORY_ACCENT[getNodeCategory(entry.type)];
  return (
    <button
      className="an-chip"
      style={{ ['--cat-accent' as any]: accent }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/archipedia-node-type', entry.type);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      <span className="an-chip__glyph"><Glyph size={13} /></span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span className="an-chip__label">{entry.label}</span>
        <span className="an-chip__sub">{entry.sub}</span>
      </span>
    </button>
  );
};

export const Palette: React.FC<PaletteProps> = ({ onSeedTemplate }) => {
  const [tab, setTab] = useState<Tab>('nodes');
  const searchResults = useSearchStore((s) => s.searchResults);

  return (
    <div className="an-palette">
      <div className="an-palette__tabs">
        {(['nodes', 'library', 'templates'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`an-palette__tab ${tab === t ? 'is-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="an-palette__body">
        {tab === 'nodes' && (
          FAMILIES.map((fam) => (
            <div key={fam.category} className="an-palette__group">
              <div
                className="an-palette__group-head"
                style={{ ['--cat-accent' as any]: CATEGORY_ACCENT[fam.category] }}
              >
                <span className="micro-tick" />
                {fam.label}
              </div>
              {fam.entries.map((entry) => (
                <NodeChip key={entry.type} entry={entry} />
              ))}
            </div>
          ))
        )}

        {tab === 'library' && (
          searchResults.length === 0 ? (
            <div className="an-palette__empty">
              No saved references yet.<br />
              Run a search to populate the library.
            </div>
          ) : (
            <div className="an-palette__lib-grid">
              {searchResults.map((r: SearchResult) => {
                const thumb = r.imageUrl || (typeof r.url === 'string' ? r.url : '');
                return (
                  <div
                    key={r.id}
                    className="an-palette__lib-cell"
                    draggable
                    title={r.name}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/archipedia-precedent', JSON.stringify(r));
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                  >
                    {thumb ? (
                      <img src={thumb} alt={r.name} draggable={false} />
                    ) : (
                      <span style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', color: 'var(--ink-400)',
                      }}>
                        <ImageIcon size={20} />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {tab === 'templates' && (
          STARTER_TEMPLATES.map((t) => (
            <button
              key={t.id}
              className="an-template-card"
              style={{ width: '100%', marginBottom: 'var(--space-2)' }}
              onClick={() => onSeedTemplate(t.build())}
            >
              <span className="an-template-card__name">{t.name}</span>
              <span className="an-template-card__desc">{t.description}</span>
              <span className="an-template-card__flow">{t.flow}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Palette;
