export function nowIso(): string {
  return new Date().toISOString();
}

export function toDateTime(date: string, time: string): Date {
  const value = new Date(`${date}T${time}`);
  if (Number.isNaN(value.getTime())) {
    throw new Error("Invalid date or time");
  }
  return value;
}

export function isArrivalAfterDeparture(
  fromDate: string,
  fromTime: string,
  toDate: string,
  toTime: string
): boolean {
  return toDateTime(toDate, toTime).getTime() >= toDateTime(fromDate, fromTime).getTime();
}

export function formatDisplayDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function monthNameFromDate(date: Date): string {
  return MONTH_NAMES[date.getMonth()];
}
