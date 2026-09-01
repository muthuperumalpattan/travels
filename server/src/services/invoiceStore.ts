import { TravelRecord } from "../types";
import { nowIso, monthNameFromDate } from "../utils/dates";
import { isAppsScriptConfigured, isGoogleDriveConfigured } from "../config/env";
import { generateInvoicePdf } from "./invoiceService";
import { GoogleDriveError, googleDriveService } from "./googleDriveService";
import { bridgeUploadPdf } from "./appsScriptDrive";
import { findTravelById, updateTravel } from "../repositories/travelRepository";
import { logError } from "../utils/logger";

export async function persistInvoice(record: TravelRecord): Promise<TravelRecord> {
  const pdf = await generateInvoicePdf(record);
  const filename = `${record.invoiceNumber}.pdf`;
  const updated: TravelRecord = { ...record, updatedAt: nowIso() };

  if (!isGoogleDriveConfigured()) {
    updated.invoiceStatus = "pending_drive";
    await updateTravel(updated);
    throw Object.assign(
      new Error(
        "Google Drive is not connected yet. Deploy the free Apps Script (see README) and set GOOGLE_APPS_SCRIPT_URL."
      ),
      { status: 502, code: "DRIVE_UPLOAD_FAILED", record: updated }
    );
  }

  try {
    const created = new Date(record.createdAt);
    let uploaded: { id: string; webViewLink: string };
    if (isAppsScriptConfigured()) {
      uploaded = await bridgeUploadPdf(
        filename,
        created.getFullYear(),
        monthNameFromDate(created),
        pdf
      );
    } else {
      const folderId = await googleDriveService.ensureInvoiceFolder(created);
      uploaded = await googleDriveService.uploadInvoice(pdf, filename, folderId);
    }
    updated.invoiceDriveFileId = uploaded.id;
    updated.invoiceDriveFileUrl = uploaded.webViewLink;
    updated.invoiceStatus = "complete";
    await updateTravel(updated);
    return updated;
  } catch (error) {
    logError("persistInvoice", error);
    updated.invoiceStatus = "pending_drive";
    await updateTravel(updated);
    const message =
      error instanceof GoogleDriveError
        ? error.message
        : "Invoice was created but could not be uploaded to Google Drive. Please retry.";
    throw Object.assign(new Error(message), {
      status: 502,
      code: "DRIVE_UPLOAD_FAILED",
      record: updated,
    });
  }
}

export async function retryInvoiceUpload(id: string): Promise<TravelRecord> {
  const record = await findTravelById(id);
  if (!record) {
    throw Object.assign(new Error("Travel record not found"), { status: 404 });
  }
  return persistInvoice(record);
}

export function newRecordId(): string {
  return crypto.randomUUID();
}
