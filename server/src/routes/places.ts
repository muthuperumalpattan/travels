import { Router } from "express";
import { createPlace, getPlaces } from "../controllers/placeController";
import { requireAuth, requirePermission } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", requirePermission("travel:view"), getPlaces);
router.post("/", requirePermission("travel:create"), createPlace);

export default router;
