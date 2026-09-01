import { Role, User, UserStatus } from "../types";
import { mutateAppData, readAppData } from "../store/appStore";

export async function findUserById(id: string): Promise<User | undefined> {
  const data = await readAppData();
  return data.users.find((u) => u.id === id);
}

export async function findUserByEmailOrUsername(login: string): Promise<User | undefined> {
  const needle = login.trim().toLowerCase();
  const data = await readAppData();
  return data.users.find(
    (u) => u.email.toLowerCase() === needle || u.username.toLowerCase() === needle
  );
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const data = await readAppData();
  return data.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export async function findUserByUsername(username: string): Promise<User | undefined> {
  const data = await readAppData();
  return data.users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
}

export async function listUsers(): Promise<User[]> {
  const data = await readAppData();
  return [...data.users].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function insertUser(user: User): Promise<void> {
  await mutateAppData((data) => {
    data.users.push(user);
  });
}

export async function updateUserRecord(
  id: string,
  fields: {
    fullName: string;
    email: string;
    phone: string | null;
    username: string;
    role: Role;
    status: UserStatus;
    passwordHash?: string;
    updatedAt: string;
  }
): Promise<void> {
  await mutateAppData((data) => {
    const user = data.users.find((u) => u.id === id);
    if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
    user.fullName = fields.fullName;
    user.email = fields.email;
    user.phone = fields.phone;
    user.username = fields.username;
    user.role = fields.role;
    user.status = fields.status;
    user.updatedAt = fields.updatedAt;
    if (fields.passwordHash) user.passwordHash = fields.passwordHash;
  });
}

export async function deleteUserRecord(id: string): Promise<void> {
  await mutateAppData((data) => {
    data.users = data.users.filter((u) => u.id !== id);
  });
}

export async function countTravelByUser(userId: string): Promise<number> {
  const data = await readAppData();
  return data.travelRecords.filter((r) => r.createdBy === userId).length;
}
