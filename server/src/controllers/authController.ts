import { Request, Response } from "express";
import { authenticate, signToken, toPublicUser } from "../services/authService";
import { findUserById } from "../repositories/userRepository";
import { env } from "../config/env";
import { AuthedRequest } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

function setAuthCookie(res: Response, token: string): void {
  res.cookie("token", token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { login, password } = req.body as { login?: string; password?: string };
  if (!login || !password) {
    res.status(400).json({ success: false, message: "Email/username and password are required" });
    return;
  }
  const user = await authenticate(login, password);
  const token = signToken({ userId: user.id, role: user.role, username: user.username });
  setAuthCookie(res, token);
  res.json({ success: true, data: { user, token }, message: "Logged in successfully" });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("token", { path: "/" });
  res.json({ success: true, data: null, message: "Logged out" });
});

export const me = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const user = await findUserById(req.user!.id);
  if (!user) {
    res.status(401).json({ success: false, message: "Session is no longer valid" });
    return;
  }
  res.json({ success: true, data: toPublicUser(user) });
});
