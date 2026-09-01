import { env, isAppsScriptConfigured } from "../config/env";
import { GoogleDriveError } from "./googleDriveService";
import { logError } from "../utils/logger";

interface BridgeResponse {
  ok: boolean;
  message?: string;
  data?: unknown;
  file?: { id: string; webViewLink: string };
  base64?: string;
}

async function callBridge(action: string, extra: Record<string, unknown> = {}): Promise<BridgeResponse> {
  if (!isAppsScriptConfigured()) {
    throw new GoogleDriveError("Google Apps Script Drive bridge is not configured");
  }
  try {
    const res = await fetch(env.google.appsScriptUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.google.bridgeSecret,
        folderId: env.google.rootFolderId,
        action,
        ...extra,
      }),
    });
    const json = (await res.json()) as BridgeResponse;
    if (!json.ok) {
      throw new GoogleDriveError(json.message || "Google Drive bridge returned an error");
    }
    return json;
  } catch (error) {
    if (error instanceof GoogleDriveError) throw error;
    logError("appsScriptDrive", error);
    throw new GoogleDriveError(
      "Unable to reach Google Drive. Deploy the Apps Script web app and check GOOGLE_APPS_SCRIPT_URL.",
      error
    );
  }
}

export async function bridgeReadData<T>(): Promise<T> {
  const res = await callBridge("readData");
  return res.data as T;
}

export async function bridgeWriteData(data: unknown): Promise<void> {
  await callBridge("writeData", { data });
}

export async function bridgeUploadPdf(
  filename: string,
  year: number,
  monthName: string,
  buffer: Buffer
): Promise<{ id: string; webViewLink: string }> {
  const res = await callBridge("uploadPdf", {
    filename,
    year,
    monthName,
    base64: buffer.toString("base64"),
  });
  if (!res.file?.id) {
    throw new GoogleDriveError("Drive upload succeeded but no file ID was returned");
  }
  return res.file;
}

export async function bridgeDownloadPdf(fileId: string): Promise<Buffer> {
  const res = await callBridge("downloadPdf", { fileId });
  if (!res.base64) {
    throw new GoogleDriveError("Unable to download the invoice from Google Drive.");
  }
  return Buffer.from(res.base64, "base64");
}

export async function bridgeDeletePdf(fileId: string): Promise<void> {
  await callBridge("deletePdf", { fileId });
}
