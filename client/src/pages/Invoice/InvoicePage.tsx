import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Printer, ExternalLink, RefreshCw } from "lucide-react";
import { apiUrl } from "../../services/api";
import { getTravel, retryInvoice } from "../../services/travel";
import { TravelRecord } from "../../types";
import { InvoiceDocument } from "../../components/InvoiceDocument";
import { Loading } from "../../components/Loading";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage, useAuth } from "../../context/AuthContext";

export function InvoicePage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const toast = useToast();
  const { hasPermission } = useAuth();
  const [record, setRecord] = useState<TravelRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!id) return;
    getTravel(id)
      .then((res) => setRecord(res.data))
      .catch((error) => toast.error(getErrorMessage(error, "Unable to load invoice")))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (record && params.get("print") === "1") {
      const t = window.setTimeout(() => window.print(), 400);
      return () => window.clearTimeout(t);
    }
  }, [record, params]);

  async function onRetry() {
    if (!id) return;
    setRetrying(true);
    try {
      const res = await retryInvoice(id);
      setRecord(res.data);
      toast.success("Invoice generated and saved to Google Drive");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Google Drive is currently unavailable. Please contact the administrator.")
      );
    } finally {
      setRetrying(false);
    }
  }

  if (loading || !record) return <Loading label="Loading invoice..." />;

  const openUrl = record.invoiceDriveFileUrl || apiUrl(`/api/invoices/${record.id}/file`);

  return (
    <div className="space-y-4">
      <div className="print-hidden no-print">
        <PageHeader
          title={`Invoice ${record.invoiceNumber}`}
          subtitle={
            record.invoiceStatus === "complete"
              ? "Saved to Google Drive"
              : record.invoiceStatus === "pending_drive"
                ? "Invoice created — Google Drive upload pending"
                : "Invoice saved locally"
          }
          actions={
            <>
              {hasPermission("invoice:print") ? (
                <Button type="button" onClick={() => window.print()}>
                  <Printer size={20} />
                  Print Invoice
                </Button>
              ) : null}
              <a className="btn-secondary" href={openUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={20} />
                Open Invoice
              </a>
              {record.invoiceStatus === "pending_drive" ? (
                <Button type="button" variant="secondary" disabled={retrying} onClick={onRetry}>
                  <RefreshCw size={20} />
                  {retrying ? "Retrying..." : "Retry Drive upload"}
                </Button>
              ) : null}
              <Link className="btn-secondary" to="/travel">
                Back to records
              </Link>
            </>
          }
        />
      </div>
      <InvoiceDocument record={record} />
    </div>
  );
}
