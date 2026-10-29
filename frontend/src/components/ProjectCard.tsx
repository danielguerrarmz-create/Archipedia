import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState } from "react";
import { Link } from "wouter";

/*
 * ProjectCard — Concrete & Signal.
 * concrete-0, radius-lg, raised. Image 4:3. Hover lift + image scale.
 * Title = display; architect = mono-caps; meta = mono-meta tabular.
 * Keywords = chip style (concrete-100 + hairline).
 */

interface ProjectCardProps {
  id: string;
  name: string;
  architect: string;
  location: string;
  year: string;
  matchPercentage?: number;
  imageUrl: string;
  keywords?: string[];
  onCardClick?: (id: string) => void;
}

export function ProjectCard({
  id,
  name,
  architect,
  location,
  year,
  matchPercentage,
  imageUrl,
  keywords = [],
  onCardClick,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={`/project/${id}`}>
      <button
        style={{
          width: "100%",
          background: "var(--concrete-0)",
          borderRadius: "var(--radius-lg)",
          boxShadow: isHovered
            ? "var(--raised), 0 8px 24px rgba(21,22,26,0.10)"
            : "var(--raised)",
          border: "none",
          cursor: "pointer",
          overflow: "hidden",
          textAlign: "left",
          transform: isHovered ? "translateY(-2px)" : "none",
          transition:
            "box-shadow var(--dur-2) var(--ease-emerge), transform var(--dur-2) var(--ease-emerge)",
          padding: 0,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onCardClick?.(id)}
      >
        {/* Image 4:3 */}
        <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", overflow: "hidden" }}>
          <ImageWithFallback
            src={imageUrl}
            alt={name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: isHovered ? "scale(1.03)" : "scale(1)",
              transition: "transform var(--dur-2) var(--ease-emerge)",
            }}
          />

          {matchPercentage != null && (
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                padding: "2px 8px",
                background: "var(--concrete-0)",
                boxShadow: "var(--emboss)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <span
                className="mono-meta"
                style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink-700)" }}
              >
                {matchPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: "12px 16px 14px" }}>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--ink-900)",
              letterSpacing: "-0.01em",
              lineHeight: 1.25,
              margin: "0 0 3px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </h3>
          <p
            className="mono-caps"
            style={{ margin: "0 0 6px", fontSize: 10 }}
          >
            {architect}
          </p>

          {keywords.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
              {keywords.slice(0, 3).map((kw, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    padding: "2px 8px",
                    background: "var(--concrete-100)",
                    borderRadius: "var(--radius-sm)",
                    boxShadow: "0 0 0 1px var(--hairline)",
                    color: "var(--ink-700)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className="mono-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
              {location}
            </span>
            <span style={{ color: "var(--ink-300)" }}>·</span>
            <span className="mono-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
              {year}
            </span>
          </div>
        </div>
      </button>
    </Link>
  );
}
