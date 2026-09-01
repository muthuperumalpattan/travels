import { api } from "./api";
import { DashboardData } from "../types";

export function fetchDashboard() {
  return api<DashboardData>("/api/dashboard");
}
