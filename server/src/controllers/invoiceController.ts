import { Response } from "express";
import { AuthedRequest } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { getTravelRecord } from "../services/travelService";
import { generateInvoicePdf } from "../services/invoiceService";
import { googleDriveService } from "../services/googleDriveService";
import { logError } from "../utils/logger";

export const getInvoiceMeta = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const record = await getTravelRecord(req.params.id);
  res.json({ success: true, data: record });
});

export const getInvoiceFile = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const record = await getTravelRecord(req.params.id);
  let buffer: Buffer | null = null;

  if (record.invoiceDriveFileId) {
    try {
      buffer = await googleDriveService.getInvoice(record.invoiceDriveFileId);
    } catch (error) {
      logError("getInvoiceFile.drive", error);
    }
  }

  if (!buffer) {
    buffer = await generateInvoicePdf(record);
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `${req.query.download === "1" ? "attachment" : "inline"}; filename="${record.invoiceNumber}.pdf"`
  );
  res.send(buffer);
});

export const getInvoicePrint = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const record = await getTravelRecord(req.params.id);
  res.json({ success: true, data: record, message: "Ready to print" });
});
