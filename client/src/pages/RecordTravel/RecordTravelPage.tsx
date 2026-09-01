import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TravelForm } from "../../components/TravelForm";
import { createTravel, getTravel, updateTravel } from "../../services/travel";
import { TravelInput, TravelRecord } from "../../types";
import { Loading } from "../../components/Loading";
import { PageHeader } from "../../components/PageHeader";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../context/AuthContext";
import { ApiError } from "../../services/api";

export function RecordTravelPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [initial, setInitial] = useState<TravelRecord | undefined>();
  const [loading, setLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getTravel(id)
      .then((res) => setInitial(res.data))
      .catch((error) => toast.error(getErrorMessage(error, "Unable to load travel record")))
      .finally(() => setLoading(false));
  }, [id]);

  async function onSubmit(input: TravelInput) {
    setSubmitting(true);
    try {
      const res = id ? await updateTravel(id, input) : await createTravel(input);
      toast.success(id ? "Updated successfully" : "Saved successfully");
      if (res.data.invoiceStatus === "complete") {
        toast.success("Invoice generated and saved to Google Drive");
      }
      navigate(`/invoices/${res.data.id}`);
    } catch (error) {
      if (error instanceof ApiError && error.code === "DRIVE_UPLOAD_FAILED") {
        toast.error(
          error.message ||
            "Invoice was created but could not be uploaded to Google Drive. Please retry."
        );
        const record = error.data as TravelRecord | undefined;
        if (record?.id) navigate(`/invoices/${record.id}`);
        return;
      }
      toast.error(getErrorMessage(error, "Unable to save travel record. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loading label="Loading record..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={id ? "Edit Travel Record" : "Record Travel"}
        subtitle="Profit updates automatically. Saving generates an invoice and stores it in Google Drive."
      />
      <TravelForm initial={initial} submitting={submitting} onSubmit={onSubmit} />
    </div>
  );
}
