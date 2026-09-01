import { Readable } from "stream";
import { env, isGoogleDriveConfigured } from "../config/env";
import { logError, logInfo } from "../utils/logger";
import { monthNameFromDate } from "../utils/dates";
import type { drive_v3 } from "googleapis";

export class GoogleDriveError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "GoogleDriveError";
  }
}

const folderCache = new Map<string, string>();
let folderLock: Promise<void> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = folderLock.then(fn, fn);
  folderLock = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function driveClient(): Promise<drive_v3.Drive> {
  if (!isGoogleDriveConfigured()) {
    throw new GoogleDriveError("Google Drive is not configured");
  }
  const { google } = await import("googleapis");
  const auth = new google.auth.JWT({
    email: env.google.clientEmail,
    key: env.google.privateKey,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return google.drive({ version: "v3", auth });
}

export async function findFolder(name: string, parentId: string): Promise<string | null> {
  const cacheKey = `${parentId}/${name}`;
  const cached = folderCache.get(cacheKey);
  if (cached) return cached;

  try {
    const drive = await driveClient();
    const escaped = name.replace(/'/g, "\\'");
    const res = await drive.files.list({
      q: `name='${escaped}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
      fields: "files(id, name)",
      pageSize: 1,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    const id = res.data.files?.[0]?.id ?? null;
    if (id) folderCache.set(cacheKey, id);
    return id;
  } catch (error) {
    logError("findFolder", error);
    throw new GoogleDriveError(
      "Google Drive is currently unavailable. Please contact the administrator.",
      error
    );
  }
}

export async function createFolder(name: string, parentId: string): Promise<string> {
  try {
    const drive = await driveClient();
    const res = await drive.files.create({
      requestBody: {
        name,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId],
      },
      fields: "id",
      supportsAllDrives: true,
    });
    const id = res.data.id;
    if (!id) throw new GoogleDriveError("Folder was created but no ID was returned");
    folderCache.set(`${parentId}/${name}`, id);
    return id;
  } catch (error) {
    if (error instanceof GoogleDriveError) throw error;
    logError("createFolder", error);
    throw new GoogleDriveError("Unable to create a Google Drive folder.", error);
  }
}

export async function findOrCreateFolder(name: string, parentId: string): Promise<string> {
  return withLock(async () => {
    const existing = await findFolder(name, parentId);
    if (existing) return existing;
    return createFolder(name, parentId);
  });
}

export async function ensureAppFolders(): Promise<{ travelRoot: string; invoices: string; data: string }> {
  const rootId = env.google.rootFolderId;
  const travelRoot = await findOrCreateFolder("Travel Management", rootId);
  const invoices = await findOrCreateFolder("Invoices", travelRoot);
  const data = await findOrCreateFolder("Data", travelRoot);
  return { travelRoot, invoices, data };
}

export async function ensureInvoiceFolder(date: Date): Promise<string> {
  const { invoices } = await ensureAppFolders();
  const yearFolder = await findOrCreateFolder(String(date.getFullYear()), invoices);
  return findOrCreateFolder(monthNameFromDate(date), yearFolder);
}

async function findFile(name: string, parentId: string): Promise<string | null> {
  const drive = await driveClient();
  const escaped = name.replace(/'/g, "\\'");
  const res = await drive.files.list({
    q: `name='${escaped}' and mimeType!='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
    fields: "files(id, name)",
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  return res.data.files?.[0]?.id ?? null;
}

export async function ensureJsonFile(name: string, initialJson: unknown): Promise<string> {
  const { data } = await ensureAppFolders();
  const existing = await findFile(name, data);
  if (existing) return existing;
  const drive = await driveClient();
  const body = JSON.stringify(initialJson, null, 2);
  const res = await drive.files.create({
    requestBody: {
      name,
      parents: [data],
      mimeType: "application/json",
    },
    media: {
      mimeType: "application/json",
      body: Readable.from([body]),
    },
    fields: "id",
    supportsAllDrives: true,
  });
  if (!res.data.id) throw new GoogleDriveError("Unable to create the application data file on Google Drive.");
  logInfo(`Created Drive data file ${name} (${res.data.id})`);
  return res.data.id;
}

export async function readJsonFile<T>(fileId: string): Promise<{ data: T; etag: string }> {
  try {
    const drive = await driveClient();
    const meta = await drive.files.get({
      fileId,
      fields: "id, md5Checksum, modifiedTime",
      supportsAllDrives: true,
    });
    const res = await drive.files.get(
      { fileId, alt: "media", supportsAllDrives: true },
      { responseType: "text" }
    );
    const text = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
    const etag = meta.data.md5Checksum || meta.data.modifiedTime || "";
    return { data: JSON.parse(text) as T, etag };
  } catch (error) {
    logError("readJsonFile", error);
    throw new GoogleDriveError("Unable to read application data from Google Drive.", error);
  }
}

export async function writeJsonFile(fileId: string, json: unknown, expectedChecksum?: string): Promise<string> {
  try {
    if (expectedChecksum) {
      const drive = await driveClient();
      const meta = await drive.files.get({
        fileId,
        fields: "md5Checksum, modifiedTime",
        supportsAllDrives: true,
      });
      const current = meta.data.md5Checksum || meta.data.modifiedTime || "";
      if (current && current !== expectedChecksum) {
        const conflict = new GoogleDriveError("Concurrent update detected");
        (conflict as GoogleDriveError & { code?: string }).code = "DRIVE_CONFLICT";
        throw conflict;
      }
    }
    const drive = await driveClient();
    const body = JSON.stringify(json, null, 2);
    const res = await drive.files.update({
      fileId,
      media: {
        mimeType: "application/json",
        body: Readable.from([body]),
      },
      fields: "id, md5Checksum, modifiedTime",
      supportsAllDrives: true,
    });
    return res.data.md5Checksum || res.data.modifiedTime || "";
  } catch (error) {
    if (error instanceof GoogleDriveError) throw error;
    logError("writeJsonFile", error);
    throw new GoogleDriveError("Unable to save application data to Google Drive.", error);
  }
}

export async function uploadInvoice(
  buffer: Buffer,
  filename: string,
  folderId: string
): Promise<{ id: string; webViewLink: string }> {
  try {
    const drive = await driveClient();
    const res = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [folderId],
        mimeType: "application/pdf",
      },
      media: {
        mimeType: "application/pdf",
        body: Readable.from(buffer),
      },
      fields: "id, webViewLink, webContentLink",
      supportsAllDrives: true,
    });
    const id = res.data.id;
    if (!id) throw new GoogleDriveError("Upload succeeded but no file ID was returned");

    try {
      await drive.permissions.create({
        fileId: id,
        requestBody: { role: "reader", type: "anyone" },
        supportsAllDrives: true,
      });
    } catch (permError) {
      logError("uploadInvoice.permissions", permError);
    }

    const meta = await drive.files.get({
      fileId: id,
      fields: "id, webViewLink, webContentLink",
      supportsAllDrives: true,
    });

    logInfo(`Uploaded invoice ${filename} to Drive (${id})`);
    return {
      id,
      webViewLink: meta.data.webViewLink ?? `https://drive.google.com/file/d/${id}/view`,
    };
  } catch (error) {
    if (error instanceof GoogleDriveError) throw error;
    logError("uploadInvoice", error);
    throw new GoogleDriveError(
      "Invoice was created but could not be uploaded to Google Drive. Please retry.",
      error
    );
  }
}

export async function getInvoice(fileId: string): Promise<Buffer> {
  const { isAppsScriptConfigured } = await import("../config/env");
  if (isAppsScriptConfigured()) {
    const { bridgeDownloadPdf } = await import("./appsScriptDrive");
    return bridgeDownloadPdf(fileId);
  }
  try {
    const drive = await driveClient();
    const res = await drive.files.get(
      { fileId, alt: "media", supportsAllDrives: true },
      { responseType: "arraybuffer" }
    );
    return Buffer.from(res.data as ArrayBuffer);
  } catch (error) {
    logError("getInvoice", error);
    throw new GoogleDriveError("Unable to download the invoice from Google Drive.", error);
  }
}

export async function deleteInvoice(fileId: string): Promise<void> {
  const { isAppsScriptConfigured } = await import("../config/env");
  if (isAppsScriptConfigured()) {
    const { bridgeDeletePdf } = await import("./appsScriptDrive");
    await bridgeDeletePdf(fileId);
    return;
  }
  try {
    const drive = await driveClient();
    await drive.files.delete({ fileId, supportsAllDrives: true });
  } catch (error) {
    logError("deleteInvoice", error);
    throw new GoogleDriveError("Unable to delete the invoice from Google Drive.", error);
  }
}

export const googleDriveService = {
  createFolder,
  findFolder,
  findOrCreateFolder,
  ensureAppFolders,
  ensureInvoiceFolder,
  ensureJsonFile,
  readJsonFile,
  writeJsonFile,
  uploadInvoice,
  getInvoice,
  deleteInvoice,
};
