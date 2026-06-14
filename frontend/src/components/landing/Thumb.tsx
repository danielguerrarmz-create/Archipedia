/**
 * Thumb — a single framed precedent photo with hardened image hygiene:
 * explicit width/height (no CLS), inset hairline frame, alt text, and an
 * onError fallback to a concrete "Image unavailable" plate. Used everywhere a
 * real building image lands on the landing page.
 */
import { useState, type CSSProperties } from "react";

export interface ThumbProps {
  src: string;
  alt: string;
  /** Intrinsic aspect handled by the wrapper; these size the box. */
  width?: number | string;
  height?: number | string;
  aspect?: number; // width/height ratio for a responsive box (e.g. 1.5 = 3:2)
  eager?: boolean;
  radius?: string;
  scale?: number; // hover scale applied to the <img> only
  style?: CSSProperties;
  imgStyle?: CSSProperties;
}

export function Thumb({
  src,
  alt,
  width = "100%",
  height,
  aspect = 1.5,
  eager = false,
  radius = "var(--radius-md)",
  scale = 1,
  style,
  imgStyle,
}: ThumbProps) {
  const [errored, setErrored] = useState(false);

  const box: CSSProperties = {
    position: "relative",
    width,
    height: height ?? undefined,
    aspectRatio: height ? undefined : String(aspect),
    overflow: "hidden",
    borderRadius: radius,
    background: "var(--concrete-100)",
    boxShadow: "inset 0 0 0 1px var(--hairline)",
    ...style,
  };

  return (
    <div style={box}>
      {!errored ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          // @ts-expect-error fetchpriority is valid HTML, not yet in React types
          fetchpriority={eager ? "high" : "auto"}
          decoding="async"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
            transition: "transform var(--dur-2) var(--ease-emerge)",
            ...imgStyle,
          }}
          onError={() => setErrored(true)}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--concrete-100)",
          }}
        >
          <span className="mono-meta" style={{ color: "var(--ink-400)" }}>
            Image unavailable
          </span>
        </div>
      )}
    </div>
  );
}

export default Thumb;
