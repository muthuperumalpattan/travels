import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MapPinned,
  Files,
  UserPlus,
  Users,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard:view" },
  { to: "/travel/new", label: "Record Travel", icon: MapPinned, permission: "travel:create" },
  { to: "/travel", label: "Travel Records", icon: Files, permission: "travel:view" },
  { to: "/users/new", label: "Add User", icon: UserPlus, permission: "users:manage" },
  { to: "/users", label: "User Management", icon: Users, permission: "users:manage" },
];

function isLinkActive(to: string, pathname: string): boolean {
  if (to === "/") return pathname === "/";
  if (to === "/travel/new") {
    return pathname === "/travel/new" || /^\/travel\/[^/]+\/edit$/.test(pathname);
  }
  if (to === "/travel") {
    return pathname === "/travel" || pathname.startsWith("/invoices/");
  }
  if (to === "/users/new") {
    return pathname === "/users/new" || /^\/users\/[^/]+\/edit$/.test(pathname);
  }
  if (to === "/users") return pathname === "/users";
  return pathname === to;
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout, hasPermission } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-100">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="font-display text-base font-semibold tracking-tight sm:text-lg">Mani Cars</p>
        <p className="mt-1 text-sm text-slate-400">Invoice & fleet ledger</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links
          .filter((l) => hasPermission(l.permission))
          .map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end
              onClick={onNavigate}
              className={() => {
                const active = isLinkActive(l.to, pathname);
                return `flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium sm:py-2.5 sm:text-sm ${
                  active ? "bg-brand-600 text-white" : "text-slate-300 hover:bg-white/10"
                }`;
              }}
            >
              <l.icon size={20} />
              {l.label}
            </NavLink>
          ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-medium">{user?.fullName}</p>
        <p className="text-xs text-slate-400">
          {user?.role} · {user?.username}
        </p>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-3 flex w-full min-h-11 items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-[15px] hover:bg-white/15 sm:text-sm"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}
