import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Sidebar } from "../components/Sidebar";

export function AppLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="app-watermark" aria-hidden="true" />
      <div className="app-watermark-veil" aria-hidden="true" />

      <div className="relative z-10 flex min-h-screen">
        <aside className="no-print hidden w-64 shrink-0 lg:block">
          <div className="sticky top-0 h-screen">
            <Sidebar />
          </div>
        </aside>

        {open ? (
          <div className="no-print fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/50"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <div className="relative h-full w-72 max-w-[85vw]">
              <Sidebar onNavigate={() => setOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="no-print sticky top-0 z-20 flex items-center gap-2 border-b border-white/60 bg-white/75 px-3 py-2.5 backdrop-blur-md sm:px-4 sm:py-3 lg:hidden">
            <button
              type="button"
              className="rounded-xl p-2.5 hover:bg-slate-100"
              onClick={() => setOpen((v) => !v)}
              aria-label="Open menu"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
            <span className="font-display text-base font-semibold sm:text-lg">Mani Cars</span>
          </header>
          <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-4 sm:px-6 sm:py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
