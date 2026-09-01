import { Button } from "./Button";

interface Props {
  page: number;
  limit: number;
  total: number;
  onPage: (page: number) => void;
}

export function Pagination({ page, limit, total, onPage }: Props) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;

  const windowPages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, start + 4);
  for (let i = start; i <= end; i += 1) windowPages.push(i);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
      <Button variant="secondary" type="button" className="min-w-[7rem]" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </Button>
      {windowPages.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onPage(n)}
          className={`h-11 min-w-11 rounded-xl px-3 text-[15px] font-semibold sm:h-10 sm:min-w-10 sm:text-sm ${
            n === page ? "bg-brand-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          {n}
        </button>
      ))}
      <Button variant="secondary" type="button" className="min-w-[7rem]" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Next
      </Button>
    </div>
  );
}
