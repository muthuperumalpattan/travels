import { TravelRecord } from "../types";
import { formatDate, formatInr } from "../utils/format";

export function InvoiceDocument({ record }: { record: TravelRecord }) {
  return (
    <article className="print-only-invoice mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-10">
      <header className="rounded-xl bg-brand-700 px-4 py-4 text-center text-white sm:px-5 sm:py-6">
        <p className="text-[11px] tracking-[0.2em] sm:text-xs sm:tracking-[0.25em]">TRAVEL MANAGEMENT</p>
        <h1 className="font-display mt-1 text-xl font-bold sm:text-2xl">TRAVEL INVOICE</h1>
      </header>

      <div className="mt-5 flex flex-col gap-1 text-[15px] sm:mt-6 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-3 sm:text-sm">
        <p>
          <span className="font-semibold">Invoice No:</span> {record.invoiceNumber}
        </p>
        <p>
          <span className="font-semibold">Date:</span> {formatDate(record.createdAt.slice(0, 10))}
        </p>
      </div>

      <section className="mt-6">
        <h2 className="rounded-md bg-brand-50 px-3 py-1.5 text-[15px] font-semibold text-brand-800 sm:text-sm">
          Customer
        </h2>
        <div className="mt-3 grid gap-1 text-[15px] sm:grid-cols-2 sm:text-sm">
          <p>
            <span className="text-slate-500">Name:</span> {record.customerName || "—"}
          </p>
          <p>
            <span className="text-slate-500">Phone:</span> {record.customerPhone || "—"}
          </p>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="rounded-md bg-brand-50 px-3 py-1.5 text-[15px] font-semibold text-brand-800 sm:text-sm">
          Travel Details
        </h2>
        <div className="mt-3 grid gap-3 text-[15px] sm:grid-cols-2 sm:text-sm">
          <p>
            <span className="text-slate-500">From:</span> {record.fromPlace}
          </p>
          <p>
            <span className="text-slate-500">To:</span> {record.toPlace}
          </p>
          <div>
            <p className="font-semibold text-slate-800">Departure</p>
            <p>Date: {formatDate(record.fromDate)}</p>
            <p>Time: {record.fromTime}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-800">Arrival</p>
            <p>Date: {formatDate(record.toDate)}</p>
            <p>Time: {record.toTime}</p>
          </div>
          <p>
            <span className="text-slate-500">Driver:</span> {record.driverName || "—"}
          </p>
          <p>
            <span className="text-slate-500">Vehicle:</span> {record.vehicleNumber || "—"}
          </p>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="rounded-md bg-brand-50 px-3 py-1.5 text-[15px] font-semibold text-brand-800 sm:text-sm">
          Financial Details
        </h2>
        <dl className="mt-4 space-y-2 text-[15px] sm:text-sm">
          <div className="flex justify-between">
            <dt>Total Amount</dt>
            <dd>{formatInr(record.totalAmount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Driver Amount</dt>
            <dd>{formatInr(record.driverAmount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Petrol Amount</dt>
            <dd>{formatInr(record.petrolAmount)}</dd>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold text-brand-700">
            <dt>Profit</dt>
            <dd>{formatInr(record.profit)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6">
        <h2 className="rounded-md bg-brand-50 px-3 py-1.5 text-[15px] font-semibold text-brand-800 sm:text-sm">Notes</h2>
        <p className="mt-3 whitespace-pre-wrap text-[15px] text-slate-600 sm:text-sm">{record.notes || "—"}</p>
      </section>
    </article>
  );
}
