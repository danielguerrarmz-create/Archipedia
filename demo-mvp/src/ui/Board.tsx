import { useState } from "react";
import { PinnedCard } from "../brand/PinnedCard";
import { citation, hash, metaLine } from "../data";
import type { DemoData, Project } from "../types";

export function Board({
  data,
  ids,
  photos,
  onOpen,
  onRemove,
  onClear,
}: {
  data: DemoData;
  ids: string[];
  photos: Record<string, number>;
  onOpen: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");
  const items = ids.map((id) => data.byId.get(id)).filter((p): p is Project => !!p);

  const copy = async () => {
    try {
      const accessed = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
      await navigator.clipboard.writeText(items.map((p) => citation(p, accessed)).join("\n"));
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
    window.setTimeout(() => setCopied("idle"), 2200);
  };

  return (
    <section className="board" id="board" aria-labelledby="board-title">
      <div className="container">
        <div className="board__head">
          <div>
            <p className="mono-caps eyebrow">Your board</p>
            <h2 id="board-title" className="section-title">
              Your precedent study
            </h2>
          </div>
          {items.length > 0 && (
            <div className="board__actions">
              <button type="button" className="btn-ink" onClick={copy}>
                {copied === "ok" ? "Citations copied" : copied === "fail" ? "Copy failed" : "Copy citations"}
              </button>
              <button type="button" className="link-quiet" onClick={onClear}>
                Clear board
              </button>
            </div>
          )}
        </div>

        <div className="board__surface">
          {items.length === 0 ? (
            <p className="board__empty">
              Nothing pinned yet. Pin buildings from the canvas results or a close-up. Each one keeps its full
              credit, year and source, ready to cite.
            </p>
          ) : (
            <ul className="board__grid">
              {items.map((p) => {
                const h = hash(p.id);
                return (
                  <li key={p.id} style={{ ["--rot" as string]: `${(((h % 1000) / 1000) - 0.5) * 6}deg` }}>
                    <button type="button" className="pin-tile__hit" onClick={() => onOpen(p.id)} aria-label={`Study ${p.title}`}>
                      <PinnedCard
                        thumb={p.images[photos[p.id] ?? 0] ?? p.image}
                        title={p.title}
                        meta={metaLine(p)}
                        aspect={1.25}
                        pinSize={26}
                        seed={h % 97}
                        pinXPct={40 + (h % 20)}
                        tilt={-12 - (h % 12)}
                      />
                    </button>
                    <button type="button" className="pin-toggle" onClick={() => onRemove(p.id)} aria-label={`Remove ${p.title} from board`}>
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <p className="sr-only" aria-live="polite">
          {copied === "ok" ? "Citations copied to clipboard" : ""}
        </p>
      </div>
    </section>
  );
}
