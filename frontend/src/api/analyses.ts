import { apiClient } from "./client";
import type { Analysis, AnalysisGoal } from "../types";

export interface AnalysisCreatePayload {
  name: string;
  goal: AnalysisGoal;
  reference_sequence: string;
  query_sequence?: string;
}

export async function createAnalysis(payload: AnalysisCreatePayload): Promise<Analysis> {
  const { data } = await apiClient.post<Analysis>("/api/analyses", payload);
  return data;
}

export async function listAnalyses(): Promise<Analysis[]> {
  const { data } = await apiClient.get<Analysis[]>("/api/analyses");
  return data;
}

export async function getAnalysis(id: number): Promise<Analysis> {
  const { data } = await apiClient.get<Analysis>(`/api/analyses/${id}`);
  return data;
}

export async function deleteAnalysis(id: number): Promise<void> {
  await apiClient.delete(`/api/analyses/${id}`);
}
