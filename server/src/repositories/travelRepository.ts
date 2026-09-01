import { Pagination, TravelFilters, TravelRecord } from "../types";
import { mutateAppData, readAppData, rememberPlaces } from "../store/appStore";
import { applyTravelFilters } from "../utils/filters";

export async function insertTravel(record: TravelRecord): Promise<TravelRecord> {
  return mutateAppData((data) => {
    const year = Number(record.invoiceNumber.slice(4, 8)) || new Date().getFullYear();
    if (!record.invoiceNumber) {
      const next = (data.invoiceCounters[String(year)] ?? 0) + 1;
      data.invoiceCounters[String(year)] = next;
      record.invoiceNumber = `TRV-${year}-${String(next).padStart(6, "0")}`;
    }
    data.travelRecords.push(record);
    rememberPlaces(data, record.fromPlace, record.toPlace);
    return record;
  });
}

export async function allocateInvoiceNumber(year: number): Promise<string> {
  return mutateAppData((data) => {
    const next = (data.invoiceCounters[String(year)] ?? 0) + 1;
    data.invoiceCounters[String(year)] = next;
    return `TRV-${year}-${String(next).padStart(6, "0")}`;
  });
}

export async function insertTravelWithInvoice(
  year: number,
  factory: (invoiceNumber: string) => TravelRecord
): Promise<TravelRecord> {
  return mutateAppData((data) => {
    const next = (data.invoiceCounters[String(year)] ?? 0) + 1;
    data.invoiceCounters[String(year)] = next;
    const invoiceNumber = `TRV-${year}-${String(next).padStart(6, "0")}`;
    const record = factory(invoiceNumber);
    data.travelRecords.push(record);
    rememberPlaces(data, record.fromPlace, record.toPlace);
    return record;
  });
}

export async function updateTravel(record: TravelRecord): Promise<void> {
  await mutateAppData((data) => {
    const idx = data.travelRecords.findIndex((r) => r.id === record.id);
    if (idx < 0) throw Object.assign(new Error("Travel record not found"), { status: 404 });
    data.travelRecords[idx] = record;
    rememberPlaces(data, record.fromPlace, record.toPlace);
  });
}

export async function findTravelById(id: string): Promise<TravelRecord | undefined> {
  const data = await readAppData();
  return data.travelRecords.find((r) => r.id === id);
}

export async function deleteTravelById(id: string): Promise<void> {
  await mutateAppData((data) => {
    data.travelRecords = data.travelRecords.filter((r) => r.id !== id);
  });
}

export async function searchTravel(
  filters: TravelFilters,
  pagination: Pagination
): Promise<{ items: TravelRecord[]; total: number }> {
  const data = await readAppData();
  const filtered = applyTravelFilters(data.travelRecords, filters);
  const total = filtered.length;
  const offset = (pagination.page - 1) * pagination.limit;
  return { items: filtered.slice(offset, offset + pagination.limit), total };
}

export async function listRecentTravel(limit: number): Promise<TravelRecord[]> {
  const data = await readAppData();
  return [...data.travelRecords]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
}

export async function dashboardStats(today: string, monthStart: string, monthEnd: string) {
  const data = await readAppData();
  const records = data.travelRecords;
  const totalRecords = records.length;
  const totalRevenue = records.reduce((s, r) => s + r.totalAmount, 0);
  const totalDriverAmount = records.reduce((s, r) => s + r.driverAmount, 0);
  const totalPetrolExpense = records.reduce((s, r) => s + r.petrolAmount, 0);
  const totalProfit = records.reduce((s, r) => s + r.profit, 0);
  const todayTrips = records.filter((r) => r.fromDate === today).length;
  const monthTrips = records.filter((r) => r.fromDate >= monthStart && r.fromDate <= monthEnd).length;

  const byDate = new Map<string, { trips: number; profit: number; revenue: number }>();
  for (const r of records) {
    if (r.fromDate < monthStart || r.fromDate > monthEnd) continue;
    const row = byDate.get(r.fromDate) ?? { trips: 0, profit: 0, revenue: 0 };
    row.trips += 1;
    row.profit += r.profit;
    row.revenue += r.totalAmount;
    byDate.set(r.fromDate, row);
  }
  const monthly = [...byDate.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([fromDate, v]) => ({ fromDate, ...v }));

  return { totalRecords, totalRevenue, totalDriverAmount, totalPetrolExpense, totalProfit, todayTrips, monthTrips, monthly };
}
