import * as React from "react";
import { cn } from "./utils";

/*
 * Concrete & Signal skeleton — concrete-100 + hairline, opacity breathe 1→.6.
 * NOT a glass sweep. Honors prefers-reduced-motion.
 */

if (typeof document !== "undefined" && !document.getElementById("an-skeleton-styles")) {
  const s = document.createElement("style");
  s.id = "an-skeleton-styles";
  s.textContent = `
    @keyframes an-breathe {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    .an-skeleton {
      animation: an-breathe var(--dur-3, 420ms) ease-in-out infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      .an-skeleton { animation: none !important; opacity: 0.8; }
    }
  `;
  document.head.appendChild(s);
}

function Skeleton({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("an-skeleton", className)}
      style={{
        borderRadius: "var(--radius-md)",
        background: "var(--concrete-100)",
        boxShadow: "0 0 0 1px var(--hairline)",
        ...style,
      }}
      {...props}
    />
  );
}

export { Skeleton };
