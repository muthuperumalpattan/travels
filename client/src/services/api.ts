import { ApiResponse } from "../types";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public data?: unknown
  ) {
    super(message);
  }
}

export function apiBase(): string {
  return (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";
}

export function apiUrl(path: string): string {
  return `${apiBase()}${path}`;
}

const TOKEN_KEY = "tm_token";

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(apiUrl(path), {
    ...options,
    headers,
    credentials: "include",
  });

  const json = (await res.json().catch(() => ({
    success: false,
    message: "Unable to reach the server. Please try again.",
  }))) as ApiResponse<T> & { code?: string };

  if (!res.ok || json.success === false) {
    throw new ApiError(
      json.message || "Unable to complete the request. Please try again.",
      res.status,
      json.code,
      json.data
    );
  }

  return json;
}
