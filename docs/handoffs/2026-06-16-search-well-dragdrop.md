# 2026-06-16 — Landing search well: real drag-and-drop image search

## What
The "Ready to start?" search well (`FinalCTA.tsx`) now honors its placeholder
("Describe a project, or drop a reference image"):

- Drag an image file onto the well → it runs a real image search.
- The `ImagePlus` button now opens a native file picker (click-to-pick), also
  feeding the working image-search flow (it previously dead-ended at the
  non-functional `/search/image` page).
- Drop-active visual state on the well (stronger ink ring + lift shadow,
  consistent with the existing focused state — concrete/ink only, no
  decorative Signal). Placeholder swaps to "Drop your reference image to
  search" while dragging.
- Non-image files are rejected with a toast; drag state resets on
  dragleave/drop (nested-element flicker handled via a dragDepth counter).
- If text is typed AND an image is dropped, both ride along → ClassicSearchPage
  runs a hybrid (image + text) search.

## Why
The placeholder promised drop-a-reference-image but nothing implemented it, and
the `ImagePlus` button routed to `/search/image`, a page that reads a dropped
file into a data-URL but never calls any API (dead end). The working image
path is `ClassicSearchPage` → `searchByImageFile` (POST multipart to
`/search/file`). This wires the landing well into that working path.

## Handoff mechanism (the hard part)
A `File` can't ride a URL param, and the persisted `searchStore`
(sessionStorage) can't hold a non-serializable live `File` either. Chosen
mechanism: a tiny transient module-level singleton —
`frontend/src/lib/pendingImageSearch.ts` (`setPendingImageSearch` /
`consumePendingImageSearch`). The well parks the File there and navigates to
`/search/classic`; `ClassicSearchPage` drains it **once on mount** (read +
clear) and calls `performSearch(query, file, emphasis)` — mirroring exactly how
the page already reads the initial `?q=` text query on mount. Read-and-clear
prevents a stale image re-firing on remount/back-navigation. Chosen over a
Zustand store (non-serializable File, no persistence wanted) and over wouter
state (not used elsewhere) for minimal footprint and consistency with the
existing mount-init pattern.

## Verify
1. Dev server already on :5173, backend on :8000 (do not restart).
2. Go to the landing page, scroll to the "Ready to start?" panel.
3. Drag an image file (JPG/PNG/WebP) from your desktop over the search well:
   the well shows the drop-active ring and the placeholder changes. Drop it →
   you land on `/search/classic` and image results render (the working
   `searchByImageFile` flow).
4. Click the image button (ImagePlus) → native picker opens; choose an image →
   same result.
5. Type a description, then drop an image → hybrid search runs.
6. Drag a non-image file (e.g. a .txt/.pdf) → toast rejection, no navigation.
7. Drag over then off the well without dropping → drop-active state clears.
8. `cd frontend && npx vite build` → builds clean (verified: built in ~19s; the
   only warning is the pre-existing >500 kB chunk-size note).

## Left / follow-ups
- The standalone `/search/image` page (`ImageSearchPage.tsx`) remains a dead
  end; out of scope here. Consider redirecting it through the same pending-image
  hand-off or removing it.
- No automated test added (no existing test harness touched); manual verify
  steps above cover it.

## Files
- `frontend/src/lib/pendingImageSearch.ts` (new) — transient File hand-off.
- `frontend/src/components/landing/FinalCTA.tsx` — drag/drop + file picker +
  drop-active UI; ImagePlus now opens picker instead of routing to dead page.
- `frontend/src/pages/ClassicSearchPage.tsx` — mount effect drains the pending
  image and runs an image (or hybrid) search.
