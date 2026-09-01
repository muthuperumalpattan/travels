export function calculateProfit(
  totalAmount: number,
  driverAmount: number,
  petrolAmount: number
): number {
  return Math.round((totalAmount - driverAmount - petrolAmount + Number.EPSILON) * 100) / 100;
}

export function formatInr(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function sanitizeAmount(raw: string): string {
  let v = raw.replace(/[^\d.]/g, "");
  const dot = v.indexOf(".");
  if (dot !== -1) {
    v = `${v.slice(0, dot + 1)}${v.slice(dot + 1).replace(/\./g, "")}`;
  }
  if (v.startsWith(".")) v = `0${v}`;
  if (v.includes(".")) {
    const [intPart, decPart = ""] = v.split(".");
    return `${stripLeadingZeros(intPart)}.${decPart.slice(0, 2)}`;
  }
  return stripLeadingZeros(v);
}

function stripLeadingZeros(value: string): string {
  if (value === "") return "";
  return value.replace(/^0+(?=\d)/, "");
}
