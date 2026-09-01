import { TravelFilters, TravelRecord } from "../types";

export function applyTravelFilters(records: TravelRecord[], filters: TravelFilters): TravelRecord[] {
  return records
    .filter((r) => {
      if (filters.fromDate && r.fromDate < filters.fromDate) return false;
      if (filters.toDate && r.fromDate > filters.toDate) return false;
      if (
        filters.fromPlace &&
        !r.fromPlace.toLowerCase().includes(filters.fromPlace.trim().toLowerCase())
      ) {
        return false;
      }
      if (
        filters.toPlace &&
        !r.toPlace.toLowerCase().includes(filters.toPlace.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
