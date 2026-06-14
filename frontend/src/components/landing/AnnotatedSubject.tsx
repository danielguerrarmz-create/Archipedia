/**
 * AnnotatedSubject — the hero's rotating precedent diagrams. It cycles through
 * several famous SUBJECT projects (~6s each, crossfading); for each it pins the
 * project's formal moves to the precedents they resemble, tagged PAST or FUTURE.
 * One pin auto-highlights at a time so each mapping is readable; hovering any pin
 * (or the diagram) locks it and pauses the whole rotation so nothing slips away.
 *
 * Honors `motionOn`: reduced motion shows the first subject fully assembled.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HeroSubjectMap, PrecedentPin } from "../../data/heroPrecedentMap";
import { EASE_EMERGE, EASE_PRESS, useRotatingIndex } from "./landingShared";

const CARD_W = 168;
const SUBJECT_MS = 6500;

export function AnnotatedSubject({
  subjects,
  motionOn,
}: {
  subjects: HeroSubjectMap[];
  motionOn: boolean;
}) {
  const [paused, setPaused] = useState(false);
  const subjectIndex = useRotatingIndex(subjects.length, SUBJECT_MS, paused || !motionOn);
  const subject = subjects[subjectIndex];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        boxShadow: "var(--studio-cast)",
        background: "var(--studio-ground-deep)",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={subjectIndex}
          initial={motionOn ? { opacity: 0, scale: 1.025 } : false}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: motionOn ? 0.7 : 0, ease: EASE_PRESS }}
          style={{ position: "absolute", inset: 0 }}
        >
          <SubjectLayer subject={subject} motionOn={motionOn} active={!paused} />
        </motion.div>
      </AnimatePresence>

      {/* rotation indicator — which project, of how many */}
      {subjects.length > 1 && (
        <div style={{ position: "absolute", top: 14, right: 16, zIndex: 8, display: "flex", alignItems: "center", gap: 7 }}>
          {subjects.map((_, i) => (
            <span
              key={i}
              aria-hidden
              style={{
                width: i === subjectIndex ? 16 : 6,
                height: 4,
                borderRadius: 2,
                background: i === subjectIndex ? "var(--studio-ink)" : "rgba(241,239,233,0.3)",
                transition: "width var(--dur-2) var(--ease-press), background var(--dur-2) var(--ease-press)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubjectLayer({
  subject,
  motionOn,
  active,
}: {
  subject: HeroSubjectMap;
  motionOn: boolean;
  active: boolean;
}) {
  const [errored, setErrored] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  // cycle the highlighted pin while this subject is on screen
  const cycling = useRotatingIndex(subject.pins.length, 2600, hovered !== null || !active || !motionOn);
  const activePin = hovered ?? (motionOn ? cycling : -1);

  return (
    <>
      {!errored ? (
        <img
          src={subject.image}
          alt={subject.alt}
          loading="eager"
          decoding="async"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          onError={() => setErrored(true)}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <span className="mono-meta" style={{ color: "var(--studio-stone-dim)" }}>Image unavailable</span>
        </div>
      )}

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,.36) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 50%, rgba(0,0,0,.88) 100%)",
        }}
      />

      {subject.pins.map((pin, i) => (
        <Pin
          key={pin.id}
          pin={pin}
          index={i}
          active={activePin === i}
          motionOn={motionOn}
          onEnter={() => setHovered(i)}
          onLeave={() => setHovered(null)}
        />
      ))}

      <figcaption style={{ position: "absolute", left: 18, right: 18, bottom: 16, display: "flex", flexDirection: "column", gap: 3, zIndex: 5 }}>
        <span style={{ fontFamily: "var(--font-editorial)", fontOpticalSizing: "auto", fontWeight: 460, fontSize: 19, letterSpacing: "-0.01em", color: "var(--studio-ink)", lineHeight: 1.1 }}>
          {subject.project}
        </span>
        <span className="mono-meta" style={{ color: "var(--studio-ink)", fontSize: 11, letterSpacing: "0.04em" }}>
          {subject.architect} · {subject.year} · {subject.place} · SUBJECT
        </span>
      </figcaption>
    </>
  );
}

function Pin({
  pin,
  index,
  active,
  motionOn,
  onEnter,
  onLeave,
}: {
  pin: PrecedentPin;
  index: number;
  active: boolean;
  motionOn: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const side = pin.side;
  const cardStyle: React.CSSProperties =
    side === "right"
      ? { left: `calc(${pin.x}% + 16px)`, top: `${pin.y}%`, transform: "translateY(-50%)" }
      : { right: `calc(${100 - pin.x}% + 16px)`, top: `${pin.y}%`, transform: "translateY(-50%)" };
  const baseDelay = 0.35 + index * 0.16;
  const eraLabel = pin.source.era === "past" ? "PAST" : "FUTURE";

  return (
    <>
      <motion.div
        aria-hidden
        initial={motionOn ? { scaleX: 0, opacity: 0 } : false}
        animate={{ scaleX: 1, opacity: active ? 1 : 0.4 }}
        transition={{ duration: 0.3, ease: EASE_PRESS, delay: motionOn ? baseDelay : 0 }}
        style={{
          position: "absolute",
          top: `${pin.y}%`,
          [side === "right" ? "left" : "right"]: `${side === "right" ? pin.x : 100 - pin.x}%`,
          width: 16,
          height: 1,
          transformOrigin: side === "right" ? "left center" : "right center",
          background: active ? "var(--studio-ink)" : "var(--studio-line-strong)",
          zIndex: 4,
        }}
      />

      <motion.button
        type="button"
        aria-label={`${pin.component} — resembles ${pin.source.project}`}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter}
        onBlur={onLeave}
        initial={motionOn ? { scale: 0, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.32, ease: EASE_PRESS, delay: motionOn ? baseDelay - 0.05 : 0 }}
        style={{
          position: "absolute",
          left: `${pin.x}%`,
          top: `${pin.y}%`,
          transform: "translate(-50%, -50%)",
          width: 14,
          height: 14,
          padding: 0,
          borderRadius: "var(--radius-pill)",
          border: "none",
          cursor: "pointer",
          background: "transparent",
          zIndex: 6,
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            background: active ? "var(--studio-ink)" : "rgba(241,239,233,0.55)",
            boxShadow: active ? "0 0 0 4px rgba(241,239,233,0.18)" : "0 0 0 2px rgba(0,0,0,0.35)",
            transition: "background var(--dur-2) var(--ease-press), box-shadow var(--dur-2) var(--ease-press)",
          }}
        />
        {active && motionOn && (
          <motion.span
            aria-hidden
            style={{ position: "absolute", inset: 0, borderRadius: "inherit", border: "1px solid var(--studio-ink)" }}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 1.8, ease: "easeOut", repeat: Infinity }}
          />
        )}
      </motion.button>

      <motion.div
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        initial={motionOn ? { opacity: 0, x: side === "right" ? -6 : 6 } : false}
        animate={{ opacity: active ? 1 : 0.5, x: 0 }}
        transition={{ duration: 0.34, ease: EASE_EMERGE, delay: motionOn ? baseDelay + 0.05 : 0 }}
        style={{
          position: "absolute",
          width: CARD_W,
          ...cardStyle,
          display: "flex",
          gap: 9,
          padding: 8,
          borderRadius: "var(--radius-md)",
          background: "rgba(18,16,13,0.92)",
          boxShadow: active
            ? "0 8px 24px -8px rgba(0,0,0,0.6), inset 0 0 0 1px var(--studio-line-strong)"
            : "0 4px 12px -6px rgba(0,0,0,0.5), inset 0 0 0 1px var(--studio-line)",
          zIndex: active ? 7 : 4,
        }}
      >
        <img
          src={pin.source.thumb}
          alt={pin.source.project}
          loading="lazy"
          decoding="async"
          style={{ width: 40, height: 48, objectFit: "cover", borderRadius: 2, flexShrink: 0, background: "var(--studio-ground-deep)" }}
        />
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <span className="mono-caps" style={{ fontSize: 8.5, letterSpacing: "0.1em", color: "var(--studio-stone)" }}>
            {pin.component}
          </span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 550, lineHeight: 1.15, color: "var(--studio-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {pin.source.project}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span className="mono-meta" style={{ fontSize: 9, letterSpacing: "0.02em", color: "var(--studio-stone)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {pin.source.architect} · {pin.source.year}
            </span>
            <span
              style={{
                flexShrink: 0,
                fontFamily: "var(--font-mono)",
                fontSize: 7.5,
                letterSpacing: "0.1em",
                color: pin.source.era === "past" ? "var(--studio-stone)" : "var(--signal)",
                border: `1px solid ${pin.source.era === "past" ? "var(--studio-line-strong)" : "var(--signal)"}`,
                borderRadius: 2,
                padding: "1px 3px",
                lineHeight: 1,
              }}
            >
              {eraLabel}
            </span>
          </span>
        </div>
      </motion.div>
    </>
  );
}

export default AnnotatedSubject;
