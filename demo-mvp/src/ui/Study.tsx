import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { PinTile } from "./PinTile";
import { Thumb } from "../brand/Thumb";
import { Pushpin } from "../brand/Pushpin";
import { hash, place } from "../data";
import { assemble, type Vectors } from "../engine";
import type { DemoData, Project } from "../types";

/** Strings run to the closest six only. Their opacity falls with rank, so the web encodes order. */
const STRUNG = 6;

interface Line {
  d: string;
  rank: number;
}

export function Study({
  initialPhoto = 0,
  data,
  vectors,
  subject,
  trail,
  pinned,
  onOpen,
  onTogglePin,
  onTrail,
  onAddToCanvas,
  fromCanvas,
}: {
  initialPhoto?: number;
  data: DemoData;
  vectors: Vectors | null;
  subject: Project;
  trail: string[];
  pinned: Set<string>;
  onOpen: (id: string, photo?: number) => void;
  onTogglePin: (id: string, photo?: number) => void;
  onTrail: (index: number) => void;
  onAddToCanvas?: (id: string) => void;
  fromCanvas?: boolean;
}) {
  // Keyed by building + photo in App, so a new close-up always starts on the photo that matched.
  const [photo, setPhoto] = useState(() => Math.min(initialPhoto, Math.max(0, subject.images.length - 1)));

  // Same engine and same measure as the canvas: one building, one chosen photo.
  const hits = useMemo(
    () =>
      vectors
        ? assemble(data, vectors, [{ nodeId: "q", projectId: subject.id, imageIndex: photo, weight: 1, mode: "include" }], [], 12).hits
        : [],
    [data, vectors, subject.id, photo],
  );

  const wrapRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Line[]>([]);

  // Measure the pin heads and draw sagging strings from the subject to its nearest matches.
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const draw = () => {
      if (window.innerWidth < 900) {
        setLines([]);
        return;
      }
      const box = wrap.getBoundingClientRect();
      const anchor = (el: Element | null) => {
        if (!el) return null;
        const svg = el.querySelector("figure > svg");
        const r = (svg ?? el).getBoundingClientRect();
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height * 0.36 - box.top };
      };
      const from = anchor(wrap.querySelector('[data-pin="subject"]'));
      if (!from) return;
      const next: Line[] = [];
      for (let i = 0; i < Math.min(STRUNG, hits.length); i++) {
        const to = anchor(wrap.querySelector(`[data-pin="n${i}"]`));
        if (!to) continue;
        const sag = 22 + Math.abs(to.x - from.x) * 0.05;
        const mx = (from.x + to.x) / 2;
        const my = Math.max(from.y, to.y) + sag;
        next.push({ d: `M${from.x} ${from.y} Q${mx} ${my} ${to.x} ${to.y}`, rank: i });
      }
      setLines(next);
    };
    draw();
    const settle = window.setTimeout(draw, 900);
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    return () => {
      ro.disconnect();
      window.clearTimeout(settle);
    };
  }, [subject.id, hits]);

  const isPinned = pinned.has(subject.id);
  const where = place(subject);
  const h = hash(subject.id);
  const { closest_other_median: near, random_pair_median: far } = data.meta.anchors;

  return (
    <section className="study" id="study" aria-labelledby="study-title">
      <div className="container">
        <div className="study__head">
          <p className="mono-caps eyebrow">One building, up close</p>
          {fromCanvas && (
            <a className="link-quiet" href="./?view=canvas">
              Back to the canvas
            </a>
          )}
          {trail.length > 1 && (
            <nav className="trail" aria-label="Your walk through the index">
              <span className="mono-caps trail__label">Your walk</span>
              {trail.map((id, i) => {
                const p = data.byId.get(id);
                if (!p) return null;
                const last = i === trail.length - 1;
                return (
                  <span key={`${id}-${i}`} className="trail__step">
                    {i > 0 && (
                      <span className="trail__sep" aria-hidden>
                        /
                      </span>
                    )}
                    {last ? (
                      <span aria-current="step">{p.title}</span>
                    ) : (
                      <button type="button" onClick={() => onTrail(i)}>
                        {p.title}
                      </button>
                    )}
                  </span>
                );
              })}
            </nav>
          )}
        </div>

        <div className="study__body" ref={wrapRef}>
          <svg className="strings" aria-hidden>
            {lines.map((l) => (
              <path key={l.rank} d={l.d} style={{ opacity: 0.9 - l.rank * 0.12 }} />
            ))}
          </svg>

          <article className="subject" data-pin="subject">
            <figure className="subject__card">
              <Pushpin size={40} tilt={-16} seed={h % 97} className="subject__pin" />
              <Thumb src={subject.images[photo] ?? subject.image} alt={subject.title} aspect={1.25} radius="0" eager />
              {subject.images.length > 1 && (
                <div className="subject__photos" role="group" aria-label="Which photo to match">
                  {subject.images.map((src, i) => (
                    <button key={src} type="button" className={i === photo ? "is-on" : ""} onClick={() => setPhoto(i)} aria-pressed={i === photo} aria-label={`Match on photo ${i + 1} of ${subject.images.length}`}>
                      <img src={src} alt="" />
                    </button>
                  ))}
                </div>
              )}
              <figcaption>
                <h2 id="study-title" tabIndex={-1}>{subject.title}</h2>
                <dl className="facts">
                  <div>
                    <dt>Architect</dt>
                    <dd>{subject.architect}</dd>
                  </div>
                  {where && (
                    <div>
                      <dt>Place</dt>
                      <dd>{where}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Year</dt>
                    <dd className="num">{subject.year}</dd>
                  </div>
                  {subject.typology && (
                    <div>
                      <dt>Type</dt>
                      <dd>{subject.typology}</dd>
                    </div>
                  )}
                </dl>
                <div className="subject__actions">
                  <button
                    type="button"
                    className={`btn-ink${isPinned ? " is-on" : ""}`}
                    onClick={() => onTogglePin(subject.id, photo)}
                    aria-pressed={isPinned}
                  >
                    {isPinned ? "✓ Pinned to board" : "Pin to board"}
                  </button>
                  {onAddToCanvas && (
                    <button type="button" className="btn-ink" onClick={() => onAddToCanvas(subject.id)}>
                      Blend on canvas
                    </button>
                  )}
                  {subject.source && (
                    <a className="link-quiet" href={subject.source} target="_blank" rel="noreferrer">
                      Source and photo credits on ArchDaily
                    </a>
                  )}
                </div>
              </figcaption>
            </figure>
          </article>

          <div className="matches">
            <p className="matches__label">
              <span className="mono-caps">Closest to photo {photo + 1}</span>
              <span className="legend">
                Similarity, 0 to 1. This photo&rsquo;s closest match scores{" "}
                <b className="num">{hits[0] ? hits[0].score.toFixed(2) : "–"}</b>. For most buildings it is around{" "}
                <b className="num">{near.toFixed(2)}</b>; unusual shots, like aerials, have no close twin. Two random
                buildings score about <b className="num">{far.toFixed(2)}</b>. Each card shows the photo that matched.
              </span>
            </p>
            {!vectors ? (
              <p className="mono-caps">Loading image vectors</p>
            ) : (
              <ol className="matches__grid">
                {hits.map((n, i) => {
                  const p = n.project;
                  const on = pinned.has(p.id);
                  return (
                    <li key={p.id}>
                      <PinTile
                        project={p}
                        image={p.images[n.image]}
                        index={i}
                        onOpen={(id) => onOpen(id, n.image)}
                        dataPin={`n${i}`}
                        pinSize={26}
                        aspect={1.25}
                        badge={
                          <span className="stamp-rank">
                            <span className="num">{String(i + 1).padStart(2, "0")}</span>
                            <span className="dist num" title="Similarity of the matched photos, 0 to 1">
                              {n.score.toFixed(2)}
                            </span>
                          </span>
                        }
                        footer={
                          <button
                            type="button"
                            className={`pin-toggle${on ? " is-on" : ""}`}
                            onClick={() => onTogglePin(p.id, n.image)}
                            aria-pressed={on}
                            aria-label={`${on ? "Unpin" : "Pin"} ${p.title}`}
                          >
                            {on ? "✓ Pinned" : "Pin"}
                          </button>
                        }
                      />
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
