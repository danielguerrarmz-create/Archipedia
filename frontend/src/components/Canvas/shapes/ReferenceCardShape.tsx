import { useState, useEffect } from 'react';
import {
  TLBaseShape,
  ShapeUtil,
  HTMLContainer,
  Rectangle2d,
  TLOnResizeHandler,
  resizeBox,
} from 'tldraw';

// Shape ids that have already played the stamp-to-board animation.
const STAMPED = new Set<string>();

/** Plays the stamp-press animation once, on first mount of a card. */
function useStampOnce(id: string): boolean {
  const [stamping, setStamping] = useState(() => !STAMPED.has(id));
  useEffect(() => {
    if (STAMPED.has(id)) return;
    STAMPED.add(id);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setStamping(false); return; }
    const t = window.setTimeout(() => setStamping(false), 240); // --dur-2
    return () => window.clearTimeout(t);
  }, [id]);
  return stamping;
}

// Reference card display toggles
export interface ReferenceCardDisplayToggles {
  showTitle: boolean;
  showMeta: boolean;
  showCaption: boolean;
}

// Reference card props (snapshot model)
export interface ReferenceCardShapeProps {
  // Core identity
  project_id: string;
  image_id: string | null;
  
  // Snapshot data (won't break if corpus changes)
  thumb_url_snapshot: string;
  image_url_snapshot: string | null;
  title_snapshot: string;
  architect_snapshot: string | null;
  location_snapshot: string | null;
  year_snapshot: number | null;
  source_url_snapshot: string | null;
  
  // User editable
  caption: string;
  
  // Display toggles
  showTitle: boolean;
  showMeta: boolean;
  showCaption: boolean;
  
  // Size (min 220x180, default 320x260)
  w: number;
  h: number;
}

// Reference card shape type
export type ReferenceCardShape = TLBaseShape<'reference-card', ReferenceCardShapeProps>;

// Min/default sizes
const MIN_WIDTH = 220;
const MIN_HEIGHT = 180;
const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 260;

// Reference card shape util
export class ReferenceCardShapeUtil extends ShapeUtil<ReferenceCardShape> {
  static override type = 'reference-card' as const;
  static override props = {
    project_id: { type: 'string' as const },
    image_id: { type: 'string' as const },
    thumb_url_snapshot: { type: 'string' as const },
    image_url_snapshot: { type: 'string' as const },
    title_snapshot: { type: 'string' as const },
    architect_snapshot: { type: 'string' as const },
    location_snapshot: { type: 'string' as const },
    year_snapshot: { type: 'number' as const },
    source_url_snapshot: { type: 'string' as const },
    caption: { type: 'string' as const },
    showTitle: { type: 'boolean' as const },
    showMeta: { type: 'boolean' as const },
    showCaption: { type: 'boolean' as const },
    w: { type: 'number' as const },
    h: { type: 'number' as const },
  };

  getDefaultProps(): ReferenceCardShapeProps {
    return {
      project_id: '',
      image_id: null,
      thumb_url_snapshot: '',
      image_url_snapshot: null,
      title_snapshot: 'Untitled',
      architect_snapshot: null,
      location_snapshot: null,
      year_snapshot: null,
      source_url_snapshot: null,
      caption: '',
      showTitle: true,
      showMeta: true,
      showCaption: true,
      w: DEFAULT_WIDTH,
      h: DEFAULT_HEIGHT,
    };
  }

  getGeometry(shape: ReferenceCardShape): Rectangle2d {
    return new Rectangle2d({
      width: Math.max(shape.props.w, MIN_WIDTH),
      height: Math.max(shape.props.h, MIN_HEIGHT),
      isFilled: true,
    });
  }

  component(shape: ReferenceCardShape) {
    return <ReferenceCardBody shape={shape} />;
  }

  indicator(shape: ReferenceCardShape) {
    const w = Math.max(shape.props.w, MIN_WIDTH);
    const h = Math.max(shape.props.h, MIN_HEIGHT);
    
    return (
      <rect
        width={w}
        height={h}
        rx={8}
        ry={8}
      />
    );
  }

  override onResize: TLOnResizeHandler<ReferenceCardShape> = (shape, info) => {
    const result = resizeBox(shape, info);
    // Enforce minimum size
    if (result.props) {
      result.props.w = Math.max(result.props.w ?? shape.props.w, MIN_WIDTH);
      result.props.h = Math.max(result.props.h ?? shape.props.h, MIN_HEIGHT);
    }
    return result;
  };

  override canResize = () => true;
  override canBind = () => false;
}

/** The card body — node language, with a one-time stamp-to-board animation. */
function ReferenceCardBody({ shape }: { shape: ReferenceCardShape }) {
  const { props } = shape;
  const w = Math.max(props.w, MIN_WIDTH);
  const h = Math.max(props.h, MIN_HEIGHT);
  const metaHeight =
    (props.showTitle ? 24 : 0) +
    (props.showMeta ? 20 : 0) +
    (props.showCaption && props.caption ? 24 : 0);
  const imageHeight = Math.max(h - metaHeight - 16, h * 0.5);
  const stamping = useStampOnce(shape.id);

  return (
    <HTMLContainer id={shape.id} style={{ width: w, height: h, pointerEvents: 'all' }}>
      {/* Node language: debossed seat holding an embossed body */}
      <div
        className={`an-board-card${stamping ? ' is-stamping' : ''}`}
        style={{
          width: '100%',
          height: '100%',
          background: 'var(--concrete-sunken)',
          boxShadow: 'var(--deboss)',
          borderRadius: 'calc(var(--radius-md) + 2px)',
          padding: 3,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'var(--node-bg)',
            boxShadow: 'var(--emboss)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Image in a debossed well */}
          <div
            style={{
              width: '100%',
              height: imageHeight,
              background: 'var(--concrete-sunken)',
              boxShadow: 'inset 0 1px 2px rgba(21,22,26,0.18)',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {props.thumb_url_snapshot && (
              <img
                src={props.thumb_url_snapshot}
                alt={props.title_snapshot}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                draggable={false}
              />
            )}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 3, minHeight: 0 }}>
            {props.showTitle && (
              <div
                style={{
                  fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.01em', color: 'var(--ink-900)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {props.title_snapshot}
              </div>
            )}
            {props.showMeta && (
              <div
                style={{
                  fontSize: 11, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '0.02em', color: 'var(--ink-500)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {[props.architect_snapshot, props.location_snapshot, props.year_snapshot].filter(Boolean).join(' · ')}
              </div>
            )}
            {props.showCaption && props.caption && (
              <div
                style={{
                  fontSize: 10, fontFamily: 'var(--font-body)', fontStyle: 'italic',
                  color: 'var(--ink-400)', overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap', marginTop: 'auto',
                }}
              >
                "{props.caption}"
              </div>
            )}
          </div>
        </div>
      </div>
    </HTMLContainer>
  );
}

// Create reference card props from project data
export function createReferenceCardProps(data: {
  project_id: string;
  image_id?: string;
  thumb_url: string;
  image_url?: string;
  title: string;
  architect?: string;
  location?: string;
  year?: number;
}): Partial<ReferenceCardShapeProps> {
  return {
    project_id: data.project_id,
    image_id: data.image_id || null,
    thumb_url_snapshot: data.thumb_url,
    image_url_snapshot: data.image_url || null,
    title_snapshot: data.title,
    architect_snapshot: data.architect || null,
    location_snapshot: data.location || null,
    year_snapshot: data.year || null,
    showTitle: true,
    showMeta: true,
    showCaption: true,
    w: DEFAULT_WIDTH,
    h: DEFAULT_HEIGHT,
  };
}

