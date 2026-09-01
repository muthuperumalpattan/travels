import { Router } from "express";
import { getInvoiceFile, getInvoiceMeta, getInvoicePrint } from "../controllers/invoiceController";
import { requireAuth, requirePermission } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requirePermission("invoice:open"));

router.get("/:id/print", requirePermission("invoice:print"), getInvoicePrint);
router.get("/:id/file", getInvoiceFile);
router.get("/:id", getInvoiceMeta);

export default router;
