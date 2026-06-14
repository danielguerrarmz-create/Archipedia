# Persona 02 — Dev Raman, Intermediate Designer (3–5 years)

> *"Show me real, built work with the detail intact, or get out of my way. I don't
> have time for a mood board — I have a wall section due Thursday."*

## Snapshot

- **Age range:** 27–31
- **Role:** Project architect / intermediate designer at a 40-person firm doing
  mid-size institutional and multifamily work.
- **Years in practice:** 3–5. Has carried at least two buildings from SD through
  CDs into CA — he's stood on site and watched a detail he drew get built (or fail).
- **Authority:** Mid. Runs his own scope on a project, directs an intern (often the
  Maya persona), answers to a Senior/Principal.
- **What he does all day:** construction documents, detailing, wall sections,
  redlines, RFIs, submittals, coordination with consultants, and precedent hunts
  that are about *how it's actually built* — flashing, reveals, material transitions.
- **Tools:** Revit (primary, all day), Rhino for form studies, AutoCAD for legacy
  details, Bluebeam for markups, Enscape for client views, Procore/Newforma for CA.
  Detail libraries, manufacturer cut sheets, his own firm's standard-details folder.
  Less Pinterest, more "find me the project that solved this exact junction."

## Goals

1. **Find precedent for a specific technical/material problem**, not vibes — "how
   did someone detail a board-formed concrete-to-curtainwall transition."
2. **Verify it's real and built**, with enough provenance to trust and cite.
3. **Do it fast, under deadline**, without leaving his Revit-centered workflow for long.
4. **Hand a clean, credible reference set** to his intern or up to his Senior.
5. **Not get burned** by a tool that gives plausible-but-wrong results he then
   propagates into a CD set or a client conversation.

## Context & a day-in-the-life

Deadline Tuesday for a 50% CD set. Dev is detailing a rainscreen-to-window-head
condition and wants to see how three referenced projects handled it. He has the
project images but not the *detail logic*; he needs precedents with similar
material/assembly so he can defend his approach to the Senior and to the GC. He
opens Arch Daily and Detail magazine's archive, gets gorgeous hero shots and almost
no construction info. He's deeply skeptical of anything that smells like AI fluff —
he's been burned by confidently-wrong tools. He values a tool that knows the
difference between *looks like* and *is*.

## How he'd use Archipedia

- Upload a reference image of the material/assembly he's chasing and use visual
  similarity to find *built* projects with the same tectonic register.
- Lean on the **Visual** fusion weight (he read How-It-Works once, agreed with
  "start at Visual 100%") and only dial in Spatial/Regional when the brief demands.
- Filter hard by typology/climate to cut noise, then sort by best match.
- Pull 3–4 verified precedents, confirm architect/year/location, export a tight
  reference sheet for the set and for his Senior's review.
- Use "Search like this" to chain from a known-good precedent to its visual cousins.

## Pain points & what would make him churn

- **Fabricated or mock results, full stop.** If the tool ever shows him a building
  that isn't real (or silently falls back to fake data when the backend is down),
  he's gone and he'll tell the office not to trust it. This is his #1 dealbreaker.
- **Thin provenance.** No architect, no year, no location = unusable for a CD set
  or a defensible argument. "Unknown Architect" everywhere reads as a scraped toy.
- **Silent failure.** A button that does nothing, a search that spins forever, an
  error he can't distinguish from "I searched wrong" — wastes his scarce time.
- **Forced detours.** If he has to learn a node-graph visual-programming language to
  get a result, he's back in Revit and Detail magazine.

## What would delight him

- Honest, real, built results with full provenance, fast — every time.
- Image-in → visually-true matches that surface the *tectonic* relationship a
  keyword search ("rainscreen detail") would never connect.
- A blunt, useful error contract: "index is down, retry" — not a fake result, not a
  dead spinner. Honesty earns his trust faster than features.
- A clean export he can drop straight into a set or a review with credits intact.

## Success metric

For a specific detailing/material question, he gets 3–4 *verified, real, fully-cited*
precedents in under 5 minutes and trusts them enough to reference in a set — with
zero instances of fabricated data, ever.

## First-run review

**First 60 seconds.** He ignores the cinematic splash copy — he's seen a hundred
landing pages — and goes straight for the search. He types a precise query, or
better, wants to upload a reference. He appreciates that the Classic page has a real
filter sidebar (typology, country, climate), a sort control, and skeleton loaders —
"okay, someone who's used a real tool built this." The match-reason labels (Visual
similarity / Balanced match) are a good signal he's looking for.

**Where he gets confused / hits an error.** Backend off: the Classic search shows
"Couldn't reach the index — check your connection." *Good.* That's the correct
behavior and it earns trust — he knows it's down, not that he's stupid. Then he
wanders to the **Canvas**, runs a text search, and gets results that *look real but
are mock data* (the `performTextSearch` fallback). **This is the moment he'd churn.**
A precedent tool that invents buildings is, to him, worse than useless — it's a
liability he could carry into a CD set. He'd also notice the **RUN** button does
nothing visible on failure. The divergence between "honest on one page, fake on
another" tells him the team hasn't decided whether to be trustworthy.

**What feels weak/static.** The canvas precedent nodes and compact results grid
show thinner metadata than the Classic cards — he can't always see architect/year
where he'd actually act. The node graph (operators, generate, validate) is
impressive but irrelevant to his job; he wants results, not a pipeline.

**Fixes he'd ask for (prioritized):**
1. **Never fabricate. Kill the canvas mock fallback.** If the index is down, say so
   everywhere, identically. One fake building loses me forever. (→ F1)
2. **Every result, everywhere, carries architect · project · location · year.** If
   it's genuinely unknown, say "Architect unrecorded" — don't hide it, don't fake
   it. (→ F4)
3. **RUN must report.** Running state, then results or an honest error with retry.
   A no-op button reads as a broken product. (→ F2)
4. **One consistent "is the service up?" signal** so I never confuse "down" with "I
   queried wrong." (→ F3)
5. **Let me work image-first and stay on the fast path** — upload, filter, sort,
   export — without being routed through a node graph I don't need.
