import { api } from "./api";

export function listPlaces() {
  return api<string[]>("/api/places");
}

export function addPlace(name: string) {
  return api<string[]>("/api/places", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}
