import { Router } from "express";
import { dashboard } from "../controllers/dashboardController";
import { requireAuth, requirePermission } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, requirePermission("dashboard:view"), dashboard);

export default router;
