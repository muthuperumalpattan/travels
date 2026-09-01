import { Button } from "./Button";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  busyLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function Modal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  danger,
  busy = false,
  busyLabel = "Please wait...",
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;
  return (
    <div className="print-hidden no-print fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="font-display text-base font-semibold text-slate-900 sm:text-lg">{title}</h3>
        <p className="mt-2 text-[15px] text-slate-600 sm:text-sm">{message}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            variant="secondary"
            type="button"
            className="w-full sm:w-auto"
            disabled={busy}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            type="button"
            className="w-full sm:w-auto"
            loading={busy}
            onClick={onConfirm}
          >
            {busy ? busyLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
