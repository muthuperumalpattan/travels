import { FormEvent, useMemo, useState } from "react";
import { TravelInput, TravelRecord } from "../types";
import { AmountInput, Input, TextArea } from "./Input";
import { PlaceCombobox } from "./PlaceCombobox";
import { Button } from "./Button";
import { calculateProfit, formatInr } from "../utils/format";
import { Card } from "./Card";

function amountText(value: number | undefined): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "";
  return String(value);
}

interface Props {
  initial?: TravelRecord;
  submitting: boolean;
  onSubmit: (input: TravelInput) => Promise<void>;
}

function emptyForm(): TravelInput {
  return {
    customerName: "",
    customerPhone: "",
    fromPlace: "",
    toPlace: "",
    fromDate: "",
    fromTime: "",
    toDate: "",
    toTime: "",
    driverName: "",
    vehicleNumber: "",
    driverAmount: 0,
    petrolAmount: 0,
    totalAmount: 0,
    notes: "",
  };
}

function amountsFrom(initial?: TravelRecord) {
  return {
    totalAmount: amountText(initial?.totalAmount),
    driverAmount: amountText(initial?.driverAmount),
    petrolAmount: amountText(initial?.petrolAmount),
  };
}

export function TravelForm({ initial, submitting, onSubmit }: Props) {
  const [form, setForm] = useState<TravelInput>(() =>
    initial
      ? {
          customerName: initial.customerName ?? "",
          customerPhone: initial.customerPhone ?? "",
          fromPlace: initial.fromPlace,
          toPlace: initial.toPlace,
          fromDate: initial.fromDate,
          fromTime: initial.fromTime,
          toDate: initial.toDate,
          toTime: initial.toTime,
          driverName: initial.driverName ?? "",
          vehicleNumber: initial.vehicleNumber ?? "",
          driverAmount: initial.driverAmount,
          petrolAmount: initial.petrolAmount,
          totalAmount: initial.totalAmount,
          notes: initial.notes ?? "",
        }
      : emptyForm()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [amounts, setAmounts] = useState(() => amountsFrom(initial));

  const totalAmount = Number(amounts.totalAmount || 0);
  const driverAmount = Number(amounts.driverAmount || 0);
  const petrolAmount = Number(amounts.petrolAmount || 0);

  const profit = useMemo(
    () => calculateProfit(totalAmount, driverAmount, petrolAmount),
    [totalAmount, driverAmount, petrolAmount]
  );

  function set<K extends keyof TravelInput>(key: K, value: TravelInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.fromPlace.trim()) next.fromPlace = "From place is required";
    if (!form.toPlace.trim()) next.toPlace = "To place is required";
    if (!form.fromDate) next.fromDate = "From date is required";
    if (!form.fromTime) next.fromTime = "From time is required";
    if (!form.toDate) next.toDate = "To date is required";
    if (!form.toTime) next.toTime = "To time is required";
    if (amounts.totalAmount === "") next.totalAmount = "Total amount is required";
    if (amounts.driverAmount === "") next.driverAmount = "Driver amount is required";
    if (amounts.petrolAmount === "") next.petrolAmount = "Petrol amount is required";
    if (Number.isNaN(totalAmount) || totalAmount < 0) next.totalAmount = "Enter a valid amount";
    if (Number.isNaN(driverAmount) || driverAmount < 0) next.driverAmount = "Enter a valid amount";
    if (Number.isNaN(petrolAmount) || petrolAmount < 0) next.petrolAmount = "Enter a valid amount";
    if (form.fromDate && form.fromTime && form.toDate && form.toTime) {
      const from = new Date(`${form.fromDate}T${form.fromTime}`);
      const to = new Date(`${form.toDate}T${form.toTime}`);
      if (to.getTime() < from.getTime()) {
        next.toDate = "To date/time must be on or after from date/time";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;
    await onSubmit({
      ...form,
      driverAmount,
      petrolAmount,
      totalAmount,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <h2 className="section-title">Travel Information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <PlaceCombobox
            label="From Place"
            name="fromPlace"
            value={form.fromPlace}
            onChange={(value) => set("fromPlace", value)}
            error={errors.fromPlace}
            required
          />
          <PlaceCombobox
            label="To Place"
            name="toPlace"
            value={form.toPlace}
            onChange={(value) => set("toPlace", value)}
            error={errors.toPlace}
            required
          />
          <Input
            label="From Date"
            name="fromDate"
            type="date"
            value={form.fromDate}
            onChange={(e) => set("fromDate", e.target.value)}
            error={errors.fromDate}
            required
          />
          <Input
            label="From Time"
            name="fromTime"
            type="time"
            value={form.fromTime}
            onChange={(e) => set("fromTime", e.target.value)}
            error={errors.fromTime}
            required
          />
          <Input
            label="To Date"
            name="toDate"
            type="date"
            value={form.toDate}
            onChange={(e) => set("toDate", e.target.value)}
            error={errors.toDate}
            required
          />
          <Input
            label="To Time"
            name="toTime"
            type="time"
            value={form.toTime}
            onChange={(e) => set("toTime", e.target.value)}
            error={errors.toTime}
            required
          />
        </div>
      </Card>

      <Card>
        <h2 className="section-title">Customer & Vehicle</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Customer Name"
            name="customerName"
            value={form.customerName}
            onChange={(e) => set("customerName", e.target.value)}
          />
          <Input
            label="Customer Phone"
            name="customerPhone"
            inputMode="tel"
            value={form.customerPhone}
            onChange={(e) => set("customerPhone", e.target.value)}
          />
          <Input
            label="Driver Name"
            name="driverName"
            value={form.driverName}
            onChange={(e) => set("driverName", e.target.value)}
          />
          <Input
            label="Vehicle Number"
            name="vehicleNumber"
            value={form.vehicleNumber}
            onChange={(e) => set("vehicleNumber", e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <h2 className="section-title">Financial Information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <AmountInput
            label="Total Amount"
            name="totalAmount"
            value={amounts.totalAmount}
            onChange={(value) => setAmounts((prev) => ({ ...prev, totalAmount: value }))}
            error={errors.totalAmount}
            required
          />
          <AmountInput
            label="Driver Amount"
            name="driverAmount"
            value={amounts.driverAmount}
            onChange={(value) => setAmounts((prev) => ({ ...prev, driverAmount: value }))}
            error={errors.driverAmount}
            required
          />
          <AmountInput
            label="Petrol Amount"
            name="petrolAmount"
            value={amounts.petrolAmount}
            onChange={(value) => setAmounts((prev) => ({ ...prev, petrolAmount: value }))}
            error={errors.petrolAmount}
            required
          />
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 font-mono text-[15px] sm:text-sm">
          <div className="flex justify-between">
            <span>Total Amount</span>
            <span>{formatInr(totalAmount)}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span>Driver Amount</span>
            <span>{formatInr(driverAmount)}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span>Petrol Amount</span>
            <span>{formatInr(petrolAmount)}</span>
          </div>
          <div className="mt-2 border-t border-slate-300 pt-2 flex justify-between font-semibold text-brand-700">
            <span>Profit</span>
            <span>{formatInr(profit)}</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Profit is calculated automatically: Total Amount − Driver Amount − Petrol Amount
        </p>
      </Card>

      <Card>
        <TextArea
          label="Notes / Remarks"
          name="notes"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={submitting} className="w-full min-w-36 sm:w-auto">
          {submitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
