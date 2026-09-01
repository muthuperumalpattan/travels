import { hashPassword } from "../services/authService";
import { nowIso } from "../utils/dates";
import { logInfo } from "../utils/logger";
import { collectPlaces, mutateAppData, readAppData } from "../store/appStore";
import { TravelRecord, User } from "../types";

export async function seedIfEmpty(): Promise<void> {
  const existing = await readAppData();
  if (existing.users.length > 0) return;

  const createdAt = nowIso();
  const adminId = crypto.randomUUID();
  const managerId = crypto.randomUUID();
  const staffId = crypto.randomUUID();
  const year = new Date().getFullYear();

  const users: User[] = [
    {
      id: adminId,
      fullName: "System Admin",
      email: "admin@travel.local",
      phone: "9876543210",
      username: "admin",
      passwordHash: await hashPassword("Admin@123"),
      role: "Admin",
      status: "Active",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: managerId,
      fullName: "Travel Manager",
      email: "manager@travel.local",
      phone: "9876543211",
      username: "manager",
      passwordHash: await hashPassword("Manager@123"),
      role: "Manager",
      status: "Active",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: staffId,
      fullName: "Staff Operator",
      email: "staff@travel.local",
      phone: "9876543212",
      username: "staff",
      passwordHash: await hashPassword("Staff@123"),
      role: "Staff",
      status: "Active",
      createdAt,
      updatedAt: createdAt,
    },
  ];

  const samples: Array<Partial<TravelRecord> & { fromPlace: string; toPlace: string; fromDate: string; toDate: string; totalAmount: number; driverAmount: number; petrolAmount: number; customerName: string }> = [
    { fromPlace: "Chennai", toPlace: "Madurai", fromDate: `${year}-08-12`, toDate: `${year}-08-12`, totalAmount: 10000, driverAmount: 3000, petrolAmount: 2000, customerName: "Ravi Kumar" },
    { fromPlace: "Coimbatore", toPlace: "Bengaluru", fromDate: `${year}-08-20`, toDate: `${year}-08-20`, totalAmount: 8500, driverAmount: 2500, petrolAmount: 1800, customerName: "Priya Sharma" },
    { fromPlace: "Chennai", toPlace: "Pondicherry", fromDate: `${year}-08-28`, toDate: `${year}-08-28`, totalAmount: 4500, driverAmount: 1500, petrolAmount: 900, customerName: "Arun Nair" },
  ];

  await mutateAppData((data) => {
    if (data.users.length > 0) return;
    data.users.push(...users);
    samples.forEach((s, i) => {
      const created = new Date(Date.now() - (samples.length - i) * 3600_000).toISOString();
      data.travelRecords.push({
        id: crypto.randomUUID(),
        invoiceNumber: `TRV-${year}-${String(i + 1).padStart(6, "0")}`,
        customerName: s.customerName,
        customerPhone: "9000000000",
        fromPlace: s.fromPlace,
        toPlace: s.toPlace,
        fromDate: s.fromDate,
        fromTime: "07:00",
        toDate: s.toDate,
        toTime: "14:00",
        driverName: "Karthik",
        vehicleNumber: "TN 09 AB 1234",
        driverAmount: s.driverAmount,
        petrolAmount: s.petrolAmount,
        totalAmount: s.totalAmount,
        profit: s.totalAmount - s.driverAmount - s.petrolAmount,
        notes: "Seed demo trip",
        invoiceStatus: "pending_drive",
        createdBy: adminId,
        createdAt: created,
        updatedAt: created,
      });
    });
    data.invoiceCounters[String(year)] = samples.length;
    data.places = collectPlaces(data);
  });

  logInfo("Seeded default users and demo travel records on Google Drive");
}
