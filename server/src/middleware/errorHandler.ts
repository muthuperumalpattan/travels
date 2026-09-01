import { Request, Response, NextFunction } from "express";
import { logError } from "../utils/logger";
import { ZodError } from "zod";
import { GoogleDriveError } from "../services/googleDriveService";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public data?: unknown
  ) {
    super(message);
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    const message = err.errors[0]?.message ?? "Validation failed";
    res.status(400).json({ success: false, message });
    return;
  }

  if (err instanceof GoogleDriveError) {
    logError("GoogleDrive", err.cause ?? err);
    res.status(502).json({ success: false, message: err.message, code: "DRIVE_ERROR" });
    return;
  }

  const status = (err as { status?: number }).status ?? 500;
  const code = (err as { code?: string }).code;
  const record = (err as { record?: unknown }).record;
  const message =
    status >= 500 && status !== 502
      ? "Something went wrong. Please try again."
      : (err as Error).message || "Unable to complete the request";

  if (status >= 500) {
    logError("http", err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(code ? { code } : {}),
    ...(record ? { data: record } : {}),
  });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ success: false, message: "Not found" });
}
