/**
 * UploadPrivacyNote — a one-line, in-context assurance shown right at any image
 * upload control. The honest answer ("we don't store your uploads") already
 * lives in the privacy policy; this surfaces it at the moment of trust, which is
 * the gating question for confidential client material. `tone` adapts it to the
 * light app pages or the dark canvas.
 */
import { ShieldCheck } from "lucide-react";

export function UploadPrivacyNote({
  tone = "light",
  style,
}: {
  tone?: "light" | "dark";
  style?: React.CSSProperties;
}) {
  const fg = tone === "dark" ? "var(--studio-stone)" : "var(--ink-500)";
  const link = tone === "dark" ? "var(--studio-ink)" : "var(--ink-900)";
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--font-body)",
        fontSize: 11.5,
        lineHeight: 1.4,
        color: fg,
        ...style,
      }}
    >
      <ShieldCheck size={13} strokeWidth={1.75} style={{ flexShrink: 0 }} />
      <span>
        Processed in memory, never stored.{" "}
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: link, textDecoration: "underline", textUnderlineOffset: 2 }}
        >
          How we handle uploads
        </a>
      </span>
    </div>
  );
}

export default UploadPrivacyNote;
