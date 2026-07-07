import { apiClient } from "./client";
import type { AlignmentResult, OrfResult, PrimerResult, SequenceStats } from "../types";

export async function previewStats(sequence: string): Promise<SequenceStats> {
  const { data } = await apiClient.post<SequenceStats>("/api/sequences/stats", { sequence });
  return data;
}

export async function previewOrfs(sequence: string, minLength = 30): Promise<OrfResult[]> {
  const { data } = await apiClient.post<OrfResult[]>("/api/sequences/orfs", {
    sequence,
    min_length: minLength,
  });
  return data;
}

export async function previewPrimer(sequence: string): Promise<PrimerResult> {
  const { data } = await apiClient.post<PrimerResult>("/api/sequences/primer", { sequence });
  return data;
}

export async function previewCompare(reference: string, query: string): Promise<AlignmentResult> {
  const { data } = await apiClient.post<AlignmentResult>("/api/sequences/compare", {
    reference,
    query,
  });
  return data;
}
