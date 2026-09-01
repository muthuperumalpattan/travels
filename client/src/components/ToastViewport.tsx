import { useToast } from "../context/ToastContext";

export function ToastViewport() {
  const { toasts } = useToast();
  return (
    <div className="print-hidden no-print pointer-events-none fixed inset-x-3 top-3 z-[60] flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:top-4 sm:w-[min(100%-2rem,380px)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-xl px-4 py-3 text-[15px] font-medium shadow-lg sm:text-sm ${
            t.kind === "success"
              ? "bg-emerald-600 text-white"
              : t.kind === "error"
                ? "bg-rose-600 text-white"
                : "bg-slate-800 text-white"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
