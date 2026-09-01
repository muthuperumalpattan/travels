import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loading } from "./Loading";

export function ProtectedRoute({ permission }: { permission?: string }) {
  const { user, loading, hasPermission } = useAuth();

  if (loading) return <Loading label="Checking session..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (permission && !hasPermission(permission)) {
    return <Navigate to={hasPermission("dashboard:view") ? "/" : "/travel"} replace />;
  }
  return <Outlet />;
}
