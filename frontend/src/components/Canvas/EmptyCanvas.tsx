import React from 'react';
import { NodeField } from '../motif';
import { STARTER_TEMPLATES, SeededGraph } from '../../lib/canvasTemplates';

interface EmptyCanvasProps {
  onSeed: (seed: SeededGraph) => void;
}

/**
 * EmptyCanvas — shown when the graph is empty. Sparse NodeField art, a single
 * heading, and three one-click starter templates that stamp a pre-wired graph.
 */
export const EmptyCanvas: React.FC<EmptyCanvasProps> = ({ onSeed }) => {
  return (
    <div className="an-empty" aria-label="Empty canvas">
      <div className="an-empty__inner">
        <NodeField width={240} height={130} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span className="mono-caps an-empty__eyebrow">PRECEDENT GRAPH</span>
          <h2 className="an-empty__heading">Start a precedent graph</h2>
        </div>
        <div className="an-empty__templates">
          {STARTER_TEMPLATES.map((t) => (
            <button
              key={t.id}
              className="an-template-card"
              onClick={() => onSeed(t.build())}
            >
              <span className="an-template-card__name">{t.name}</span>
              <span className="an-template-card__desc">{t.description}</span>
              <span className="an-template-card__flow">{t.flow}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmptyCanvas;
