import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Banknote,
  Car,
  Fuel,
  IndianRupee,
  CalendarDays,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { fetchDashboard } from "../../services/dashboard";
import { DashboardData } from "../../types";
import { StatCard } from "../../components/StatCard";
import { Card } from "../../components/Card";
import { Loading } from "../../components/Loading";
import { PageHeader } from "../../components/PageHeader";
import { formatDate, formatInr } from "../../utils/format";
import { getErrorMessage } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export function DashboardPage() {
  const toast = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then((res) => setData(res.data))
      .catch((error) => toast.error(getErrorMessage(error, "Unable to load dashboard")))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <Loading label="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Latest trips, invoices, and profit at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Travel Records" value={data.totalTravelRecords} icon={Car} />
        <StatCard label="Total Revenue" value={data.totalRevenue} money icon={IndianRupee} />
        <StatCard label="Total Driver Amount" value={data.totalDriverAmount} money icon={Wallet} />
        <StatCard label="Total Petrol Expense" value={data.totalPetrolExpense} money icon={Fuel} />
        <StatCard label="Total Profit" value={data.totalProfit} money icon={TrendingUp} />
        <StatCard label="Today's Trips" value={data.todayTrips} icon={CalendarDays} />
        <StatCard label="This Month's Trips" value={data.monthTrips} icon={Banknote} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Recent Travel Records</h2>
            <Link to="/travel" className="text-sm font-medium text-brand-700">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentRecords.length === 0 ? (
              <p className="text-sm text-slate-500">No records yet.</p>
            ) : (
              data.recentRecords.map((r) => (
                <Link
                  key={r.id}
                  to={`/invoices/${r.id}`}
                  className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-white/70 p-3 hover:border-brand-200 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {r.fromPlace} → {r.toPlace}
                    </p>
                    <p className="text-sm text-slate-500">
                      {r.invoiceNumber} · {formatDate(r.fromDate)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-brand-700">{formatInr(r.profit)}</p>
                </Link>
              ))
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="section-title">Total Profit</h2>
            <p className="mt-2 font-display text-2xl font-bold text-brand-700 sm:text-3xl">
              {formatInr(data.totalProfit)}
            </p>
          </Card>
          <Card>
            <h2 className="section-title">Recent Invoices</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {data.recentInvoices.slice(0, 5).map((r) => (
                <li key={r.id}>
                  <Link to={`/invoices/${r.id}`} className="text-brand-700 hover:underline">
                    {r.invoiceNumber}
                  </Link>
                </li>
              ))}
              {data.recentInvoices.length === 0 ? (
                <li className="text-slate-500">No invoices yet.</li>
              ) : null}
            </ul>
          </Card>
        </div>
      </div>

      <Card>
        <h2 className="section-title">Monthly Travel Summary</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-2">Date</th>
                <th className="pb-2">Trips</th>
                <th className="pb-2">Revenue</th>
                <th className="pb-2">Profit</th>
              </tr>
            </thead>
            <tbody>
              {data.monthlySummary.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-slate-500">
                    No trips this month.
                  </td>
                </tr>
              ) : (
                data.monthlySummary.map((row) => (
                  <tr key={row.fromDate} className="border-t border-slate-100">
                    <td className="py-2">{formatDate(row.fromDate)}</td>
                    <td>{row.trips}</td>
                    <td>{formatInr(row.revenue)}</td>
                    <td className="font-medium text-brand-700">{formatInr(row.profit)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
