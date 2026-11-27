# Handoff — Backend revive (local) (2026-06-16)

Branch: `rebrand/concrete-and-signal`. Frontend (Vite, :5173) was up and proxying
`/search`, `/boards`, `/images`, `/generate` to `http://127.0.0.1:8000`, but the
backend on :8000 was DOWN (every `/search/text` returned ECONNREFUSED). This
handoff brings the FastAPI backend back up and verifies search end-to-end.

## What
Started the existing FastAPI backend (`navigator/app/main.py`) on :8000 using the
already-provisioned venv. No code changes, no frontend changes. Both text search
and image search now return real results, directly and through the :5173 proxy.

Run command (from `C:\Users\danie\Archipedia\navigator`, Git Bash):

```bash
export MODEL_NAME=vit_base_patch14_dinov2 EMB_DIM=768 FAISS_NLIST=4096 FAISS_M=16 DATA_DIR=data
.venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

PowerShell equivalent (project's documented path):

```powershell
cd navigator
.\.venv\Scripts\Activate.ps1
.\scripts\run_backend.ps1   # sets MODEL_NAME/EMB_DIM/FAISS_* then runs uvicorn on :8000
```

The process is currently running in the background; its log is at
`C:\Users\danie\Archipedia\backend.run.log`.

## Why
The backend simply was not running — there was no crash/config blocker. The venv
(`navigator/.venv`, Python 3.12.5) and all data/index artifacts were already in
place, so it was a start-and-verify task, not a repair.

Note on the interpreter: `navigator/runtime.txt` / `render.yaml` pin Python
3.11.9 for Render, but the local venv is 3.12.5 and starts/serves cleanly. Per
project memory, 3.12 is the working local interpreter for this backend. Kept as-is.

## Env / secrets
No `.env` exists in the repo and none was created (no secrets invented). The app
loads config via `app/config.py` (pydantic-settings; all keys optional with
defaults) and reads `OPENAI_API_KEY` from the environment at request time.

- **No required key blocks startup or text search.** `OPENAI_API_KEY` is absent,
  so semantic text embedding is unavailable. `app/services/text_embedder.py`
  falls back to lexical keyword search (titles/typology/country/climate/full
  text), so `/search/text` still returns real, ranked results — just lexically
  ranked, not semantically. This matches the prior `backend.log`
  (`OPENAI_API_KEY not set, cannot embed text` followed by `200 OK`).
- To get true semantic text ranking later, set `OPENAI_API_KEY` (text-embedding
  -3-small) in the environment before launch. `GEMINI_API_KEY` is only needed for
  the `/generate` AI features and R2_* only for production image hosting (images
  are served from the public R2 CDN URL baked into the index, which resolves).

## Verify
- `GET http://127.0.0.1:8000/healthz` → `{"ok":true}`
- `GET http://127.0.0.1:8000/docs` → 200
- `GET http://127.0.0.1:8000/search/text?q=civic+concrete&top_k=12&page=1&page_size=12`
  → 12 results, `total_count:13`, `has_more:true` (lexical fallback ranking,
  top score ~0.2).
- Same query through the proxy `http://localhost:5173/search/text?...` → identical
  shape, 12 results. Proxy path confirmed.
- Image search: `GET /search/url?url=<corpus R2 image>&top_k=8` → 8 ranked
  results with DINOv2 + FAISS fusion weights. First call ~20s (model warmup),
  fast thereafter.

## Corpus size (deliverable #2 input)
- **669 indexed precedents** (projects) — `data/metadata/projects.csv` = 669 rows;
  text index `data/embeddings/text/text_index.npz` = (669, 1536); text project_ids
  = 669. This is the searchable precedent count.
- **13,411 image vectors** — `data/embeddings/id_map.json` entries (FAISS image
  index `index.faiss`). (FUNCTIONALITY_REPORT.md's "~2,000+ projects" is stale
  marketing copy; the live index holds 669.)

## Left / blockers
- **No blocker.** Backend is live and serving.
- Text search is lexical-only until `OPENAI_API_KEY` is set — acceptable for the
  demo but results are not semantically ranked (e.g. "civic concrete" surfaces a
  villa as #1). Set the key for semantic quality.
- First image search is slow (~20s) due to lazy DINOv2 warmup; subsequent calls
  are fast. Optional: trigger one warmup call after launch.
- Keep the background process alive for the demo. To restart, re-run the command
  above. To stop: kill the uvicorn/python process on :8000.

## Files
- `C:\Users\danie\Archipedia\navigator\app\main.py` — app + `/search/text`
  (GET line 1011, POST line 861), `/healthz`.
- `C:\Users\danie\Archipedia\navigator\app\config.py` — settings (all env optional).
- `C:\Users\danie\Archipedia\navigator\app\services\text_embedder.py` — keyword
  fallback when `OPENAI_API_KEY` is unset.
- `C:\Users\danie\Archipedia\navigator\scripts\run_backend.ps1` — documented start.
- `C:\Users\danie\Archipedia\backend.run.log` — current run log.
- Data: `navigator\data\metadata\projects.csv` (669),
  `navigator\data\embeddings\text\text_index.npz`,
  `navigator\data\embeddings\index.faiss` + `id_map.json` (13,411 images).
