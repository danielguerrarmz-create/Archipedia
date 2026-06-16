/**
 * SearchLandingPage — Archipedia's cinematic, motion-rich splash. A thin
 * composition of section components in src/components/landing/. The single
 * source of truth for the reduced-motion contract lives here: one
 * useReducedMotion() result is threaded down as `motionOn`.
 *
 * Hero imagery is driven by the FROZEN manifest (heroPrecedents) so first paint
 * never blocks on the API. A best-effort /search/text call can enhance the pool
 * with live thumbs; it degrades silently to the manifest on any failure.
 */
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { heroPrecedents, type HeroPrecedent } from "../data/heroPrecedents";
import { searchByText } from "../lib/navigatorApi";
import {
  LandingTopBar,
  Preloader,
  EclecticHero,
  ProofStrip,
  NarrativeSection,
  type NarrativeConfig,
  ComposeCanvasVignette,
  AtmosphereMarquee,
  FinalCTA,
  LandingFooter,
  SearchGridVisual,
  CompareVisual,
  CiteVisual,
} from "../components/landing";

/** Best-effort live enhancement — returns the manifest unchanged on any error. */
function useEnhancedPrecedents(): HeroPrecedent[] {
  const [pool, setPool] = useState<HeroPrecedent[]>(heroPrecedents);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await searchByText("civic concrete", { topK: 12, pageSize: 12 });
        const live = (res.results || [])
          // HTTPS-only: never let a non-https thumb_url reach an <img src>
          .filter((r) => r.thumb_url && /^https:\/\//.test(r.thumb_url))
          .map<HeroPrecedent>((r, i) => ({
            id: r.project_id || `live_${i}`,
            thumb: r.thumb_url as string,
            title: r.title || "Untitled project",
            architect: (r as any).architect || "",
            country: r.country || "",
            typology: r.typology || "unknown",
            theme: "",
          }));
        // Only adopt if we got a full, usable set — otherwise keep the manifest.
        if (!cancelled && live.length >= heroPrecedents.length) {
          setPool(live.slice(0, heroPrecedents.length));
        }
      } catch {
        /* degrade silently to the frozen manifest */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return pool;
}

export function SearchLandingPage() {
  const reduce = useReducedMotion();
  const motionOn = !reduce;
  const precedents = useEnhancedPrecedents();

  const narratives = useMemo<NarrativeConfig[]>(
    () => [
      {
        index: "01",
        eyebrow: "SEARCH",
        title: "Describe it. The index answers.",
        reveal: "connector",
        body:
          "Plain language in, real buildings out. The engine reads each project's geometry and material rather than its caption — so a rough description still lands you on the precedents that matter.",
        metaLine: (
          <div
            className="mono-meta"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              background: "var(--concrete-sunken)",
              boxShadow: "var(--deboss)",
              borderRadius: "var(--radius-sm)",
              color: "var(--ink-700)",
            fontStyle: "italic",
            fontFamily: "var(--font-body)",
            }}
          >
            “a civic hall in board-formed concrete, with deep sun-shading”
          </div>
        ),
        visual: <SearchGridVisual precedents={precedents} />,
      },
      {
        index: "02",
        eyebrow: "COMPARE",
        title: "Sorted by visual proximity, not keywords.",
        body:
          "Put two precedents side by side and the system reads form, material, and massing — surfacing the relationship a keyword search would never connect.",
        reverse: true,
        reveal: "deboss",
        visual: <CompareVisual precedents={precedents} />,
      },
      {
        index: "03",
        eyebrow: "COMPOSE",
        title: "Pull precedents onto a board and connect them.",
        body:
          "The canvas is where the messy middle happens: arrange the buildings that matter, draw the connections between them, and let a generate node spin new directions from the set.",
        reveal: "deboss",
        visual: <ComposeCanvasVignette precedents={precedents} />,
      },
      {
        index: "04",
        eyebrow: "CITE",
        title: "Export a sheet that holds up in review.",
        body:
          "Every precedent carries its source — architect, project, location, year. Press to board and export a clean, credible sheet, not a mood board.",
        reverse: true,
        reveal: "plain",
        visual: <CiteVisual precedents={precedents} />,
      },
    ],
    [precedents],
  );

  return (
    <div style={{ background: "var(--concrete-50)", minHeight: "100vh" }}>
      <Preloader />
      <LandingTopBar />
      <EclecticHero precedents={precedents} motionOn={motionOn} />
      <ProofStrip motionOn={motionOn} />
      {/* The how-it-works tutorial the hero scrolls into. */}
      <div id="how-it-works">
        {narratives.map((cfg) => (
          <NarrativeSection key={cfg.index} config={cfg} motionOn={motionOn} />
        ))}
      </div>
      {/* "Ready to start?" search entry — placed right after the tutorial, above
          the "Every design leaves a mark" marquee (less scrolling to reach it). */}
      <FinalCTA motionOn={motionOn} />
      <AtmosphereMarquee precedents={precedents} motionOn={motionOn} />
      <LandingFooter />
    </div>
  );
}

export default SearchLandingPage;
