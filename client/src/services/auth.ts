import { api, setToken } from "./api";
import { User } from "../types";

export function login(loginValue: string, password: string) {
  return api<{ user: User; token?: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ login: loginValue, password }),
  }).then((res) => {
    if (res.data.token) setToken(res.data.token);
    return res;
  });
}

export function logout() {
  return api<null>("/api/auth/logout", { method: "POST" }).finally(() => setToken(null));
}

export function me() {
  return api<User>("/api/auth/me");
}
