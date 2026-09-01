import { Router } from "express";
import {
  createTravel,
  deleteTravel,
  getTravel,
  retryInvoice,
  searchTravel,
  updateTravel,
} from "../controllers/travelController";
import { requireAuth, requirePermission } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/search", requirePermission("travel:view"), searchTravel);
router.get("/", requirePermission("travel:view"), searchTravel);
router.post("/", requirePermission("travel:create"), createTravel);
router.post("/:id/retry-invoice", requirePermission("travel:create"), retryInvoice);
router.get("/:id", requirePermission("travel:view"), getTravel);
router.put("/:id", requirePermission("travel:edit"), updateTravel);
router.delete("/:id", requirePermission("travel:delete"), deleteTravel);

export default router;
