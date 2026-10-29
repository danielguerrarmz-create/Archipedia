import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { filterProjects, loadDemoData } from "./data";
import { assemble, loadVectors, type Vectors } from "./engine";
import { AssemblyCanvas, type Published } from "./canvas/AssemblyCanvas";
import { Parts } from "./canvas/Parts";
import type { DemoData, Project } from "./types";
import { TopBar } from "./ui/TopBar";
import { PinTile } from "./ui/PinTile";
import { Study } from "./ui/Study";
import { Board } from "./ui/Board";

const SOURCE_URL = "https://github.com/danielguerrarmz-create/Archipedia";
const BOARD_KEY = "archipedia-demo-board";
const PHOTO_KEY = "archipedia-demo-board-photos";
const PAGE = 24;

/** Starting points offered when a keyword search finds nothing. Real projects, chosen for range. */
const MOODS = [
  "p_le_carrier_cabin_gauthier_cammas_1036699",
  "p_river_chapel_la_barca_clement_molinier_1036905",
  "p_kirkkonummi_library_jkmm_architects_952108",
  "p_monolith_lodge_hello_wood_1036989",
  "p_barangaroo_south_masterplan_rshp_1037097",
  "p_laoyuting_pavilion_atelier_deshaus_1036767",
];

function readBoard(): string[] {
  try {
    const raw = localStorage.getItem(BOARD_KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function readPhotos(): Record<string, number> {
  try {
    const v = JSON.parse(localStorage.getItem(PHOTO_KEY) ?? "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

function writeBoard(ids: string[]) {
  try {
    localStorage.setItem(BOARD_KEY, JSON.stringify(ids));
  } catch {
    /* private mode: the board still works for this visit */
  }
}

function pickWall(projects: Project[], n: number): Project[] {
  const pool = projects.filter((p) => p.images.length >= 2);
  const out: Project[] = [];
  const used = new Set<number>();
  while (out.length < Math.min(n, pool.length)) {
    const i = Math.floor(Math.random() * pool.length);
    if (!used.has(i)) {
      used.add(i);
      out.push(pool[i]);
    }
  }
  return out;
}

const params = new URLSearchParams(window.location.search);
const IS_CANVAS = params.get("view") === "canvas";
const STARTER = { a: "p_le_carrier_cabin_gauthier_cammas_1036699", b: "p_river_chapel_la_barca_clement_molinier_1036905" };

/** Same-tab hops between the two pages; the canvas graph and the board persist in storage. */
const toCanvas = (add?: string) => {
  window.location.href = `./?view=canvas${add ? `&add=${encodeURIComponent(add)}` : ""}`;
};
const toCloseUp = (id: string, photo?: number) => {
  window.location.href = `./?p=${encodeURIComponent(id)}${photo ? `&photo=${photo}` : ""}&from=canvas`;
};

export function App() {
  const [data, setData] = useState<DemoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [trail, setTrail] = useState<string[]>([]);
  const [board, setBoard] = useState<string[]>(readBoard);
  const [wall, setWall] = useState<Project[]>([]);
  const [vectors, setVectors] = useState<Vectors | null>(null);
  const [out, setOut] = useState<Published>({ hits: [], pool: 0, total: 0, letters: {}, avoid: [] });
  // The photo that made the argument travels with the building: into the close-up and onto the board.
  const [photos, setPhotos] = useState<Record<string, number>>(readPhotos);
  const [openPhoto, setOpenPhoto] = useState<{ id: string; photo: number } | null>(null);
  const [addRequest, setAddRequest] = useState<{ id: string; nonce: number } | null>(null);

  useEffect(() => {
    loadDemoData()
      .then((d) => {
        setData(d);
        setWall(pickWall(d.projects, 5));
        loadVectors(d.meta).then(setVectors).catch((e: Error) => setError(e.message));
        const fromUrl = new URLSearchParams(window.location.search).get("p");
        const addId = params.get("add");
        if (IS_CANVAS && addId && d.byId.has(addId)) setAddRequest({ id: addId, nonce: Date.now() });
        if (!IS_CANVAS && fromUrl && d.byId.has(fromUrl)) {
          const ph = Number(params.get("photo"));
          if (ph > 0) setOpenPhoto({ id: fromUrl, photo: ph });
          setTrail([fromUrl]);
          window.setTimeout(() => document.getElementById("study")?.scrollIntoView({ block: "start" }), 50);
        } else if (window.location.hash.length > 1) {
          // Sections render after data loads, so the browser's own hash jump found nothing.
          const target = window.location.hash.slice(1);
          window.setTimeout(() => document.getElementById(target)?.scrollIntoView({ block: "start" }), 400);
        }
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => writeBoard(board), [board]);
  useEffect(() => {
    try {
      localStorage.setItem(PHOTO_KEY, JSON.stringify(photos));
    } catch {
      /* fine for this visit */
    }
  }, [photos]);

  const subjectId = trail[trail.length - 1];

  // Keep the open close-up in the URL so a link can drop someone straight into it.
  useEffect(() => {
    if (!data || IS_CANVAS) return; // wait for the index, or a shared ?p= link is wiped before it is read
    const url = new URL(window.location.href);
    if (subjectId) url.searchParams.set("p", subjectId);
    else url.searchParams.delete("p");
    window.history.replaceState(null, "", url);
  }, [subjectId, data]);

  const open = useCallback((id: string, photo?: number) => {
    setOpenPhoto(photo != null ? { id, photo } : null);
    setTrail((t) => (t[t.length - 1] === id ? t : [...t, id].slice(-8)));
    window.requestAnimationFrame(() => {
      document.getElementById("study")?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => document.getElementById("study-title")?.focus({ preventScroll: true }), 350);
    });
  }, []);

  const togglePin = useCallback((id: string, photo?: number) => {
    setBoard((b) => (b.includes(id) ? b.filter((x) => x !== id) : [...b, id]));
    if (photo != null) setPhotos((ph) => ({ ...ph, [id]: photo }));
  }, []);

  const addToCanvas = useCallback((id: string) => toCanvas(id), []);

  // Home teaser: the starter blend, computed live with the same engine as the canvas.
  const teaser = useMemo(() => {
    if (!data || !vectors || !data.byId.has(STARTER.a) || !data.byId.has(STARTER.b)) return null;
    const r = assemble(
      data,
      vectors,
      [
        { nodeId: "A", projectId: STARTER.a, imageIndex: 0, weight: 70, mode: "include" },
        { nodeId: "B", projectId: STARTER.b, imageIndex: 0, weight: 30, mode: "include" },
      ],
      [],
      3,
    );
    return { a: data.byId.get(STARTER.a)!, b: data.byId.get(STARTER.b)!, hits: r.hits };
  }, [data, vectors]);

  const results = useMemo(() => (data ? filterProjects(data.projects, query) : []), [data, query]);
  const pinned = useMemo(() => new Set(board), [board]);
  const liveBoard = useMemo(() => (data ? board.filter((id) => data.byId.has(id)) : board), [board, data]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    document.getElementById("index")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const subject = subjectId && data ? data.byId.get(subjectId) : undefined;

  if (IS_CANVAS) {
    return (
      <>
        <TopBar boardCount={liveBoard.length} fullAppUrl={SOURCE_URL} active="canvas" />
        <main className="ws-page" aria-label="Search by assembly canvas">
          <h1 className="sr-only">Search by assembly canvas</h1>
          {error && <p className="status" role="alert">Part of the demo failed to load ({error}). Refresh to try again.</p>}
          {data && vectors ? (
            <AssemblyCanvas
              data={data}
              vectors={vectors}
              onOpen={toCloseUp}
              onResults={setOut}
              addRequest={addRequest}
              pinned={pinned}
              onTogglePin={togglePin}
            />
          ) : (
            !error && <p className="mono-caps status">Loading the index</p>
          )}
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar boardCount={liveBoard.length} fullAppUrl={SOURCE_URL} />
      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="grain hero__grain" aria-hidden />
          <div className="hero__grid-bg" aria-hidden />
          <div className="container hero__inner">
            <div className="hero__copy">
              <p className="mono-caps eyebrow">Precedent search · working demo</p>
              <h1 id="hero-title">
                Search by <em className="editorial-em">assembly.</em>
              </h1>
              <p className="subhead">Find buildings by blending the ones you already love.</p>
              <p className="lead">
                Put two or three real buildings on a canvas, choose the photo that carries the idea, and weight
                each one. The ranking moves as you do. Every result is a real built project with its architect,
                year and source.
              </p>
              <div className="hero__cta">
                <a className="btn-ink btn-ink--lg" href="./?view=canvas">
                  Open the canvas
                </a>
              </div>
              <form className="well" role="search" onSubmit={submit}>
                <label htmlFor="q" className="sr-only">
                  Find a building by name, architect, place or year
                </label>
                <input
                  id="q"
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShown(PAGE);
                  }}
                  placeholder="Look one up: cabin, Adjaye, Japan"
                  autoComplete="off"
                />
                <button type="submit" className={`btn-signal${query ? "" : " is-idle"}`}>
                  Search
                </button>
              </form>
              {data && (
                <p className="proof-line mono-caps">
                  <span className="num">0</span> generated images · <span className="num">{data.meta.demo_projects}</span>{" "}
                  real built projects · every card cited
                </p>
              )}
            </div>

            <div className="wall" aria-label="Or start from one of these">
              {wall.map((p, i) => (
                <div key={p.id} className={`wall__slot wall__slot--${i}`}>
                  <PinTile project={p} onOpen={open} index={i} maxRot={5} pinSize={34} eager />
                </div>
              ))}
              {data && (
                <button type="button" className="wall__shuffle mono-caps" onClick={() => setWall(pickWall(data.projects, 5))}>
                  Shuffle the wall
                </button>
              )}
            </div>
          </div>
        </section>

        {error && (
          <section className="container status" role="alert">
            <p>Part of the demo failed to load ({error}). Refresh to try again.</p>
          </section>
        )}
        {!data && !error && (
          <section className="container status" aria-busy="true">
            <p className="mono-caps">Loading the index</p>
          </section>
        )}

        {data && (
          <section className="assembly" id="assembly" aria-labelledby="assembly-title">
            <div className="container teaser">
              <div className="teaser__copy">
                <p className="mono-caps eyebrow">The canvas</p>
                <h2 id="assembly-title" className="section-title">
                  Blend buildings, watch the <em className="editorial-em">ranking</em> move
                </h2>
                <p className="section-lead">
                  Put real buildings on a canvas, choose the photo that carries each idea, and weight how hard each
                  one pulls. Results re-rank as you drag. Here is the starter blend, computed live: 70% cabin, 30%
                  chapel.
                </p>
                <a className="btn-ink btn-ink--lg" href="./?view=canvas">
                  Open the canvas
                </a>
              </div>
              {teaser ? (
                <div className="teaser__eq" aria-label="Starter blend and its top three results">
                  <div className="teaser__in">
                    <PinTile project={teaser.a} onOpen={open} index={0} badge={<span className="stamp-rank"><span className="num">A · 70</span></span>} />
                    <PinTile project={teaser.b} onOpen={open} index={1} badge={<span className="stamp-rank"><span className="num">B · 30</span></span>} />
                  </div>
                  <span className="teaser__op mono-caps" aria-hidden>
                    gives
                  </span>
                  <ol className="teaser__out">
                    {teaser.hits.map((h, i) => (
                      <li key={h.project.id}>
                        <PinTile
                          project={h.project}
                          image={h.project.images[h.image]}
                          onOpen={(id) => open(id, h.image)}
                          index={i + 2}
                          badge={
                            <span className="stamp-rank">
                              <span className="num">{String(i + 1).padStart(2, "0")}</span>
                              <span className="dist num">{h.score.toFixed(2)}</span>
                            </span>
                          }
                        />
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <p className="mono-caps status">Loading image vectors</p>
              )}
            </div>
          </section>
        )}

        {data && subject && (
          <Study
            key={`${subject.id}:${openPhoto?.id === subject.id ? openPhoto.photo : 0}`}
            initialPhoto={openPhoto?.id === subject.id ? openPhoto.photo : 0}
            data={data}
            vectors={vectors}
            subject={subject}
            trail={trail}
            pinned={pinned}
            onOpen={open}
            onTogglePin={togglePin}
            onTrail={(i) => setTrail((t) => t.slice(0, i + 1))}
            onAddToCanvas={vectors ? addToCanvas : undefined}
            fromCanvas={params.get("from") === "canvas"}
          />
        )}

        {data && (
          <section className="index" id="index" aria-labelledby="index-title">
            <div className="container">
              <div className="index__head">
                <div>
                  <p className="mono-caps eyebrow">The index</p>
                  <h2 id="index-title" className="section-title">
                    {query ? (
                      <>
                        Names matching <em className="editorial-em">“{query}”</em>
                      </>
                    ) : (
                      <>
                        Every building, <em className="editorial-em">pinned</em>
                      </>
                    )}
                  </h2>
                </div>
                <p className="mono-caps index__count" aria-live="polite">
                  <span className="num">{Math.min(shown, results.length)}</span> of{" "}
                  <span className="num">{results.length}</span>
                </p>
              </div>
              {results.length === 0 ? (
                <div className="index__empty">
                  <p>
                    No names match &ldquo;{query}&rdquo;. This box reads names, places and architects, not moods.
                    Moods live in the photos, so start from a picture instead:
                  </p>
                  <ul className="index__grid">
                    {MOODS.map((id) => data.byId.get(id))
                      .filter((p): p is Project => !!p)
                      .map((p, i) => (
                        <li key={p.id}>
                          <PinTile project={p} onOpen={open} index={i} />
                        </li>
                      ))}
                  </ul>
                </div>
              ) : (
                <>
                  <ul className="index__grid">
                    {results.slice(0, shown).map((p, i) => (
                      <li key={p.id}>
                        <PinTile
                          project={p}
                          onOpen={open}
                          index={i % PAGE}
                          footer={
                            vectors ? (
                              <button type="button" className="pin-toggle" onClick={() => addToCanvas(p.id)} aria-label={`Blend ${p.title} on the canvas`}>
                                Blend this
                              </button>
                            ) : undefined
                          }
                        />
                      </li>
                    ))}
                  </ul>
                  {query && results.length <= 2 && (
                    <div className="index__empty index__more-moods">
                      <p>Names only go so far. Moods live in the photos, so you can also start from a picture:</p>
                      <ul className="index__grid">
                        {MOODS.map((id) => data.byId.get(id))
                          .filter((p): p is Project => !!p && !results.includes(p))
                          .slice(0, 4)
                          .map((p, i) => (
                            <li key={p.id}>
                              <PinTile project={p} onOpen={open} index={i} />
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
              {shown < results.length && (
                <div className="index__more">
                  <button type="button" className="btn-ink" onClick={() => setShown((s) => s + PAGE)}>
                    Show more
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {data && (
          <Board
            data={data}
            ids={liveBoard}
            photos={photos}
            onOpen={(id) => open(id, photos[id])}
            onRemove={(id) => togglePin(id)}
            onClear={() => setBoard([])}
          />
        )}
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <p className="footer__line">Every result carries its source.</p>
          {data && (
            <p className="footer__meta mono-caps">
              DINOv2 image embeddings · cosine similarity, computed in your browser · {data.meta.demo_projects} of{" "}
              {data.meta.corpus_projects} indexed projects · images and metadata via ArchDaily · built{" "}
              {data.meta.generated}
            </p>
          )}
          <p className="footer__meta">
            This demo runs entirely in your browser. The full app adds searching with your own image, text search
            and AI generation, which need a server.{" "}
            <a href={SOURCE_URL} target="_blank" rel="noreferrer">
              Source on GitHub
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
