import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Plus, Loader2 } from "lucide-react";
import { addPlace, listPlaces } from "../services/places";
import { cn } from "../utils/format";
import { getErrorMessage } from "../context/AuthContext";

interface Props {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  allowAdd?: boolean;
}

export function PlaceCombobox({
  label,
  name,
  value,
  onChange,
  error,
  required,
  allowAdd = true,
}: Props) {
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [places, setPlaces] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    let cancelled = false;
    listPlaces()
      .then((res) => {
        if (!cancelled) setPlaces(res.data);
      })
      .catch(() => {
        if (!cancelled) setPlaces([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return places;
    return places.filter((place) => place.toLowerCase().includes(q));
  }, [places, query]);

  const exactMatch = places.some((place) => place.toLowerCase() === query.trim().toLowerCase());
  const showAdd = allowAdd && query.trim().length > 0 && !exactMatch;

  function selectPlace(place: string) {
    onChange(place);
    setQuery(place);
    setOpen(false);
    setAddError("");
  }

  async function onAdd() {
    const name = query.trim();
    if (!name || adding) return;
    setAdding(true);
    setAddError("");
    try {
      const res = await addPlace(name);
      setPlaces(res.data);
      selectPlace(name);
    } catch (err) {
      setAddError(getErrorMessage(err, "Unable to add place"));
    } finally {
      setAdding(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <label className="block" htmlFor={inputId}>
        <span className="label">{label}</span>
        <span className="relative block">
          <input
            id={inputId}
            name={name}
            className={cn("field pr-10", error && "border-rose-400")}
            autoComplete="off"
            value={query}
            required={required}
            placeholder="Select or type a place"
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              onChange(e.target.value);
              setOpen(true);
              setAddError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "Enter" && showAdd && filtered.length === 0) {
                e.preventDefault();
                void onAdd();
              }
            }}
          />
          <ChevronDown
            size={20}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </span>
      </label>
      {open ? (
        <div className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {filtered.length === 0 && !showAdd ? (
            <p className="px-3 py-2 text-sm text-slate-500">No places yet</p>
          ) : null}
          {filtered.map((place) => (
            <button
              key={place}
              type="button"
              className={cn(
                "flex w-full items-center px-3 py-2.5 text-left text-[15px] hover:bg-slate-50 sm:text-sm",
                place === value && "bg-brand-50 font-medium text-brand-800"
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectPlace(place)}
            >
              {place}
            </button>
          ))}
          {showAdd ? (
            <button
              type="button"
              disabled={adding}
              className="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-3 text-left text-[15px] font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-60 sm:text-sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => void onAdd()}
            >
              {adding ? <Loader2 className="h-5 w-5 shrink-0 animate-spin" /> : <Plus size={20} />}
              {adding ? "Adding..." : `Add "${query.trim()}"`}
            </button>
          ) : null}
        </div>
      ) : null}
      {error || addError ? (
        <p className="mt-1 text-xs text-rose-600">{error || addError}</p>
      ) : null}
    </div>
  );
}
