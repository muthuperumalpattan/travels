export function calculateProfit(
  totalAmount: number,
  driverAmount: number,
  petrolAmount: number
): number {
  return roundMoney(totalAmount - driverAmount - petrolAmount);
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatInr(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function assertNonNegativeAmounts(input: {
  totalAmount: number;
  driverAmount: number;
  petrolAmount: number;
}): void {
  if (input.totalAmount < 0 || input.driverAmount < 0 || input.petrolAmount < 0) {
    throw new Error("Amounts cannot be negative");
  }
}
