/**
 * landingShared — tokens, easings, helpers and motion variants shared across the
 * Archipedia landing sections. Keeps the section components thin and keeps the
 * reduced-motion contract in one place (every consumer takes `motionOn`).
 */
import { useEffect, useRef, useState } from "react";
import {
  animate,
  useInView,
  type Variants,
  type Transition,
} from "framer-motion";

/* ── Eases (mirror tokens.css) ─────────────────────────────────────────── */
export const EASE_PRESS: [number, number, number, number] = [0.2, 0.8, 0.2, 1];
export const EASE_EMERGE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const DUR = { d1: 0.12, d2: 0.22, d3: 0.42 };

/* The R2 base — used to derive a decorative atmosphere image if needed. */
export const R2_BASE = "https://pub-12350662edb244568152a5b72ed1dbb8.r2.dev";

/**
 * sanitizeTitle — the frozen manifest carries mojibake (’ smart quotes, odd
 * casing). Normalize curly punctuation and collapse whitespace for display.
 * Title-case is left as-authored; we only repair characters, not meaning.
 */
export function sanitizeTitle(raw: string): string {
  if (!raw) return "Untitled project";
  return raw
    .replace(/’|‘|â€™|â€˜/g, "'")
    .replace(/“|”|â€œ|â€/g, '"')
    .replace(/–|—|â€“|â€”/g, "-")
    .replace(/�/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncate a long manifest headline for compact captions. */
export function clampWords(s: string, max = 6): string {
  const words = sanitizeTitle(s).split(" ");
  if (words.length <= max) return words.join(" ");
  return words.slice(0, max).join(" ") + "…";
}

export function safeArchitect(a: string): string {
  const t = sanitizeTitle(a);
  return t.length ? t : "Architect unrecorded";
}

/* ── Scroll-reveal container + child variants ──────────────────────────── */
export function makeReveal(motionOn: boolean): {
  container: Variants;
  child: Variants;
} {
  if (!motionOn) {
    return {
      container: { hidden: {}, show: {} },
      child: { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } },
    };
  }
  return {
    container: {
      hidden: {},
      show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
    },
    child: {
      hidden: { opacity: 0, y: 16 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: DUR.d3, ease: EASE_EMERGE },
      },
    },
  };
}

/** Standard once-only in-view config (enter from -15% margin). */
export const IN_VIEW_ONCE = { once: true, margin: "-15% 0px -15% 0px" } as const;

/**
 * useCountUp — count a motion value to `target` on enter, formatted with commas.
 * Honors reduced motion (renders the final value immediately).
 */
export function useCountUp(target: number, motionOn: boolean, durationMs = 1000) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, IN_VIEW_ONCE);
  const [display, setDisplay] = useState(motionOn ? 0 : target);

  useEffect(() => {
    if (!inView) return;
    if (!motionOn) {
      setDisplay(target);
      return;
    }
    const controls = animate(0, target, {
      duration: durationMs / 1000,
      ease: EASE_PRESS,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, motionOn, target, durationMs]);

  return { ref, value: display.toLocaleString("en-US") };
}

/* ── Transition presets ────────────────────────────────────────────────── */
export const settle: Transition = { duration: DUR.d2, ease: EASE_PRESS };
export const emerge: Transition = { duration: DUR.d3, ease: EASE_EMERGE };

/**
 * SEARCH_EXAMPLES — the rotating hero placeholder pool. Each line is a real,
 * specific precedent query that shows the engine's range: typology + material +
 * climate + structure, and a couple of named-architect probes. Kept concrete so
 * a first-time visitor immediately understands what they can ask for.
 */
export const SEARCH_EXAMPLES: string[] = [
  "Brutalist civic hall with deep brise-soleil",
  "Brick warehouse reborn as a public library",
  "Timber gridshell roof over a market hall",
  "House cantilevered off a steep forest slope",
  "Courtyard housing behind perforated screens",
  "Tropical museum shaped for cross-ventilation",
  "Mass-timber office tower, structure left exposed",
  "Rammed-earth retreat in an arid landscape",
  "Pavilion floating over a reflecting pool",
  "Concrete chapel lit only from above",
  "Stepped terraces with planted balconies",
  "Vaulted glass-and-steel railway canopy",
  "Stone monastery around a cloistered court",
  "Folded-plate concrete roof over a sports hall",
  "Waterfront culture house with a public roof",
  "Undulating brick vaults, à la Eladio Dieste",
  "Bamboo school raised above a flood plain",
  "Corten pavilion set in a sculpture garden",
  "Adaptive-reuse loft inside a grain silo",
  "Housing megastructure linked by sky bridges",
];

/**
 * useRotatingIndex — advance an index through `count` every `intervalMs`.
 * Pauses while `paused` is true (e.g. the field has a value). Under reduced
 * motion it still rotates (text change is not vestibular motion) — the consumer
 * just skips the crossfade. Uses a stable interval; resets cleanly on deps.
 */
export function useRotatingIndex(
  count: number,
  intervalMs: number,
  paused: boolean,
): number {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (paused || count <= 1) return;
    const id = setInterval(() => setI((n) => (n + 1) % count), intervalMs);
    return () => clearInterval(id);
  }, [count, intervalMs, paused]);
  return i;
}
