import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PinnedCard } from "../brand/PinnedCard";
import { hash, metaLine } from "../data";
import type { Project } from "../types";

/**
 * A pinned project card that is also a button. Rotation is seeded from the
 * project id so the wall reads hand-tacked but never reshuffles on re-render.
 * Hover straightens the card, like lifting it off the wall.
 */
export function PinTile({
  project,
  onOpen,
  badge,
  footer,
  aspect = 1.33,
  index = 0,
  maxRot = 3.2,
  pinSize = 30,
  eager,
  image,
  dataPin,
}: {
  project: Project;
  onOpen: (id: string) => void;
  badge?: ReactNode;
  footer?: ReactNode;
  aspect?: number;
  index?: number;
  maxRot?: number;
  pinSize?: number;
  eager?: boolean;
  /** Override the photo, e.g. the neighbour image that actually matched. */
  image?: string;
  dataPin?: string;
}) {
  const h = hash(project.id);
  const rot = ((h % 1000) / 1000 - 0.5) * 2 * maxRot;
  const pinX = 38 + (h % 25);
  const tilt = -10 - (h % 16);
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="pin-tile"
      data-pin={dataPin}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: Math.min(index, 12) * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="pin-tile__rot" style={{ ["--rot" as string]: `${rot.toFixed(2)}deg` }}>
      <button
        type="button"
        className="pin-tile__hit"
        onClick={() => onOpen(project.id)}
        aria-label={`${project.title}, ${project.architect}. Open close-up`}
      >
        <PinnedCard
          thumb={image ?? project.image}
          title={project.title}
          meta={metaLine(project)}
          aspect={aspect}
          pinXPct={pinX}
          tilt={tilt}
          pinSize={pinSize}
          seed={h % 97}
          badge={badge}
          eager={eager}
        />
      </button>
      </div>
      {footer && <div className="pin-tile__footer">{footer}</div>}
    </motion.div>
  );
}
