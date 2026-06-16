/**
 * pendingImageSearch — a tiny transient hand-off for a dropped reference image.
 *
 * A `File` is a live, non-serializable in-memory object, so it can't travel
 * through the URL (only `?q=` text does) nor through the persisted
 * `searchStore` (sessionStorage). When the landing search well receives a
 * dropped/picked image, it parks the File here and navigates to
 * `/search/classic`. ClassicSearchPage drains it exactly once on mount —
 * mirroring how it reads the initial `?q=` query — and runs an image search.
 *
 * Deliberately a module-level singleton (not a store): the value is meant to
 * be consumed immediately and never persisted or shared across tabs.
 */
let pending: File | null = null;

/** Park a dropped/picked image for the next ClassicSearchPage mount. */
export function setPendingImageSearch(file: File): void {
  pending = file;
}

/**
 * Read and clear the pending image (one-shot). Returns null if nothing is
 * waiting. Clearing on read prevents a stale image from re-firing on a later
 * remount or back-navigation.
 */
export function consumePendingImageSearch(): File | null {
  const file = pending;
  pending = null;
  return file;
}
