"""Unit tests for build_demo_data helpers (run: python -m pytest scripts/test_build_demo_data.py)."""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from build_demo_data import boilerplate_rows, clean_title, faiss_row_meta, is_news  # noqa: E402


def test_faiss_rows_follow_npy_path_sort_not_id_map_keys():
    # keys have gaps and are out of order; "a-b.npy" < "a.npy" in path order
    id_map = {"5": {"image_id": "a", "project_id": "p"},
              "0": {"image_id": "b", "project_id": "p"},
              "9": {"image_id": "a-b", "project_id": "p"}}
    rows = faiss_row_meta(id_map)
    assert [rows[i]["image_id"] for i in range(3)] == ["a-b", "a", "b"]


def test_news_detected_by_tag_or_missing_project_separator():
    assert is_news("Firm Unveils Tower / Firm", "Tokyo|News|Towers")
    assert is_news("Wang Shu: Reimagining Chinese Architecture", "China")
    assert not is_news("Park Hill Estate / Jack Lynn", "Sheffield|Newsroom")


def test_clean_title_strips_architect_and_collapses_spaces():
    assert clean_title("10K House  / Takk") == "10K House"
    assert clean_title("A / B / Studio X") == "A / B"


def test_boilerplate_needs_three_projects():
    X = np.array([[1, 0], [1, 0], [1, 0], [0, 1], [0, 1]], dtype="float32")
    meta = {0: {"project_id": "a"}, 1: {"project_id": "b"}, 2: {"project_id": "c"},
            3: {"project_id": "a"}, 4: {"project_id": "b"}}
    assert boilerplate_rows(X, meta) == {0, 1, 2}
