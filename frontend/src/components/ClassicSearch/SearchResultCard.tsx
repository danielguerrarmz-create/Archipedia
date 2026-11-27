import React, { useState, useCallback } from 'react';
import { Bookmark, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { MatchReasonBadge } from './MatchReasonBadge';
import { useSelectionStore } from '../../stores/selectionStore';
import { Node } from '../motif/Node';

/*
 * SearchResultCard — Concrete & Signal.
 * concrete-0 card, radius-lg, raised (no blur).
 * Image 3:2; hover lifts via raised shadow + translateY(-2px) + image scale 1.03.
 * Selected = 2px signal ring (Node-square checkbox lit, NOT terracotta).
 * Title = display h3 sentence-case; architect = body-sm ink-700;
 * location·year = mono-meta tabular; tags = concrete-100 chips.
 * Hover actions (Save / Search-like-this) = icon-buttons (emboss), not glass circles.
 */

export interface ProjectImage {
  image_id: string;
  thumb_url: string;
  image_url: string;
}

export interface SearchResultData {
  project_id: string;
  project_title: string;
  architect: string;
  location_display: string;
  year?: number;
  image_id: string;
  thumb_url: string;
  image_url: string;
  images?: ProjectImage[];
  score: number;
  match_reason?: string;
  matched_attrs?: string[];
  badges?: {
    typology?: string[];
    country?: string[];
    climate_bin?: string[];
  };
}

interface SearchResultCardProps {
  result: SearchResultData;
  index?: number;
  onOpen: (result: SearchResultData, currentImageIndex?: number) => void;
  onSave: (result: SearchResultData, currentImage?: ProjectImage) => void;
  onSearchLikeThis: (result: SearchResultData, currentImage?: ProjectImage) => void;
  onShiftSelect?: (fromIndex: number, toIndex: number) => void;
  isSaved?: boolean;
  enableSelection?: boolean;
}

export function SearchResultCard({
  result,
  index = 0,
  onOpen,
  onSave,
  onSearchLikeThis,
  onShiftSelect,
  isSaved = false,
  enableSelection = true,
}: SearchResultCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { isSelected, toggleSelection, isSelectionMode, lastSelectedIndex, setLastSelectedIndex } =
    useSelectionStore();
  const isProjectSelected = isSelected(result.project_id);

  const handleCheckboxClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (e.shiftKey && lastSelectedIndex !== null && onShiftSelect) {
        onShiftSelect(lastSelectedIndex, index);
      } else {
        toggleSelection(result);
        setLastSelectedIndex(index);
      }
    },
    [result, index, lastSelectedIndex, toggleSelection, setLastSelectedIndex, onShiftSelect],
  );

  const images: ProjectImage[] =
    result.images && result.images.length > 0
      ? result.images
      : [{ image_id: result.image_id, thumb_url: result.thumb_url, image_url: result.image_url }];

  const currentImage = images[currentImageIndex];
  const hasMultipleImages = images.length > 1;

  const handlePrevImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      setImageError(false);
    },
    [images.length],
  );

  const handleNextImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
      setImageError(false);
    },
    [images.length],
  );

  const badges = [
    ...(result.badges?.typology || []),
    ...(result.badges?.country || []),
    ...(result.badges?.climate_bin || []),
  ].slice(0, 3);

  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--concrete-0)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: isProjectSelected
          ? `0 0 0 2px var(--signal), var(--raised)`
          : isHovered
          ? `var(--raised), 0 8px 24px rgba(21,22,26,0.10)`
          : 'var(--raised)',
        overflow: 'hidden',
        transition: 'box-shadow var(--dur-2) var(--ease-emerge), transform var(--dur-2) var(--ease-emerge)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpen(result, currentImageIndex)}
    >
      {/* Image — 3:2 ratio */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '66.67%', overflow: 'hidden' }}>
        {!imageError ? (
          <img
            src={currentImage.thumb_url || currentImage.image_url}
            alt={result.project_title}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/uri-list', currentImage.thumb_url || currentImage.image_url);
              e.dataTransfer.setData(
                'application/x-archipedia-image',
                JSON.stringify({
                  url: currentImage.thumb_url || currentImage.image_url,
                  image_id: currentImage.image_id,
                  project_id: result.project_id,
                  project_title: result.project_title,
                }),
              );
              e.dataTransfer.effectAllowed = 'copy';
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform var(--dur-2) var(--ease-emerge)',
              transform: isHovered ? 'scale(1.03)' : 'scale(1)',
              cursor: 'grab',
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--concrete-100)',
            }}
          >
            <span className="mono-meta" style={{ color: 'var(--ink-400)' }}>
              Image unavailable
            </span>
          </div>
        )}

        {/* Multi-image nav arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrevImage}
              style={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '4px',
                background: 'var(--concrete-0)',
                boxShadow: 'var(--emboss)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.5,
                transition: 'opacity var(--dur-1)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.5'; }}
            >
              <ChevronLeft size={18} style={{ color: 'var(--ink-700)' }} />
            </button>
            <button
              onClick={handleNextImage}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '4px',
                background: 'var(--concrete-0)',
                boxShadow: 'var(--emboss)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.5,
                transition: 'opacity var(--dur-1)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.5'; }}
            >
              <ChevronRight size={18} style={{ color: 'var(--ink-700)' }} />
            </button>
          </>
        )}

        {/* Image indicator dots (node squares) */}
        {hasMultipleImages && (
          <div
            style={{
              position: 'absolute',
              bottom: 36,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 4,
            }}
          >
            {images.map((_, idx) => (
              <Node
                key={idx}
                size={5}
                filled={idx === currentImageIndex}
                color={idx === currentImageIndex ? 'var(--concrete-0)' : 'rgba(255,255,255,0.45)'}
              />
            ))}
          </div>
        )}

        {/* Selection checkbox (Node-square) */}
        {enableSelection && (isHovered || isSelectionMode || isProjectSelected) && (
          <button
            onClick={handleCheckboxClick}
            title={isProjectSelected ? 'Deselect' : 'Select for export'}
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              width: 24,
              height: 24,
              borderRadius: 'var(--radius-sm)',
              background: isProjectSelected ? 'var(--signal)' : 'var(--concrete-0)',
              boxShadow: 'var(--emboss)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            {isProjectSelected && (
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden>
                <path d="M1 4.5L4.5 8L11 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )}

        {/* Hover actions — icon buttons, NOT glass circles */}
        {isHovered && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              gap: 6,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onSave(result, currentImage)}
              title="Save to board"
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: isSaved ? 'var(--signal)' : 'var(--concrete-0)',
                boxShadow: 'var(--emboss)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bookmark
                size={14}
                style={{
                  color: isSaved ? '#fff' : 'var(--ink-700)',
                  fill: isSaved ? '#fff' : 'none',
                }}
              />
            </button>
            <button
              onClick={() => onSearchLikeThis(result, currentImage)}
              title="Search like this"
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--concrete-0)',
                boxShadow: 'var(--emboss)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Search size={14} style={{ color: 'var(--ink-700)' }} />
            </button>
          </div>
        )}

        {/* Match score badge — positioned bottom-left */}
        <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
          <MatchReasonBadge
            score={result.score}
            reason={result.match_reason}
            typology={result.badges?.typology?.[0]}
            country={result.badges?.country?.[0]}
            matchedAttrs={result.matched_attrs}
            noSignal
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '12px 16px 14px' }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--ink-900)',
            margin: 0,
            marginBottom: 3,
            lineHeight: 1.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.01em',
          }}
        >
          {result.project_title}
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'var(--ink-700)',
            margin: 0,
            marginBottom: 6,
          }}
        >
          {result.architect}
        </p>
        <p
          className="mono-meta"
          style={{
            margin: 0,
            marginBottom: badges.length > 0 ? 8 : 0,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {result.location_display}
          {result.year && (
            <>
              <span style={{ margin: '0 5px', opacity: 0.4 }}>·</span>
              {result.year}
            </>
          )}
        </p>

        {/* Chips */}
        {badges.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {badges.map((badge, idx) => (
              <span
                key={idx}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  padding: '2px 8px',
                  background: 'var(--concrete-100)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 0 0 1px var(--hairline)',
                  color: 'var(--ink-700)',
                  whiteSpace: 'nowrap',
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
