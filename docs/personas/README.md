# Archipedia — User Personas

Four personas for **Archipedia**, an architectural precedent search engine:
*describe a building or upload a reference image → get visually-similar real built
projects → collect them on a node-graph canvas → export PDF sheets.*

These are not marketing personas. They are **design and QA instruments** — a fixed
cast we run the product through to catch the problems a single "average user" lens
hides. Architecture practice is steeply hierarchical, and the same screen reads
completely differently to a 3rd-year intern hunting references for their boss than
to a Principal deciding whether to put client work into a third-party tool. The
personas encode that spread.

## The cast

| # | Persona | Years | Core job-to-be-done on Archipedia |
|---|---------|-------|-----------------------------------|
| 1 | [Maya Okonkwo — Architecture Student](01-architecture-student.md) | 3rd year (intern) | Hunt references fast for the boss + studio; build precedent/mood boards that beat Pinterest |
| 2 | [Dev Raman — Intermediate Designer](02-intermediate-designer.md) | 3–5 yrs | Pull *accurate, real, buildable* material & detail precedent under deadline |
| 3 | [Lena Vasquez — Senior Architect](03-senior-architect.md) | 10+ yrs | Set design language; build defensible precedent lineage; present to clients & teams |
| 4 | [Marcus Feldt — Principal / Owner](04-principal-owner.md) | 0–30 yrs | Win work, protect the brand & client data, judge ROI of adopting the tool |

## How to use them

**In design.** Before shipping a flow, walk it once per persona. A feature that
delights Maya (speed, "cool factor") can actively repel Marcus (where does my
client's competition brief go?). Design for the *spread*, not the average. When two
personas conflict, the tie-breaker is: the lower-authority persona is the daily
*operator*; the higher-authority persona is the *adopter/gatekeeper*. You need both.

**In QA.** Each persona file ends with a `## First-run review` written in that
persona's voice — what they notice in 60 seconds, where they hit an error, what
feels weak, and 3–5 prioritized fixes. Use these as exploratory test charters.
Re-run them whenever the splash, search, or canvas changes materially.

**Reading the reviews honestly.** These reviews were written against the live
frontend with the **backend OFF in dev** — so search/RUN calls fail. That is a
*temporary dev condition*, but it surfaced a real, shippable product bug worth
keeping: the **Classic search page fails honestly** (shows an "Couldn't reach the
index" error panel, no fake results) while the **Canvas search silently falls back
to mock data** (`ResultsPage.performTextSearch` catch block) and the **RUN button
swallows failures into `console.error`**. The personas all trip over this
divergence; it is the spine of the consolidated findings below.

## Consolidated findings (P0/P1/P2)

Aggregated across all four personas, highest value first. P0 = blocks trust or the
core task; P1 = materially hurts adoption/credibility; P2 = polish that compounds.
"Personas" column shows who independently flagged it (M=Maya, D=Dev, L=Lena,
Mk=Marcus).

| ID | Pri | Finding | Why it hurts (persona lens) | Concrete fix |
|----|-----|---------|------------------------------|--------------|
| F1 | **P0** | **Canvas search silently returns mock/fake results on backend failure**, while Classic search honestly shows an error panel. | D/L/Mk: a precedent tool that invents results is worse than one that says "down." Dev would cite a fake building in a CD set; Lena would defend fabricated lineage in a review; Marcus sees a trust/liability bomb. | Delete the `mockProjects` fallback in `ResultsPage.performTextSearch` catch block. Surface the same `SearchError`/`ErrorPanel` treatment the Classic page uses. Never render fabricated precedent. |
| F2 | **P0** | **RUN button has no user-facing feedback on failure** — `executeWorkflow()` failures go only to `console.error`. | All four: the one Signal action on the canvas appears to do nothing. Maya assumes she broke it; Marcus assumes the product is broken. | On RUN: show a running state on the button, then a toast/inline error on failure ("Couldn't reach the index — results not updated") with a retry. Mirror Classic's honest error contract. |
| F3 | **P0** | **No global "service unavailable / backend down" signal.** Each surface fails differently and silently. | D/Mk: users can't tell "I searched wrong" from "the system is down." Erodes trust on first run. | Add a single connection/health state (banner or status chip) when the index is unreachable, consistent across splash, Classic, and Canvas. |
| F4 | **P1** | **Citation provenance is uneven between surfaces.** Hero/Classic cards carry architect · country · INDEXED; canvas precedent nodes and the compact results grid show thinner metadata (often no architect/year). | M/L: the whole pitch is "citations that hold up in review." Maya needs architect+year to cite; Lena needs defensible lineage. Thin metadata on the canvas undercuts the core promise. | Guarantee architect, project, location, year on every precedent representation — card, compact grid row, canvas node, and export. Show "Architect unrecorded" explicitly rather than omitting. |
| F5 | **P1** | **The canvas node-graph is high-ceiling but has a steep, unexplained on-ramp.** 12 node types, operators (AND/OR/NOT), fusion weights, generate/validate — no inline "what is this / why would I."  | M/D: Maya wants a faster Pinterest, not a visual-programming IDE; Dev wants results now, not to learn a graph language. Both may bounce before reaching value. | Keep the graph for power users but make the *default* path one-click: land on Canvas with a pre-wired Text→Results graph already populated (the query from the splash), results visible, RUN already run. Templates should be the hero of EmptyCanvas, node primitives secondary. |
| F6 | **P1** | **Two visual languages (light "concrete" pages vs. dark "studio" canvas) with no transition or explanation.** | L/Mk: feels like two products stitched together; weakens the "elevates the firm's output" brand argument. | Intentional, narrated handoff into the dark canvas (a brief transition / a one-line "This is your studio canvas"), and reconcile token systems (`--concrete-*` vs `--studio-*`) so headers/controls feel continuous. |
| F7 | **P1** | **Data-security / client-confidentiality story is buried in the Privacy Policy, not surfaced where it's decided.** Upload + "we don't store images" is exactly Marcus's gating question. | Mk: a Principal won't upload a confidential competition image without an in-context assurance. Lena fields the same client question. | Surface a short, plain-language "What happens to my uploads" assurance at the *upload point* and on an enterprise/security page — not only in §1 of the legal policy. |
| F8 | **P2** | **Fusion Weights panel is powerful but unguided in-context.** Defaults differ between docs (How-It-Works says Visual 100% / 0 / 0; canvas says 33/33/34) — and the panel shows before any search. | D/L: skepticism of "fluff" — inconsistent defaults read as untrustworthy. The control appears before it can do anything. | Reconcile the documented vs. actual default weights. Hide/disable the weights panel until results exist, or add a one-line "what changes when I move this" preview. |
| F9 | **P2** | **Empty/loading/error states are inconsistent in quality across surfaces.** Classic has skeletons + ErrorPanel + suggestion chips; Canvas empty-state is sparse; node results panel has thin empty/error handling. | M/D: first-run confidence comes from never seeing a dead screen. The canvas can feel "static/broken" when nothing's wired. | Bring Canvas + node-results panel up to the Classic page's bar: skeletons while RUN executes, explicit empty copy, honest error with retry. |
| F10 | **P2** | **No obvious "save / it's mine" trust loop on the canvas** — where do my boards live, can I get back to them, is my work auto-saved? | Mk/L: ambiguity about persistence + sharing ("Shared boards are accessible to anyone with the link") is a quiet adoption blocker for client work. | Visible autosave/"saved" indicator, a clear path to "My boards," and explicit, in-UI share-scope controls (private vs. anyone-with-link). |

### Suggested sequencing
1. **F1, F2, F3** together — one honest, consistent failure contract across all
   surfaces. This is the credibility floor; nothing else matters if the tool can
   silently lie or silently no-op.
2. **F4, F5** — make the core promise (citable precedent) and the core path
   (search → collect) land fast and intact.
3. **F6, F7, F8, F9, F10** — cohesion, trust, and polish that drive adoption up
   the seniority ladder.
