import { Request, Response, NextFunction } from "express";
import { verifyToken, hasPermission } from "../services/authService";
import { findUserById } from "../repositories/userRepository";
import { Role } from "../types";

export interface AuthedRequest extends Request {
  user?: {
    id: string;
    role: Role;
    username: string;
  };
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
  const cookieToken = req.cookies?.token as string | undefined;
  const header = req.headers.authorization;
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const token = cookieToken || bearer;

  if (!token) {
    res.status(401).json({ success: false, message: "Please log in to continue" });
    return;
  }

  try {
    const payload = verifyToken(token);
    const user = await findUserById(payload.userId);
    if (!user || user.status !== "Active") {
      res.status(401).json({ success: false, message: "Session is no longer valid" });
      return;
    }
    req.user = { id: user.id, role: user.role, username: user.username };
    next();
  } catch {
    res.status(401).json({ success: false, message: "Please log in to continue" });
  }
}

export function requirePermission(permission: string) {
  return (req: AuthedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Please log in to continue" });
      return;
    }
    if (!hasPermission(req.user.role, permission)) {
      res.status(403).json({ success: false, message: "You do not have permission for this action" });
      return;
    }
    next();
  };
}
