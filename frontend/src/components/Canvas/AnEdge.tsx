import React, { useEffect, useRef, useState } from 'react';
import { EdgeProps, getSmoothStepPath, Position } from 'reactflow';

/**
 * AnEdge — "Concrete & Signal" custom edge.
 * Step / right-angle routing, 1.5px hairline-strong → signal (2px) when
 * selected, a 3px union nub at the target endpoint that flashes signal once on
 * connect then settles, invalid-connection = error dashed.
 *
 * State is read from edge `data`:
 *   data.invalid  → dashed error
 *   data.running  → traveling-dash signal loader
 *   data.selected → handled by react-flow `selected` prop
 */
export interface AnEdgeData {
  invalid?: boolean;
  running?: boolean;
}

export const AnEdge: React.FC<EdgeProps<AnEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
  selected,
  data,
  markerEnd,
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0, // hard right angles
  });

  const pathRef = useRef<SVGPathElement>(null);
  const [fresh, setFresh] = useState(true);
  const [drawing, setDrawing] = useState(true);
  const [wireLen, setWireLen] = useState(600);

  // On mount (a fresh connection): measure the path, draw it, flash the union once.
  useEffect(() => {
    if (pathRef.current) {
      try {
        const len = pathRef.current.getTotalLength();
        if (len > 0) setWireLen(Math.ceil(len));
      } catch {
        /* getTotalLength can throw pre-layout; fall back to default */
      }
    }
    const t = window.setTimeout(() => {
      setDrawing(false);
      setFresh(false);
    }, 460); // a touch past --dur-3
    return () => window.clearTimeout(t);
  }, []);

  const invalid = !!data?.invalid;
  const running = !!data?.running;

  const pathClass = [
    'an-edge-path',
    selected ? 'is-selected' : '',
    invalid ? 'is-invalid' : '',
    running ? 'is-running' : '',
    drawing && !invalid && !running ? 'is-drawing' : '',
  ].filter(Boolean).join(' ');

  const unionClass = [
    'an-edge-union',
    selected ? 'is-selected' : '',
    running ? 'is-running' : '',
    fresh && !invalid ? 'is-fresh' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <path
        ref={pathRef}
        id={id}
        className={pathClass}
        d={edgePath}
        markerEnd={markerEnd}
        style={{ ['--an-wire-len' as any]: wireLen }}
      />
      {/* invisible wide hit area for easier selection */}
      <path d={edgePath} fill="none" stroke="transparent" strokeWidth={12} />
      {/* 3px union nub at the target endpoint */}
      {!invalid && (
        <rect
          className={unionClass}
          x={targetX - 1.5}
          y={targetY - 1.5}
          width={3}
          height={3}
          rx={1}
        />
      )}
    </>
  );
};

export default AnEdge;
