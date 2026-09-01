import { api } from "./api";
import { User } from "../types";

export function listUsers() {
  return api<User[]>("/api/users");
}

export function getUser(id: string) {
  return api<User>(`/api/users/${id}`);
}

export function createUser(body: {
  fullName: string;
  email: string;
  phone?: string;
  username: string;
  password?: string;
  role: string;
  status: string;
}) {
  return api<User>("/api/users", { method: "POST", body: JSON.stringify(body) });
}

export function updateUser(
  id: string,
  body: {
    fullName: string;
    email: string;
    phone?: string;
    username: string;
    password?: string;
    role: string;
    status: string;
  }
) {
  return api<User>(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export function deleteUser(id: string) {
  return api<null>(`/api/users/${id}`, { method: "DELETE" });
}
