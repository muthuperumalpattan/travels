import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { AuthTokenPayload, PublicUser, Role, User } from "../types";
import { findUserByEmailOrUsername } from "../repositories/userRepository";

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: AuthTokenPayload): string {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
}

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _hidden, ...rest } = user;
  return rest;
}

export async function authenticate(login: string, password: string): Promise<PublicUser> {
  const user = await findUserByEmailOrUsername(login.trim());
  if (!user) {
    throw Object.assign(new Error("Invalid email/username or password"), { status: 401 });
  }
  if (user.status !== "Active") {
    throw Object.assign(new Error("This account is inactive. Contact an administrator."), {
      status: 403,
    });
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw Object.assign(new Error("Invalid email/username or password"), { status: 401 });
  }
  return toPublicUser(user);
}

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
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

export function hasPermission(role: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
