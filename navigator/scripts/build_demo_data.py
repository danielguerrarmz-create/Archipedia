"""Build static demo data for the demo-mvp app.

Writes demo-mvp/public/data/{projects.json, vectors.bin, scales.bin, meta.json}.

Curation: architect known, year > 0, country known, >= 1 image vector in
id_map, and not an ArchDaily news/article record. News heuristic (city and
typology are "unknown" for every candidate, so they cannot discriminate):
  - tags contain the exact tag "News", OR
  - title lacks the ArchDaily project-page separator " / " (every project
    page is titled "<Name> / <Architect>"; articles are not).

Neighbours: for every curated project, reconstruct the stored vector of its
FIRST image (the hero photo) from the IVFPQ index (direct map), search the
whole index (nprobe = nlist, k = 200), drop same-project and non-curated hits,
keep the min distance (and the matching image) per neighbour project,
(First image only, not min-over-all-images: with all images the winning
match was nearly always plan-to-plan / drawing-to-drawing, since DINOv2
puts line drawings on white close together; neighbours stopped meaning
"looks like this project".) sort
ascending (squared L2, as FAISS reports it), keep the top 12.
Image rows whose PQ code is shared with another project (scraped ArchDaily
page furniture such as product ads, byte-identical across projects) are
excluded from queries, hits and the thumbnails.
"""
from __future__ import annotations

import ast
import json
import statistics
from datetime import date
from pathlib import Path

import faiss
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]          # navigator/
REPO = ROOT.parent
CSV = ROOT / "data" / "metadata" / "projects.csv"
INDEX = ROOT / "data" / "embeddings" / "index.faiss"
ID_MAP = ROOT / "data" / "embeddings" / "id_map.json"
OUT = REPO / "demo-mvp" / "public" / "data"

K = 200
MAX_NEIGHBOURS = 12
MAX_IMAGES = 4
# A code shared by 2 projects is usually a news article reusing a project hero
# (e.g. 10K House image_01); page furniture is shared by many.
MIN_SHARED_PROJECTS = 3
UNKNOWN = {"", "unknown", "nan", "none"}


def _known(v) -> bool:
    return isinstance(v, str) and v.strip().lower() not in UNKNOWN


def is_news(title: str, tags) -> bool:
    tag_set = {t.strip() for t in str(tags).split("|")} if isinstance(tags, str) else set()
    return "News" in tag_set or " / " not in title


def full_credit(title: str, architect: str) -> str:
    """The architect column keeps one firm; the ArchDaily title keeps them all.
    Use the title credit when it is a multi-firm list that contains the column value."""
    credit = title.split(" / ", 1)[1].strip() if " / " in title else ""
    credit = " ".join(credit.split())
    if " + " in credit and architect.lower() in credit.lower():
        return credit
    return architect


def clean_title(title: str) -> str:
    name = title.rsplit(" / ", 1)[0] if " / " in title else title
    return " ".join(name.split())


def faiss_row_meta(id_map: dict) -> dict[int, dict]:
    """FAISS row -> id_map entry.

    The id_map KEYS are not FAISS rows (keys run 0..13826 with gaps; the
    index holds ids 0..13410). build_faiss.py stacks vectors from
    sorted(glob("embeddings/image/*.npy")), so row r is the r-th image_id
    in path-sort order (image_id + ".npy"). Verified by verify_alignment().
    """
    entries = sorted(id_map.values(), key=lambda v: v["image_id"] + ".npy")
    return dict(enumerate(entries))


def verify_alignment(index, row_meta: dict[int, dict]) -> int:
    """Search with each locally available raw vector; its top-1 row must be itself."""
    paths = sorted((ROOT / "data" / "embeddings" / "image").glob("*.npy"))
    known = {v["image_id"] for v in row_meta.values()}
    checked = 0
    for p in paths:
        if p.stem not in known:
            continue
        x = np.load(p).astype("float32").reshape(1, -1)
        x /= np.linalg.norm(x) + 1e-12
        _, I = index.search(x, 1)
        got = row_meta[int(I[0, 0])]["image_id"]
        if got != p.stem:
            raise SystemExit(f"id_map/FAISS misaligned: {p.stem} -> row {I[0, 0]} ({got})")
        checked += 1
    if checked == 0:
        raise SystemExit("no raw vectors available to verify id_map/FAISS alignment")
    return checked


def boilerplate_rows(X: np.ndarray, row_meta: dict[int, dict]) -> set[int]:
    """Rows whose stored code is identical across >= MIN_SHARED_PROJECTS projects.

    The scrape picked up ArchDaily page furniture (product ads etc.); those
    images are byte-identical across projects, so their PQ codes collide and
    they produce distance-0 "neighbours" that mean nothing.
    """
    owners: dict[bytes, set[str]] = {}
    for r in range(len(X)):
        owners.setdefault(X[r].tobytes(), set()).add(row_meta[r]["project_id"])
    return {r for r in range(len(X)) if len(owners[X[r].tobytes()]) >= MIN_SHARED_PROJECTS}


def main() -> None:
    df = pd.read_csv(CSV)
    id_map = json.loads(ID_MAP.read_text(encoding="utf-8"))
    row_meta = faiss_row_meta(id_map)
    rows_by_project: dict[str, list[int]] = {}
    for row, v in row_meta.items():
        rows_by_project.setdefault(v["project_id"], []).append(row)

    index = faiss.read_index(str(INDEX))
    if index.metric_type != faiss.METRIC_L2:
        raise SystemExit(f"unexpected metric {index.metric_type}; sort direction would differ")
    if len(row_meta) != index.ntotal:
        raise SystemExit(f"id_map has {len(row_meta)} entries, index has {index.ntotal}")
    ivf = faiss.extract_index_ivf(index)
    ivf.make_direct_map()
    ivf.nprobe = ivf.nlist  # exhaustive over inverted lists
    print(f"alignment verified on {verify_alignment(index, row_meta)} raw vectors")
    X = index.reconstruct_n(0, index.ntotal)
    junk = boilerplate_rows(X, row_meta)
    print(f"boilerplate rows (code shared across projects): {len(junk)}")
    for pid in list(rows_by_project):
        rows_by_project[pid] = [r for r in rows_by_project[pid] if r not in junk]
        if not rows_by_project[pid]:
            del rows_by_project[pid]

    base = df[
        df.architect.apply(_known)
        & df.year_completed.notna() & (df.year_completed > 0)
        & df.country.apply(_known)
        & df.project_id.isin(rows_by_project)
    ]
    news_mask = base.apply(lambda r: is_news(str(r.title), r.tags), axis=1)
    curated_df = base[~news_mask]

    projects, query_rows = [], {}
    for r in curated_df.itertuples():
        rows = rows_by_project[r.project_id]
        by_image = {row_meta[i]["image_id"]: i for i in rows}
        try:
            order = [by_image[iid] for iid in ast.literal_eval(r.image_ids) if iid in by_image]
        except (ValueError, SyntaxError):
            order = []
        order += [i for i in sorted(rows) if i not in order]  # CSV order first, then FAISS row order
        query_rows[r.project_id] = order
        thumbs = [row_meta[i]["thumb"] for i in order]
        projects.append({
            "id": r.project_id,
            "title": clean_title(str(r.title)),
            "architect": full_credit(str(r.title), r.architect.strip()),
            "year": int(r.year_completed),
            "city": r.city.strip() if _known(r.city) else None,
            "country": r.country.strip(),
            "typology": r.typology.strip() if _known(r.typology) else None,
            "image": thumbs[0],
            "images": thumbs[:MAX_IMAGES],
            "source": r.archdaily_url if _known(r.archdaily_url) else None,
        })
    curated = {p["id"] for p in projects}


    neighbours = {}
    for pid in sorted(curated):
        rows = query_rows[pid][:1]  # first image only, see module docstring
        q = X[rows]
        D, I = index.search(q, K)
        best: dict[str, tuple[float, int]] = {}
        for drow, irow in zip(D, I):
            for d, i in zip(drow, irow):
                if i < 0 or int(i) in junk:
                    continue
                npid = row_meta[int(i)]["project_id"]
                if npid == pid or npid not in curated:
                    continue
                if npid not in best or d < best[npid][0]:
                    best[npid] = (float(d), int(i))
        ranked = sorted(best.items(), key=lambda kv: kv[1][0])[:MAX_NEIGHBOURS]
        neighbours[pid] = [
            {"id": n, "distance": round(d, 4), "image": row_meta[i]["thumb"]}
            for n, (d, i) in ranked
        ]

    # In-browser assembly: export the stored index vectors of the images each card
    # shows (projects[k]["images"], up to MAX_IMAGES), L2-normalised, then int8 with a
    # PER-ROW scale (a unit 768-d vector only spans about +-0.2, so a fixed x127 scale
    # wastes most of int8). projects[k]["v"] = [first_row, count].
    # Browser: cosine(a, b) = dot(q_a, q_b) * scale[a] * scale[b].
    rows_out, cursor = [], 0
    for p in projects:
        own = query_rows[p["id"]][:MAX_IMAGES]
        p["v"] = [cursor, len(own)]
        rows_out += own
        cursor += len(own)
    V = X[rows_out].astype("float32")
    V /= np.linalg.norm(V, axis=1, keepdims=True) + 1e-12
    scale = (np.abs(V).max(axis=1) / 127.0).astype("float32")
    Vq = np.clip(np.round(V / scale[:, None]), -127, 127).astype(np.int8)
    err = np.abs((Vq.astype("float32") * scale[:, None]) @ (Vq.astype("float32") * scale[:, None]).T - V @ V.T).max()
    print(f"quantisation: max cosine error {err:.5f}")

    # Honest anchors for reading a score: what the closest OTHER project typically
    # scores, and what an arbitrary pair of projects typically scores.
    C = V @ V.T
    owner = np.repeat(np.arange(len(projects)), [p["v"][1] for p in projects])
    same = owner[:, None] == owner[None, :]
    hero_rows = np.array([p["v"][0] for p in projects])
    best_other = []
    for k, r in enumerate(hero_rows):
        row = C[r].copy()
        row[same[r]] = -1
        best_other.append(row.max())
    hh = C[np.ix_(hero_rows, hero_rows)]
    iu = np.triu_indices(len(hero_rows), 1)
    anchors = {
        "closest_other_median": round(float(np.median(best_other)), 2),
        "random_pair_median": round(float(np.median(hh[iu])), 2),
    }
    print("anchors", anchors)
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "vectors.bin").write_bytes(Vq.tobytes())
    (OUT / "scales.bin").write_bytes(scale.tobytes())

    (OUT / "projects.json").write_text(json.dumps(projects, ensure_ascii=False), encoding="utf-8")
    meta = {
        "generated": date.today().isoformat(),
        "metric": "cosine",
        "model": "DINOv2 ViT-B/14 768-d",
        "corpus_projects": int(len(df)),
        "demo_projects": len(projects),
        "vectors": {"file": "vectors.bin", "scales": "scales.bin", "dtype": "int8", "dim": int(V.shape[1]), "rows": int(V.shape[0]), "per_project": "projects[k].v = [first_row, count]"},
        "anchors": anchors,
        "method": ("Cosine similarity between stored DINOv2 index vectors, computed in the browser: a project scores "
                   "its best match over the up-to-4 images its card shows; assemblies fuse streams by explicit weights."),
    }
    (OUT / "meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")

    counts = [len(v) for v in neighbours.values()]
    top1 = sorted(v[0]["distance"] for v in neighbours.values() if v)
    print(f"candidates={len(base)} news_dropped={int(news_mask.sum())} curated={len(projects)}")
    print(f"index={type(index).__name__} nlist={ivf.nlist} ntotal={index.ntotal} d={index.d}")
    print(f">=6 neighbours: {sum(c >= 6 for c in counts)}  min={min(counts)} median={statistics.median(counts)}")
    print(f"top1 distance min={top1[0]} median={statistics.median(top1)} max={top1[-1]}")
    for f in ("projects.json", "vectors.bin", "scales.bin", "meta.json"):
        print(f, (OUT / f).stat().st_size, "bytes")


if __name__ == "__main__":
    main()
