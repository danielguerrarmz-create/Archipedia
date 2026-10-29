/**
 * HowItWorksPage — explains Archipedia's image-embedding search and the three
 * fusion weights (Visual / Spatial / Regional) that reshape results ranking.
 *
 * Pure presentational — no new dependencies.
 * Uses brand tokens from tokens.css (Concrete & Signal system).
 *
 * Route: /how-it-works
 */
import { LandingTopBar } from "../components/landing/LandingTopBar";
import { LandingFooter } from "../components/landing/LandingFooter";

// ─── Shared style constants ────────────────────────────────────────────────

const PAGE: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "var(--concrete-50)",
  fontFamily: "var(--font-body)",
};

const CONTAINER: React.CSSProperties = {
  maxWidth: 760,
  margin: "0 auto",
  padding:
    "clamp(48px, 8vw, 96px) clamp(20px, 5vw, 40px) clamp(64px, 10vw, 120px)",
};

const H1: React.CSSProperties = {
  fontFamily: "var(--font-editorial)",
  fontWeight: 400,
  fontSize: "clamp(32px, 5vw, 52px)",
  lineHeight: 1.15,
  color: "var(--ink-900)",
  marginBottom: 16,
  marginTop: 0,
};

const META: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "var(--ink-400)",
  marginBottom: 48,
};

const INTRO: React.CSSProperties = {
  fontSize: 17,
  lineHeight: 1.7,
  color: "var(--ink-700)",
  marginBottom: 40,
  maxWidth: "68ch",
};

const SECTION: React.CSSProperties = {
  marginBottom: 56,
};

const H2: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 14,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "var(--ink-900)",
  marginBottom: 14,
  marginTop: 0,
};

const P: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.7,
  color: "var(--ink-700)",
  marginBottom: 14,
  marginTop: 0,
  maxWidth: "72ch",
};

const UL: React.CSSProperties = {
  margin: "0 0 14px 0",
  padding: "0 0 0 20px",
  maxWidth: "70ch",
};

const LI: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.7,
  color: "var(--ink-700)",
  marginBottom: 6,
};

const HAIRLINE: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid var(--hairline)",
  margin: "48px 0",
};

// Weight block: a labeled callout card for each dimension
const WEIGHT_CARD: React.CSSProperties = {
  border: "1px solid var(--hairline-strong)",
  borderRadius: "var(--radius-md)",
  padding: "24px 28px",
  background: "var(--concrete-100)",
  marginBottom: 32,
};

const WEIGHT_LABEL: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: "var(--ink-400)",
  marginBottom: 4,
  display: "block",
};

const WEIGHT_TITLE: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 18,
  color: "var(--ink-900)",
  marginBottom: 12,
  marginTop: 0,
};

const WEIGHT_DESCRIPTOR: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.06em",
  color: "var(--ink-400)",
  marginBottom: 16,
  display: "block",
};

const EXAMPLE_BOX: React.CSSProperties = {
  borderLeft: "2px solid var(--hairline-strong)",
  paddingLeft: 16,
  marginTop: 16,
};

const EXAMPLE_LABEL: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "var(--ink-400)",
  marginBottom: 6,
  display: "block",
};

const TIPS_CARD: React.CSSProperties = {
  border: "1px solid var(--hairline)",
  borderRadius: "var(--radius-md)",
  padding: "20px 24px",
  background: "var(--concrete-50)",
};

// ─── Component ────────────────────────────────────────────────────────────

export function HowItWorksPage() {
  return (
    <div style={PAGE}>
      <LandingTopBar />

      <main style={CONTAINER}>
        <h1 style={H1}>How Search Works</h1>
        <p style={META}>Visual similarity · Fusion weights · Tuning</p>

        {/* ── Intro ── */}
        <p style={INTRO}>
          Archipedia finds precedents through image — not keywords. Every project
          in the index is encoded as a high-dimensional embedding vector derived
          from its photographs. When you search, your query (an uploaded image or
          a text description converted to the same vector space) is compared
          against those embeddings; the results ranked closest in that space come
          back first.
        </p>
        <p style={{ ...P, marginBottom: 0 }}>
          Three weights — Visual, Spatial, and Regional — let you shift how much
          each dimension of that embedding contributes to the final ranking. They
          are normalised to a combined total of 100%, so raising one automatically
          redistributes across the others.
        </p>

        <hr style={HAIRLINE} />

        {/* ── How the embedding works ── */}
        <section style={SECTION}>
          <h2 style={H2}>From photograph to ranked list</h2>

          <p style={P}>
            Every project in the index is read by a vision model that turns its
            photographs into a numeric “fingerprint” — a compact description of its
            form, surface, and material, learned from looking at a great deal of
            architecture. The whole catalogue of fingerprints is searchable in a
            fraction of a second.
          </p>
          <p style={P}>
            When you search, your query (a description or an image) gets the same
            fingerprint, and the engine finds the projects whose fingerprints sit
            closest to it. That visual closeness is the starting point. Before
            results are shown, it blends in two more signals — how a building is
            organized, and the climate it responds to — in the proportions you set
            with the fusion weights, producing the final ranking.
          </p>
          <p style={P}>
            The three weights correspond to three different aspects of a project
            that a designer might want to prioritise when hunting for precedents.
          </p>
        </section>

        <hr style={HAIRLINE} />

        {/* ── The three weights ── */}
        <section style={SECTION}>
          <h2 style={H2}>The three fusion weights</h2>

          {/* Visual */}
          <div style={WEIGHT_CARD}>
            <span style={WEIGHT_LABEL}>Default 100%</span>
            <h3 style={WEIGHT_TITLE}>Visual</h3>
            <span style={WEIGHT_DESCRIPTOR}>Form, facade &amp; material</span>
            <p style={{ ...P, marginBottom: 8 }}>
              Controls how much pure visual resemblance drives the ranking. A high Visual weight surfaces projects whose exteriors,
              facades, material textures, and overall formal language closely
              resemble your reference — the model responds to light, surface
              quality, and silhouette as read from the photographs.
            </p>
            <p style={{ ...P, marginBottom: 0 }}>
              Lowering Visual gives the other two dimensions room to pull results
              that share organisational or contextual logic even when they look
              quite different on the surface.
            </p>
            <div style={EXAMPLE_BOX}>
              <span style={EXAMPLE_LABEL}>Example</span>
              <p style={{ ...P, marginBottom: 0, fontSize: 14 }}>
                Upload a photograph of a board-formed concrete pavilion with
                Visual at 100% and you will see other projects that share that
                specific material texture and tectonic register. Dial it to 50%
                and results may include timber or masonry structures that share
                the same massing logic.
              </p>
            </div>
          </div>

          {/* Spatial */}
          <div style={WEIGHT_CARD}>
            <span style={WEIGHT_LABEL}>Default 0%</span>
            <h3 style={WEIGHT_TITLE}>Spatial</h3>
            <span style={WEIGHT_DESCRIPTOR}>Massing &amp; organization</span>
            <p style={{ ...P, marginBottom: 8 }}>
              Shifts emphasis toward how a building is organized in space — its
              massing strategy (courtyard, linear, cluster, tower, and so on)
              rather than how it looks. Raising Spatial pulls that organizational
              signal into the ranking.
            </p>
            <p style={{ ...P, marginBottom: 0 }}>
              Use Spatial when you care about organisational logic — a courtyard
              building is the reference type, and you want results that share that
              plan strategy regardless of cladding or location. Because the
              spatial signal is derived from structured metadata rather than
              image features, it is broadly categorical; expect results to cluster
              around massing families rather than specific proportional details.
            </p>
            <div style={EXAMPLE_BOX}>
              <span style={EXAMPLE_LABEL}>Example</span>
              <p style={{ ...P, marginBottom: 0, fontSize: 14 }}>
                Searching a museum with a linear gallery sequence at high Spatial
                weight will surface other projects with a similar organisational
                type — even if their material language, scale, or region differs
                substantially from the reference.
              </p>
            </div>
          </div>

          {/* Regional */}
          <div style={WEIGHT_CARD}>
            <span style={WEIGHT_LABEL}>Default 0%</span>
            <h3 style={WEIGHT_TITLE}>Regional</h3>
            <span style={WEIGHT_DESCRIPTOR}>Climate &amp; context</span>
            <p style={{ ...P, marginBottom: 8 }}>
              Brings climate and context into the ranking. It draws on each
              project's climate classification and locale, so raising Regional
              biases results toward projects from similar climatic and
              environmental conditions.
            </p>
            <p style={{ ...P, marginBottom: 0 }}>
              This is most useful when climate-responsive design is central to
              your research question — passive cooling strategies in hot-arid
              climates, say, or heavy-insulation envelope details from subarctic
              contexts. Note that attribute signals are broadly categorical; the
              filter shifts the population of likely results but does not
              guarantee granular climate-class precision.
            </p>
            <div style={EXAMPLE_BOX}>
              <span style={EXAMPLE_LABEL}>Example</span>
              <p style={{ ...P, marginBottom: 0, fontSize: 14 }}>
                Searching a Mediterranean villa with Regional weighted to 40%
                will pull results from other warm, dry contexts, favouring sun
                shading and courtyard ventilation strategies over visually
                similar projects sited in temperate northern climates.
              </p>
            </div>
          </div>
        </section>

        <hr style={HAIRLINE} />

        {/* ── Tuning tips ── */}
        <section style={SECTION}>
          <h2 style={H2}>Tuning tips</h2>
          <div style={TIPS_CARD}>
            <ul style={{ ...UL, marginBottom: 0 }}>
              <li style={LI}>
                <strong>Start with the defaults.</strong> Visual at 100%,
                Spatial and Regional at 0% is the best general starting point.
                Pure visual search already captures more spatial and material
                nuance than it might seem.
              </li>
              <li style={LI}>
                <strong>Add Spatial when form matters more than image.</strong>{" "}
                If your reference photograph is atypical (a construction photo,
                an interior, a detail) but you want buildings with the same
                organisational strategy, increase Spatial to 30–50%.
              </li>
              <li style={LI}>
                <strong>Add Regional to ground-truth a climate study.</strong>{" "}
                When the research brief is climate-specific, set Regional to
                20–40%. Keep Visual high enough (40%+) so results still look
                architecturally coherent.
              </li>
              <li style={LI}>
                <strong>Use the canvas filters alongside weights.</strong> The
                typology and climate chip-filters in the Research panel are hard
                exclusions — they remove non-matching results entirely before
                ranking. The fusion weights reshape the ranking within the
                remaining pool. Both tools work together.
              </li>
              <li style={LI}>
                <strong>Weights reset per session.</strong> The canvas remembers
                your weights within a tab; opening a new tab returns them to the
                default (Visual 100%, Spatial 0%, Regional 0%). Set them first if
                you have a preferred configuration before running a workflow.
              </li>
            </ul>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

export default HowItWorksPage;
