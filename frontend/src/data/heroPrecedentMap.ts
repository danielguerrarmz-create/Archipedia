/**
 * heroPrecedentMap — the scaffold for the hero's ANNOTATED precedent diagrams.
 *
 * The hero rotates through several famous SUBJECT projects. For each, it points
 * at the project's formal moves and names a precedent that move resembles — and
 * those precedents come from the PAST (historical) and the "future" (later or
 * more visionary work). This is exactly what the engine does: it reads geometry
 * and material and surfaces what a building most resembles by VISUAL proximity
 * (not tags) — so every pin is framed honestly as a resemblance/lineage with a
 * match score, never an asserted citation.
 *
 * Images are high-resolution, openly-licensed photographs from Wikimedia Commons.
 * Swap for in-house R2 assets when those exist at sufficient resolution.
 * To extend: add another HeroSubjectMap to `heroSubjects`.
 */

const W = (file: string, width = 720) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;

export interface PrecedentSource {
  project: string;
  architect: string;
  year: string;
  place: string;
  /** past = historical lineage; future = later / more visionary echo */
  era: "past" | "future";
  thumb: string;
}

export interface PrecedentPin {
  id: string;
  x: number; // % of width
  y: number; // % of height
  component: string;
  match: number;
  side: "left" | "right";
  source: PrecedentSource;
}

export interface HeroSubjectMap {
  project: string;
  architect: string;
  year: string;
  place: string;
  image: string;
  alt: string;
  pins: PrecedentPin[];
}

export const heroSubjects: HeroSubjectMap[] = [
  {
    project: "Salk Institute",
    architect: "Louis Kahn",
    year: "1965",
    place: "La Jolla",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Salk_Institute_for_Biological_Studies_and_a_seagull_dllu.jpg/1920px-Salk_Institute_for_Biological_Studies_and_a_seagull_dllu.jpg",
    alt: "Salk Institute by Louis Kahn — symmetrical concrete laboratory blocks framing a travertine plaza split by a single water channel.",
    pins: [
      {
        id: "concrete-light",
        x: 18,
        y: 47,
        component: "Board-formed concrete, cut by light",
        match: 91,
        side: "right",
        source: { project: "Church of the Light", architect: "Tadao Ando", year: "1989", place: "Osaka", era: "future", thumb: W("Church of Light.JPG") },
      },
      {
        id: "axis",
        x: 50,
        y: 33,
        component: "The axis, held open to the sky",
        match: 94,
        side: "left",
        source: { project: "Court of the Lions, Alhambra", architect: "Nasrid builders", year: "14th c.", place: "Granada", era: "past", thumb: W("Pavillon Cour des Lions Alhambra Granada Spain.jpg") },
      },
      {
        id: "travertine",
        x: 82,
        y: 62,
        component: "A travertine court below",
        match: 88,
        side: "left",
        source: { project: "Getty Center", architect: "Richard Meier", year: "1997", place: "Los Angeles", era: "future", thumb: W("J. Paul Getty Museum courtyard.jpg") },
      },
    ],
  },
  {
    project: "Sydney Opera House",
    architect: "Jørn Utzon",
    year: "1973",
    place: "Sydney",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Sydney_%28AU%29%2C_Opera_House_--_2019_--_3054.jpg/1920px-Sydney_%28AU%29%2C_Opera_House_--_2019_--_3054.jpg",
    alt: "Sydney Opera House by Jørn Utzon — white tiled shells rising from a monumental podium on the harbour.",
    pins: [
      {
        id: "shells",
        x: 52,
        y: 38,
        component: "The vaulted shells",
        match: 92,
        side: "left",
        source: { project: "Sagrada Família", architect: "Antoni Gaudí", year: "1882–", place: "Barcelona", era: "past", thumb: W("Sagrada Familia interior 1.jpg") },
      },
      {
        id: "podium",
        x: 30,
        y: 74,
        component: "The monumental podium",
        match: 87,
        side: "right",
        source: { project: "El Castillo, Chichén Itzá", architect: "Maya builders", year: "9th c.", place: "Yucatán", era: "past", thumb: W("Chichen Itza 3.jpg") },
      },
      {
        id: "public-roof",
        x: 78,
        y: 50,
        component: "Architecture as public landscape",
        match: 85,
        side: "left",
        source: { project: "Oslo Opera House", architect: "Snøhetta", year: "2008", place: "Oslo", era: "future", thumb: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Sur_le_toit_de_marbre_de_lop%C3%A9ra_dOslo_%28Norv%C3%A8ge%29_%284825741151%29.jpg" },
      },
    ],
  },
];

/** Back-compat default (first subject). */
export const heroSubject = heroSubjects[0];
