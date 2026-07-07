import { apiClient } from "./client";
import type { User } from "../types";

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export async function register(email: string, password: string): Promise<User> {
  const { data } = await apiClient.post<User>("/api/auth/register", { email, password });
  return data;
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>("/api/auth/login", { email, password });
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/api/auth/me");
  return data;
}
