"""Regression: FAISS row -> image metadata must follow build_faiss.py's add order.

build_faiss.py adds vectors in sorted(*.npy) order, filtered to stems that are
id_map image_ids. id_map keys have gaps (0..13826 for 13411 entries), so the old
`idmap[str(row)]` lookup labelled image-search hits with the wrong project.

We assert the exact image_id (not just project_id): the stored index is IVFPQ
(lossy), but every local vector still retrieves itself at top-1 at the default
nprobe, so the stronger property holds and is what we pin.
"""
import glob
import json
import pathlib

import faiss
import numpy as np
import pytest

from app.faiss_service import FaissStore

NAV = pathlib.Path(__file__).resolve().parents[1]
DATA = NAV / "data"
VECS = sorted(glob.glob(str(DATA / "embeddings" / "image" / "*.npy")))


@pytest.fixture(scope="module")
def store():
    if not (DATA / "embeddings" / "index.faiss").exists() or not VECS:
        pytest.skip("real index or local vectors not present")
    return FaissStore(str(DATA))


@pytest.mark.parametrize("vec_path", VECS, ids=lambda p: pathlib.Path(p).stem)
def test_vector_top1_resolves_to_its_own_image(store, vec_path):
    image_id = pathlib.Path(vec_path).stem
    D, I = store.search(store.vector_for_image(image_id), top_k=5)
    results = store.results_payload(D, I)
    assert results, f"no hydrated results for {image_id}"
    assert results[0]["image_id"] == image_id


def test_reload_fails_loudly_when_idmap_and_index_disagree(tmp_path):
    emb = tmp_path / "embeddings"
    emb.mkdir()
    index = faiss.IndexFlatL2(4)
    index.add(np.eye(4, dtype="float32")[:3])  # 3 rows
    faiss.write_index(index, str(emb / "index.faiss"))
    idmap = {str(k): {"image_id": f"i_{k}", "project_id": f"p_{k}"} for k in (0, 5)}  # 2 ids
    (emb / "id_map.json").write_text(json.dumps(idmap), encoding="utf-8")
    with pytest.raises(RuntimeError, match="rebuild"):
        FaissStore(str(tmp_path))
