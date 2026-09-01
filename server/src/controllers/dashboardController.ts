import { Response } from "express";
import { AuthedRequest } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { getDashboard } from "../services/dashboardService";

export const dashboard = asyncHandler(async (_req: AuthedRequest, res: Response) => {
  res.json({ success: true, data: await getDashboard() });
});
