import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Plus, Slash } from 'lucide-react';
import { STARTER_TEMPLATES, SeededGraph } from '../../lib/canvasTemplates';

interface EmptyCanvasProps {
  onSeed: (seed: SeededGraph) => void;
}

/**
 * EmptyCanvas — the canvas's first impression. A small precedent-graph motif
 * quietly assembles itself (nodes settle, a connector draws, a union flashes),
 * over an editorial heading and a one-line "how to begin". Starter templates are
 * the hero path (one click = a pre-wired graph); the primitives live behind `/`.
 */
export const EmptyCanvas: React.FC<EmptyCanvasProps> = ({ onSeed }) => {
  const reduce = useReducedMotion();
  const on = !reduce;
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <div className="an-empty" aria-label="Empty canvas">
      <motion.div
        className="an-empty__inner"
        initial={on ? 'hidden' : false}
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } }}
      >
        {/* assembling precedent-graph motif */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}
        >
          <GraphMotif on={on} />
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
        >
          <span className="mono-caps an-empty__eyebrow">PRECEDENT GRAPH</span>
          <h2 className="an-empty__heading">Start a precedent graph</h2>
          <p
            style={{
              margin: 0,
              maxWidth: 440,
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              lineHeight: 1.55,
              color: 'var(--studio-stone, #a8a49a)',
            }}
          >
            Pick a starting point below — or build your own: press{' '}
            <Kbd><Slash size={11} strokeWidth={2.5} /></Kbd> (or{' '}
            <Kbd><Plus size={11} strokeWidth={2.5} /></Kbd> on the rail) to drop a node, then
            connect precedents, operators, and a results node.
          </p>
        </motion.div>

        <motion.div
          className="an-empty__templates"
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}
        >
          {STARTER_TEMPLATES.map((t) => (
            <button key={t.id} className="an-template-card" onClick={() => onSeed(t.build())}>
              <span className="an-template-card__name">{t.name}</span>
              <span className="an-template-card__desc">{t.description}</span>
              <span className="an-template-card__flow">{t.flow}</span>
            </button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 18,
        height: 18,
        verticalAlign: 'middle',
        borderRadius: 4,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid var(--studio-line, rgba(241,239,233,0.12))',
        color: 'var(--studio-ink, #f1efe9)',
        margin: '0 1px',
      }}
    >
      {children}
    </span>
  );
}

/**
 * GraphMotif — three nodes that settle in, a connector that draws between them,
 * and a union nub that flashes Signal — the node→connector→union grammar, looping
 * gently so the empty canvas reads as alive, not dead.
 */
function GraphMotif({ on }: { on: boolean }) {
  const ease = [0.16, 1, 0.3, 1] as const;
  const node = (delay: number) => ({
    initial: on ? { opacity: 0, scale: 0.6 } : { opacity: 1, scale: 1 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease, delay },
  });
  return (
    <svg width="260" height="120" viewBox="0 0 260 120" fill="none" aria-hidden style={{ overflow: 'visible' }}>
      {/* connectors */}
      <motion.path
        d="M58 40 H120 V64 H150"
        stroke="var(--studio-line-strong, rgba(241,239,233,0.22))"
        strokeWidth={1.5}
        strokeLinecap="square"
        initial={on ? { pathLength: 0 } : { pathLength: 1 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease, delay: 0.5 }}
      />
      <motion.path
        d="M58 86 H120 V64"
        stroke="var(--studio-line-strong, rgba(241,239,233,0.22))"
        strokeWidth={1.5}
        strokeLinecap="square"
        initial={on ? { pathLength: 0 } : { pathLength: 1 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease, delay: 0.65 }}
      />
      {/* nodes (small dark cards) */}
      {[{ x: 18, y: 26, d: 0.0 }, { x: 18, y: 72, d: 0.12 }].map((n, i) => (
        <motion.rect key={i} x={n.x} y={n.y} width={40} height={28} rx={4}
          fill="var(--studio-ground-2, #16150f)" stroke="var(--studio-line-strong, rgba(241,239,233,0.22))" strokeWidth={1}
          {...node(n.d)} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
      ))}
      <motion.rect x={150} y={48} width={48} height={32} rx={5}
        fill="var(--studio-ground-2, #16150f)" stroke="var(--studio-line-strong, rgba(241,239,233,0.22))" strokeWidth={1}
        {...node(0.28)} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
      {/* union nub flashing Signal */}
      <motion.circle cx={150} cy={64} r={3.5} fill="var(--signal)"
        initial={on ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
        animate={on ? { scale: [0, 1.6, 1], opacity: [0, 1, 1] } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease, delay: 1.25 }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
    </svg>
  );
}

export default EmptyCanvas;
