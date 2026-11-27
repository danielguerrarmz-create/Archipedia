/**
 * heroBoardPrecedents — the cycling pool for the hero inspiration board.
 *
 * The board pins up a RANDOM subset of these each refresh (with a random scatter
 * layout), so the wall feels alive and different every visit. It combines the
 * live-index R2 thumbs (heroPrecedents) with a curated set of canonical,
 * instantly-recognisable works — deliberately spanning architecture, landscape,
 * and urbanism so the board reads as "everyone shaping the built environment,"
 * not buildings-only. Curated imagery is openly-licensed from Wikimedia Commons.
 */
import { heroPrecedents, type HeroPrecedent } from "./heroPrecedents";

const curated: HeroPrecedent[] = [
  { id: "c_fallingwater", title: "Fallingwater", architect: "Frank Lloyd Wright", country: "USA", typology: "house", theme: "house over a waterfall",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Wrightfallingwater.jpg/960px-Wrightfallingwater.jpg" },
  { id: "c_barcelona_pavilion", title: "Barcelona Pavilion", architect: "Mies van der Rohe", country: "Spain", typology: "pavilion", theme: "modernist pavilion",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/7/78/Jfader_barca_pavillion.jpg" },
  { id: "c_guggenheim_bilbao", title: "Guggenheim Bilbao", architect: "Frank Gehry", country: "Spain", typology: "museum", theme: "titanium museum",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Guggenheim_Bilbao._Exterior.jpg/960px-Guggenheim_Bilbao._Exterior.jpg" },
  { id: "c_therme_vals", title: "Therme Vals", architect: "Peter Zumthor", country: "Switzerland", typology: "baths", theme: "stone thermal baths",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/2005-08-06-Therme-Vals-Peter-Zumthor_05.jpg/960px-2005-08-06-Therme-Vals-Peter-Zumthor_05.jpg" },
  { id: "c_central_park", title: "Central Park", architect: "Olmsted & Vaux", country: "USA", typology: "urban park", theme: "urban park",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/AERIAL_VIEW_LOOKING_SOUTH_ACROSS_CENTRAL_PARK_-_NARA_-_547707.jpg/960px-AERIAL_VIEW_LOOKING_SOUTH_ACROSS_CENTRAL_PARK_-_NARA_-_547707.jpg" },
  { id: "c_gardens_by_the_bay", title: "Gardens by the Bay", architect: "Grant Associates", country: "Singapore", typology: "garden", theme: "supertree garden",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Supertree_Grove%2C_Gardens_by_the_Bay%2C_Singapore1.jpg/960px-Supertree_Grove%2C_Gardens_by_the_Bay%2C_Singapore1.jpg" },
  { id: "c_superkilen", title: "Superkilen", architect: "BIG + Topotek 1 + Superflex", country: "Denmark", typology: "public space", theme: "urban public space",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Copenhagen_is_my_favourite_place._This_is_N%C3%B8rrebro_and_Superkilen_%28explore%29_-_Flickr_-_Maria_Eklind.jpg/960px-Copenhagen_is_my_favourite_place._This_is_N%C3%B8rrebro_and_Superkilen_%28explore%29_-_Flickr_-_Maria_Eklind.jpg" },
  { id: "c_high_line", title: "The High Line", architect: "Field Operations + DS+R", country: "USA", typology: "linear park", theme: "elevated linear park",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/High_Line%2C_New_York_2012_39.jpg/1280px-High_Line%2C_New_York_2012_39.jpg" },
  { id: "c_promenade_plantee", title: "Promenade plantée", architect: "Mathieux & Vergely", country: "France", typology: "linear park", theme: "elevated rail park",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Elevated_Promenade_Plant%C3%A9e_2011.jpg/500px-Elevated_Promenade_Plant%C3%A9e_2011.jpg" },
  { id: "c_duisburg_nord", title: "Landschaftspark Duisburg-Nord", architect: "Latz + Partner", country: "Germany", typology: "post-industrial park", theme: "post-industrial park",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Duisburg%2C_Landschaftspark_Duisburg-Nord_--_2020_--_7824-6.jpg/500px-Duisburg%2C_Landschaftspark_Duisburg-Nord_--_2020_--_7824-6.jpg" },
  { id: "c_seoullo_7017", title: "Seoullo 7017", architect: "MVRDV", country: "South Korea", typology: "skygarden", theme: "highway skygarden",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Seoullo_7017_02.jpg/500px-Seoullo_7017_02.jpg" },
  { id: "c_villette", title: "Parc de la Villette", architect: "Bernard Tschumi", country: "France", typology: "urban park", theme: "deconstructivist park",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Paris_Parc_de_La_Villette_Folie_R4_b.jpg" },
];

export const heroBoardPool: HeroPrecedent[] = [...heroPrecedents, ...curated];
