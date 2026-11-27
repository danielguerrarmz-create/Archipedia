export interface Project {
  id: string;
  title: string;
  architect: string;
  year: number;
  city: string | null;
  country: string;
  typology: string | null;
  image: string;
  images: string[];
  source: string | null;
  /** [first_row, count] into vectors.bin, one row per entry in images. */
  v: [number, number];
}

export interface Meta {
  generated: string;
  metric: "cosine";
  model: string;
  corpus_projects: number;
  demo_projects: number;
  method: string;
  vectors: { file: string; scales: string; dtype: "int8"; dim: number; rows: number };
  /** Real reference points for reading a cosine score. */
  anchors: { closest_other_median: number; random_pair_median: number };
}

export interface DemoData {
  projects: Project[];
  byId: Map<string, Project>;
  meta: Meta;
}
