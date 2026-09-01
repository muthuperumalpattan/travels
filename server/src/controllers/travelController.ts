import { Response } from "express";
import { AuthedRequest } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createTravelRecord,
  getTravelRecord,
  listTravelRecords,
  removeTravelRecord,
  travelInputSchema,
  updateTravelRecord,
} from "../services/travelService";
import { retryInvoiceUpload } from "../services/invoiceStore";

export const createTravel = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const input = travelInputSchema.parse(req.body);
  try {
    const record = await createTravelRecord(input, req.user!.id);
    res.status(201).json({
      success: true,
      data: record,
      message:
        record.invoiceStatus === "complete"
          ? "Travel record saved successfully. Invoice generated and saved to Google Drive."
          : "Travel record saved. Invoice is pending Google Drive upload.",
    });
  } catch (error) {
    const record = (error as { record?: unknown }).record;
    if (record) {
      res.status(502).json({
        success: false,
        message:
          (error as Error).message ||
          "Invoice was created but could not be uploaded to Google Drive. Please retry.",
        code: "DRIVE_UPLOAD_FAILED",
        data: record,
      });
      return;
    }
    throw error;
  }
});

export const updateTravel = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const input = travelInputSchema.parse(req.body);
  const record = await updateTravelRecord(req.params.id, input);
  res.json({ success: true, data: record, message: "Updated successfully" });
});

export const getTravel = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const record = await getTravelRecord(req.params.id);
  res.json({ success: true, data: record });
});

export const searchTravel = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { fromDate, toDate, fromPlace, toPlace, page, limit } = req.query;
  const result = await listTravelRecords(
    {
      fromDate: typeof fromDate === "string" ? fromDate : undefined,
      toDate: typeof toDate === "string" ? toDate : undefined,
      fromPlace: typeof fromPlace === "string" ? fromPlace : undefined,
      toPlace: typeof toPlace === "string" ? toPlace : undefined,
    },
    Number(page ?? 1),
    Number(limit ?? 20)
  );
  res.json({ success: true, data: result });
});

export const deleteTravel = asyncHandler(async (req: AuthedRequest, res: Response) => {
  await removeTravelRecord(req.params.id);
  res.json({ success: true, data: null, message: "Deleted successfully" });
});

export const retryInvoice = asyncHandler(async (req: AuthedRequest, res: Response) => {
  try {
    const record = await retryInvoiceUpload(req.params.id);
    res.json({
      success: true,
      data: record,
      message: "Invoice generated and saved to Google Drive",
    });
  } catch (error) {
    const record = (error as { record?: unknown }).record;
    res.status(502).json({
      success: false,
      message:
        (error as Error).message ||
        "Google Drive is currently unavailable. Please contact the administrator.",
      code: "DRIVE_UPLOAD_FAILED",
      data: record,
    });
  }
});
