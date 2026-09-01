import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { User } from "../types";
import * as authApi from "../services/auth";
import { ApiError } from "../services/api";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (login: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const PERMISSIONS: Record<string, string[]> = {
  Admin: [
    "dashboard:view",
    "travel:create",
    "travel:view",
    "travel:edit",
    "travel:delete",
    "invoice:print",
    "invoice:open",
    "users:manage",
  ],
  Manager: [
    "dashboard:view",
    "travel:create",
    "travel:view",
    "travel:edit",
    "invoice:print",
    "invoice:open",
  ],
  Staff: ["travel:create", "travel:view", "invoice:print", "invoice:open"],
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (loginValue: string, password: string) => {
    const res = await authApi.login(loginValue, password);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      return PERMISSIONS[user.role]?.includes(permission) ?? false;
    },
    [user]
  );

  const value = useMemo(
    () => ({ user, loading, login, logout, hasPermission }),
    [user, loading, login, logout, hasPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}
