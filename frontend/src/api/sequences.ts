import { apiClient } from "./client";
import type { AlignmentPreviewResult, OrfPreviewResult, PrimerPreviewResult, SequenceStats } from "../types";

export async function previewStats(sequence: string): Promise<SequenceStats> {
  const { data } = await apiClient.post<SequenceStats>("/api/sequences/stats", { sequence });
  return data;
}

export async function previewOrfs(sequence: string, minLength = 30): Promise<OrfPreviewResult> {
  const { data } = await apiClient.post<OrfPreviewResult>("/api/sequences/orfs", {
    sequence,
    min_length: minLength,
  });
  return data;
}

export async function previewPrimer(sequence: string): Promise<PrimerPreviewResult> {
  const { data } = await apiClient.post<PrimerPreviewResult>("/api/sequences/primer", { sequence });
  return data;
}

export async function previewCompare(reference: string, query: string): Promise<AlignmentPreviewResult> {
  const { data } = await apiClient.post<AlignmentPreviewResult>("/api/sequences/compare", {
    reference,
    query,
  });
  return data;
}
