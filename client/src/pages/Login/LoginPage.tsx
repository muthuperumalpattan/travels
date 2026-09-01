import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, getErrorMessage } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

export function LoginPage() {
  const { user, loading, login, hasPermission } = useAuth();
  const toast = useToast();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to={hasPermission("dashboard:view") ? "/" : "/travel"} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(loginValue, password);
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to log in. Please check your credentials."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-hero relative min-h-screen">
      <div className="absolute inset-0 bg-slate-950/55" />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700 sm:text-xs">Fleet ledger</p>
          <h1 className="font-display mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Travel Management</h1>
          <p className="mt-2 text-[15px] text-slate-600 sm:text-sm">Sign in to record trips, invoices, and settlements.</p>
          <div className="mt-6 space-y-4">
            <Input
              label="Email / Username"
              name="login"
              autoComplete="username"
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={submitting} className="mt-6 w-full">
            {submitting ? "Signing in..." : "Login"}
          </Button>
          <p className="mt-4 text-center text-xs text-slate-500">
            Demo: admin / Admin@123 · manager / Manager@123 · staff / Staff@123
          </p>
        </form>
      </div>
    </div>
  );
}
