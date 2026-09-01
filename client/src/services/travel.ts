import { api } from "./api";
import { Paginated, TravelInput, TravelRecord } from "../types";

export function fetchTravel(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") query.set(k, String(v));
  });
  return api<Paginated<TravelRecord>>(`/api/travel/search?${query.toString()}`);
}

export function getTravel(id: string) {
  return api<TravelRecord>(`/api/travel/${id}`);
}

export function createTravel(input: TravelInput) {
  return api<TravelRecord>("/api/travel", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTravel(id: string, input: TravelInput) {
  return api<TravelRecord>(`/api/travel/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteTravel(id: string) {
  return api<null>(`/api/travel/${id}`, { method: "DELETE" });
}

export function retryInvoice(id: string) {
  return api<TravelRecord>(`/api/travel/${id}/retry-invoice`, { method: "POST" });
}
