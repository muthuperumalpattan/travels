import { dashboardStats, listRecentTravel } from "../repositories/travelRepository";

export async function getDashboard() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const stats = await dashboardStats(today, monthStart, monthEnd);
  const recent = await listRecentTravel(8);
  const recentInvoices = recent.filter((r) => r.invoiceDriveFileId);

  return {
    totalTravelRecords: stats.totalRecords,
    totalRevenue: stats.totalRevenue,
    totalDriverAmount: stats.totalDriverAmount,
    totalPetrolExpense: stats.totalPetrolExpense,
    totalProfit: stats.totalProfit,
    todayTrips: stats.todayTrips,
    monthTrips: stats.monthTrips,
    monthlySummary: stats.monthly,
    recentRecords: recent,
    recentInvoices,
  };
}
