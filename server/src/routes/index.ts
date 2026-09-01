import { Router } from "express";
import authRoutes from "./auth";
import travelRoutes from "./travel";
import userRoutes from "./users";
import dashboardRoutes from "./dashboard";
import invoiceRoutes from "./invoices";
import placeRoutes from "./places";

const router = Router();

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/travel", travelRoutes);
router.use("/places", placeRoutes);
router.use("/users", userRoutes);
router.use("/invoices", invoiceRoutes);

router.get("/health", (_req, res) => {
  res.json({ success: true, data: { ok: true } });
});

router.use((_req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

export default router;
