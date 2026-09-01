import { Role, User, UserStatus } from "../types";
import { hashPassword, toPublicUser } from "./authService";
import { nowIso } from "../utils/dates";
import {
  countTravelByUser,
  deleteUserRecord,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  insertUser,
  listUsers,
  updateUserRecord,
} from "../repositories/userRepository";
import { z } from "zod";

export const userInputSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional().nullable(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z
    .string()
    .optional()
    .refine((value) => !value || value.length >= 8, "Password must be at least 8 characters"),
  role: z.enum(["Admin", "Manager", "Staff"]),
  status: z.enum(["Active", "Inactive"]),
});

export async function createUser(input: z.infer<typeof userInputSchema>) {
  if (!input.password) {
    throw Object.assign(new Error("Password is required"), { status: 400 });
  }
  if (await findUserByEmail(input.email)) {
    throw Object.assign(new Error("Email is already in use"), { status: 409 });
  }
  if (await findUserByUsername(input.username)) {
    throw Object.assign(new Error("Username is already in use"), { status: 409 });
  }
  const stamp = nowIso();
  const user: User = {
    id: crypto.randomUUID(),
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone ?? null,
    username: input.username.trim(),
    passwordHash: await hashPassword(input.password),
    role: input.role as Role,
    status: input.status as UserStatus,
    createdAt: stamp,
    updatedAt: stamp,
  };
  await insertUser(user);
  return toPublicUser(user);
}

export async function updateUser(id: string, input: z.infer<typeof userInputSchema>) {
  const existing = await findUserById(id);
  if (!existing) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }
  const emailOwner = await findUserByEmail(input.email);
  if (emailOwner && emailOwner.id !== id) {
    throw Object.assign(new Error("Email is already in use"), { status: 409 });
  }
  const usernameOwner = await findUserByUsername(input.username);
  if (usernameOwner && usernameOwner.id !== id) {
    throw Object.assign(new Error("Username is already in use"), { status: 409 });
  }

  const passwordHash = input.password ? await hashPassword(input.password) : undefined;
  await updateUserRecord(id, {
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone ?? null,
    username: input.username.trim(),
    role: input.role as Role,
    status: input.status as UserStatus,
    passwordHash,
    updatedAt: nowIso(),
  });
  return toPublicUser((await findUserById(id))!);
}

export async function getUsers() {
  return (await listUsers()).map(toPublicUser);
}

export async function getUser(id: string) {
  const user = await findUserById(id);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  return toPublicUser(user);
}

export async function removeUser(id: string, requesterId: string) {
  if (id === requesterId) {
    throw Object.assign(new Error("You cannot delete your own account"), { status: 400 });
  }
  const user = await findUserById(id);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  if ((await countTravelByUser(id)) > 0) {
    throw Object.assign(
      new Error("This user has travel records. Disable the account instead of deleting it."),
      { status: 400 }
    );
  }
  await deleteUserRecord(id);
}
