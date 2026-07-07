export type AnalysisGoal = "mutations" | "orfs" | "primer";

export interface Variant {
  position: number;
  ref_base: string;
  alt_base: string;
  ref_codon: string | null;
  alt_codon: string | null;
  ref_amino_acid: string | null;
  alt_amino_acid: string | null;
  mutation_type: string;
  codon_index: number | null;
}

// Shape of `results` as persisted on a saved Analysis. The backend's
// create_analysis path calls call_variants()/primer_report() directly with
// no label wrapping, so these intentionally do NOT include
// reference_label/query_label/label -- only the live preview responses do
// (see the *PreviewResult variants below). Casting `analysis.results` to a
// type that claims those fields exist would silently read `undefined` at
// runtime.
export interface AlignmentResult {
  aligned_reference: string;
  aligned_query: string;
  score: number;
  identity_pct: number;
  variants: Variant[];
}

export interface OrfResult {
  start: number;
  end: number;
  frame: number;
  strand: "+" | "-";
  length: number;
  protein: string;
}

export interface PrimerResult {
  sequence: string;
  length: number;
  gc_content_pct: number;
  melting_temp_c: number;
  warnings: string[];
}

// Live preview responses (/api/sequences/*) additionally surface the
// gene/sequence label detected from a FASTA header, if any.
export interface AlignmentPreviewResult extends AlignmentResult {
  reference_label: string | null;
  query_label: string | null;
}

export interface OrfPreviewResult {
  label: string | null;
  orfs: OrfResult[];
}

export interface PrimerPreviewResult extends PrimerResult {
  label: string | null;
}

export interface SequenceStats {
  label: string | null;
  length: number;
  gc_content_pct: number;
  a_count: number;
  t_count: number;
  g_count: number;
  c_count: number;
}

export interface Analysis {
  id: number;
  name: string;
  goal: AnalysisGoal;
  reference_sequence: string;
  query_sequence: string | null;
  reference_label: string | null;
  query_label: string | null;
  results: AlignmentResult | { orfs: OrfResult[] } | PrimerResult;
  ai_explanation: string | null;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
}
