import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Printer, Pencil, Trash2, ExternalLink } from "lucide-react";
import { deleteTravel, fetchTravel } from "../../services/travel";
import { apiUrl } from "../../services/api";
import { TravelRecord } from "../../types";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { PlaceCombobox } from "../../components/PlaceCombobox";
import { Button } from "../../components/Button";
import { Loading } from "../../components/Loading";
import { Pagination } from "../../components/Pagination";
import { Modal } from "../../components/Modal";
import { PageHeader } from "../../components/PageHeader";
import { formatDate, formatInr } from "../../utils/format";
import { useAuth, getErrorMessage } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export function TravelRecordsPage() {
  const toast = useToast();
  const { hasPermission } = useAuth();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromPlace, setFromPlace] = useState("");
  const [toPlace, setToPlace] = useState("");
  const [applied, setApplied] = useState({ fromDate: "", toDate: "", fromPlace: "", toPlace: "" });
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<TravelRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTravel({ ...applied, page, limit: 20 })
      .then((res) => {
        if (cancelled) return;
        setItems(res.data.items);
        setTotal(res.data.total);
      })
      .catch((error) => toast.error(getErrorMessage(error, "Unable to load travel records")))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applied, page]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setApplied((prev) => {
        if (prev.fromPlace === fromPlace && prev.toPlace === toPlace) return prev;
        setPage(1);
        return { ...prev, fromPlace, toPlace };
      });
    }, 350);
    return () => window.clearTimeout(t);
  }, [fromPlace, toPlace]);

  function onSearch(e?: FormEvent) {
    e?.preventDefault();
    setPage(1);
    setApplied({ fromDate, toDate, fromPlace, toPlace });
  }

  function onClear() {
    setFromDate("");
    setToDate("");
    setFromPlace("");
    setToPlace("");
    setPage(1);
    setApplied({ fromDate: "", toDate: "", fromPlace: "", toPlace: "" });
  }

  async function confirmDelete() {
    if (!deleteId || deleting) return;
    setDeleting(true);
    try {
      await deleteTravel(deleteId);
      toast.success("Deleted successfully");
      setDeleteId(null);
      setApplied((prev) => ({ ...prev }));
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete travel record"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Travel Records"
        subtitle="Latest records first. Combine date and place filters as needed."
      />

      <Card>
        <form onSubmit={onSearch} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input label="From Date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <Input label="To Date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          <PlaceCombobox
            label="From Place"
            name="filterFromPlace"
            value={fromPlace}
            onChange={setFromPlace}
            allowAdd={false}
          />
          <PlaceCombobox
            label="To Place"
            name="filterToPlace"
            value={toPlace}
            onChange={setToPlace}
            allowAdd={false}
          />
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row md:col-span-2 xl:col-span-4">
            <Button type="submit" loading={loading} className="w-full sm:w-auto">
              {loading ? "Searching..." : "Search"}
            </Button>
            <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClear}>
              Clear Filters
            </Button>
          </div>
        </form>
      </Card>

      {loading ? (
        <Loading label="Searching..." />
      ) : items.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">No records match the selected filters.</p>
        </Card>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-white/70 bg-white/90 shadow-sm lg:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {[
                    "Invoice No",
                    "Customer",
                    "From",
                    "To",
                    "From Date",
                    "To Date",
                    "Total",
                    "Driver",
                    "Petrol",
                    "Profit",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-3 py-3 font-medium">{r.invoiceNumber}</td>
                    <td className="px-3 py-3">{r.customerName || "—"}</td>
                    <td className="px-3 py-3">{r.fromPlace}</td>
                    <td className="px-3 py-3">{r.toPlace}</td>
                    <td className="px-3 py-3">{formatDate(r.fromDate)}</td>
                    <td className="px-3 py-3">{formatDate(r.toDate)}</td>
                    <td className="px-3 py-3">{formatInr(r.totalAmount)}</td>
                    <td className="px-3 py-3">{formatInr(r.driverAmount)}</td>
                    <td className="px-3 py-3">{formatInr(r.petrolAmount)}</td>
                    <td className="px-3 py-3 font-semibold text-brand-700">{formatInr(r.profit)}</td>
                    <td className="px-3 py-3">
                      <RowActions
                        record={r}
                        canEdit={hasPermission("travel:edit")}
                        canDelete={hasPermission("travel:delete")}
                        onDelete={() => setDeleteId(r.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 lg:hidden">
            {items.map((r) => (
              <Card key={r.id}>
                <p className="text-sm font-semibold text-brand-700">{r.invoiceNumber}</p>
                <p className="mt-1 font-display text-base font-semibold sm:text-lg">
                  {r.fromPlace} → {r.toPlace}
                </p>
                <p className="text-sm text-slate-500">
                  {formatDate(r.fromDate)} – {formatDate(r.toDate)}
                </p>
                <p className="mt-2 text-sm">{r.customerName || "No customer name"}</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-slate-500">Total</dt>
                    <dd>{formatInr(r.totalAmount)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Profit</dt>
                    <dd className="font-semibold text-brand-700">{formatInr(r.profit)}</dd>
                  </div>
                </dl>
                <div className="mt-4">
                  <RowActions
                    record={r}
                    canEdit={hasPermission("travel:edit")}
                    canDelete={hasPermission("travel:delete")}
                    onDelete={() => setDeleteId(r.id)}
                  />
                </div>
              </Card>
            ))}
          </div>

          <Pagination page={page} limit={20} total={total} onPage={setPage} />
        </>
      )}

      <Modal
        open={Boolean(deleteId)}
        title="Delete travel record?"
        message="This will permanently remove the record and its invoice. This cannot be undone."
        confirmLabel="Delete"
        busyLabel="Deleting..."
        danger
        busy={deleting}
        onCancel={() => {
          if (!deleting) setDeleteId(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function RowActions({
  record,
  canEdit,
  canDelete,
  onDelete,
}: {
  record: TravelRecord;
  canEdit: boolean;
  canDelete: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link className="icon-btn" to={`/invoices/${record.id}`} title="View">
        <Eye size={20} />
      </Link>
      <Link className="icon-btn" to={`/invoices/${record.id}?print=1`} title="Print">
        <Printer size={20} />
      </Link>
      {canEdit ? (
        <Link className="icon-btn" to={`/travel/${record.id}/edit`} title="Edit">
          <Pencil size={20} />
        </Link>
      ) : null}
      {canDelete ? (
        <button type="button" className="icon-btn-danger" onClick={onDelete} title="Delete">
          <Trash2 size={20} />
        </button>
      ) : null}
      {record.invoiceDriveFileUrl ? (
        <a
          className="icon-btn"
          href={record.invoiceDriveFileUrl}
          target="_blank"
          rel="noreferrer"
          title="Open Invoice"
        >
          <ExternalLink size={20} />
        </a>
      ) : (
        <a
          className="icon-btn"
          href={apiUrl(`/api/invoices/${record.id}/file`)}
          target="_blank"
          rel="noreferrer"
          title="Open Invoice"
        >
          <ExternalLink size={20} />
        </a>
      )}
    </div>
  );
}
