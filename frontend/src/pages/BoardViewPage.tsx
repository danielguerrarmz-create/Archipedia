import type { CSSProperties } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useBoardStore, BoardBlock, ReferenceBlock, TextBlock, DividerBlock } from '../stores/boardStore';
import { Edit3, Download, Share2, ExternalLink, Calendar } from 'lucide-react';
import { Footer } from '../components/Footer';
import { AppHeader } from '../components/AppHeader';

const boardGhostBtn: CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '9px 16px',
  background: 'var(--concrete-100)',
  boxShadow: 'var(--emboss)',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  color: 'var(--ink-700)',
};

const boardSignalBtn: CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '9px 16px',
  background: 'var(--signal)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  fontWeight: 500,
  boxShadow: 'var(--emboss)',
};

export function BoardViewPage() {
  const params = useParams<{ id: string }>();
  const boardId = params.id || '';
  const [, setLocation] = useLocation();
  
  const board = useBoardStore((state) => state.getBoardById(boardId));

  if (!board) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '16px' }}>
            Board Not Found
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ink-500)', marginBottom: '24px' }}>
            This board may have been deleted or the link is incorrect.
          </p>
          <Link href="/search">
            <button style={{
              fontFamily: 'var(--font-display)',
              backgroundColor: 'var(--signal)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
            }}>
              Back to Search
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const referenceBlocks = board.blocks.filter((b): b is ReferenceBlock => b.type === 'reference');
  const formattedDate = new Date(board.updated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--concrete-50)' }}>
      {/* Canonical dark studio header */}
      <AppHeader active="boards" />

      {/* Board title band — concrete, with the board's actions */}
      <div
        style={{
          position: 'sticky',
          top: 60,
          zIndex: 90,
          background: 'var(--concrete-0)',
          borderBottom: '1px solid var(--hairline)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '16px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, margin: 0, letterSpacing: '-0.02em', color: 'var(--ink-900)' }}>
              {board.title}
            </h1>
            {board.subtitle && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ink-500)', margin: '2px 0 0' }}>
                {board.subtitle}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => setLocation(`/boards/${boardId}/edit`)} style={boardGhostBtn}>
              <Edit3 size={16} /> Edit
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/b/${board.share_token}`);
                alert('Share link copied to clipboard!');
              }}
              style={boardGhostBtn}
            >
              <Share2 size={16} /> Share
            </button>
            {/* Export PDF — the one Signal action on this board */}
            <button onClick={() => alert('PDF export coming soon!')} style={boardSignalBtn}>
              <Download size={16} /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '48px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Board Description */}
          {board.description && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                lineHeight: 1.6,
                color: 'var(--ink-700)',
                maxWidth: '720px',
                marginBottom: '48px',
              }}
            >
              {board.description}
            </p>
          )}

          {/* Blocks Grid */}
          {board.blocks.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 40px',
                background: 'var(--concrete-100)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--hairline-strong)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '16px',
                  color: 'var(--ink-500)',
                  marginBottom: '16px',
                }}
              >
                This board is empty.
              </p>
              <button
                onClick={() => setLocation(`/boards/${boardId}/edit`)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  padding: '12px 24px',
                  backgroundColor: 'var(--signal)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              >
                Start Adding Content
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {board.blocks
                .sort((a, b) => a.position - b.position)
                .map((block) => (
                  <BlockRenderer key={block.id} block={block} />
                ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px',
          borderTop: '1px solid var(--hairline)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--ink-400)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Calendar size={14} />
              Last updated {formattedDate}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--ink-400)',
              }}
            >
              {referenceBlocks.length} reference{referenceBlocks.length !== 1 ? 's' : ''}
            </span>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '12px',
              color: 'var(--ink-300)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Created with Archipedia
          </span>
        </div>
      </div>

      <Footer variant="minimal" logoLink="/" />
    </div>
  );
}

// ============ Block Renderers ============

function BlockRenderer({ block }: { block: BoardBlock }) {
  switch (block.type) {
    case 'reference':
      return <ReferenceBlockView block={block} />;
    case 'text':
      return <TextBlockView block={block} />;
    case 'divider':
      return <DividerBlockView block={block} />;
    default:
      return null;
  }
}

function ReferenceBlockView({ block }: { block: ReferenceBlock }) {
  const { data } = block;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        gap: '24px',
        background: 'var(--concrete-0)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--raised)',
        border: '1px solid var(--hairline)',
      }}
    >
      {/* Image */}
      <Link href={`/project/${data.project_id}`}>
        <div
          style={{
            position: 'relative',
            paddingBottom: '66.67%',
            background: 'var(--concrete-sunken)',
            cursor: 'pointer',
          }}
        >
          <img
            src={data.thumb_url_snapshot}
            alt={data.title_snapshot}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      </Link>

      {/* Content */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <Link href={`/project/${data.project_id}`}>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 600,
              margin: 0,
              marginBottom: '8px',
              cursor: 'pointer',
            }}
          >
            {data.title_snapshot}
          </h3>
        </Link>

        {data.architect_snapshot && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--ink-500)',
              margin: 0,
              marginBottom: '4px',
            }}
          >
            {data.architect_snapshot}
          </p>
        )}

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          {data.location_snapshot && (
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--ink-400)',
              }}
            >
              {data.location_snapshot}
            </span>
          )}
          {data.year_snapshot && (
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--ink-400)',
              }}
            >
              {data.year_snapshot}
            </span>
          )}
        </div>

        {data.caption && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--ink-700)',
              fontStyle: 'italic',
              flex: 1,
            }}
          >
            "{data.caption}"
          </p>
        )}

        {data.tags && data.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 'auto' }}>
            {data.tags.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  padding: '4px 10px',
                  background: 'var(--concrete-sunken)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--ink-500)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <Link href={`/project/${data.project_id}`}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '16px',
              padding: '8px 0',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--signal)',
            }}
          >
            <ExternalLink size={14} />
            View Project
          </button>
        </Link>
      </div>
    </div>
  );
}

function TextBlockView({ block }: { block: TextBlock }) {
  const { data } = block;

  const styles: Record<string, React.CSSProperties> = {
    h1: {
      fontFamily: 'var(--font-display)',
      fontSize: '32px',
      fontWeight: 600,
      margin: 0,
      paddingTop: '24px',
    },
    h2: {
      fontFamily: 'var(--font-display)',
      fontSize: '20px',
      fontWeight: 600,
      margin: 0,
      paddingTop: '16px',
      paddingBottom: '8px',
      borderBottom: '1px solid var(--hairline)',
    },
    body: {
      fontFamily: 'var(--font-body)',
      fontSize: '16px',
      lineHeight: 1.7,
      color: 'var(--ink-700)',
      maxWidth: '720px',
    },
    quote: {
      fontFamily: 'var(--font-body)',
      fontSize: '18px',
      lineHeight: 1.6,
      fontStyle: 'italic',
      color: 'var(--ink-500)',
      borderLeft: '3px solid var(--signal)',
      paddingLeft: '20px',
      marginLeft: '0',
    },
  };

  return (
    <div style={styles[data.style]}>
      {data.text}
    </div>
  );
}

function DividerBlockView({ block }: { block: DividerBlock }) {
  const { data } = block;

  if (data.variant === 'line') {
    return (
      <div
        style={{
          height: '1px',
          background: 'var(--hairline-strong)',
          margin: '16px 0',
        }}
      />
    );
  }

  if (data.variant === 'space-sm') {
    return <div style={{ height: '24px' }} />;
  }

  if (data.variant === 'space-lg') {
    return <div style={{ height: '48px' }} />;
  }

  return null;
}

