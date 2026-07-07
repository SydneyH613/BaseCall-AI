export type AnalysisGoal = "compare" | "mutations" | "orfs" | "primer";

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

export interface SequenceStats {
  length: number;
  gc_content_pct: number;
  a_count: number;
  t_count: number;
  g_count: number;
  c_count: number;
}

export interface PrimerResult {
  sequence: string;
  length: number;
  gc_content_pct: number;
  melting_temp_c: number;
  warnings: string[];
}

export interface Analysis {
  id: number;
  name: string;
  goal: AnalysisGoal;
  reference_sequence: string;
  query_sequence: string | null;
  results: AlignmentResult | { orfs: OrfResult[] } | PrimerResult;
  ai_explanation: string | null;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
}
