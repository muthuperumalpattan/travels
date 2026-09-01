import fs from "fs";
import path from "path";
import { TravelRecord, User } from "../types";
import { isAppsScriptConfigured, isGoogleDriveConfigured, isServiceAccountConfigured } from "../config/env";
import { GoogleDriveError, googleDriveService } from "../services/googleDriveService";
import { bridgeReadData, bridgeWriteData } from "../services/appsScriptDrive";
import { logInfo } from "../utils/logger";

export interface AppData {
  users: User[];
  travelRecords: TravelRecord[];
  invoiceCounters: Record<string, number>;
  places: string[];
}

export function emptyAppData(): AppData {
  return { users: [], travelRecords: [], invoiceCounters: {}, places: [] };
}

export function collectPlaces(data: AppData): string[] {
  const set = new Set<string>();
  for (const place of data.places ?? []) {
    const name = place.trim();
    if (name) set.add(name);
  }
  for (const record of data.travelRecords) {
    if (record.fromPlace?.trim()) set.add(record.fromPlace.trim());
    if (record.toPlace?.trim()) set.add(record.toPlace.trim());
  }
  return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

export function rememberPlaces(data: AppData, ...names: string[]): void {
  data.places = collectPlaces({
    ...data,
    places: [...(data.places ?? []), ...names],
  });
}

const DATA_FILE = "app-data.json";
const localFile = path.resolve(process.cwd(), "server/data/app-data.json");

let cache: { data: AppData; etag: string; fileId?: string; at: number } | null = null;
let mutateQueue: Promise<void> = Promise.resolve();
const CACHE_MS = 1500;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function readLocal(): AppData {
  if (!fs.existsSync(localFile)) return emptyAppData();
  return normalize(JSON.parse(fs.readFileSync(localFile, "utf8")) as AppData);
}

function writeLocal(data: AppData): void {
  fs.mkdirSync(path.dirname(localFile), { recursive: true });
  fs.writeFileSync(localFile, JSON.stringify(data, null, 2));
}

function normalize(raw: AppData): AppData {
  const data: AppData = {
    users: raw.users ?? [],
    travelRecords: raw.travelRecords ?? [],
    invoiceCounters: raw.invoiceCounters ?? {},
    places: raw.places ?? [],
  };
  data.places = collectPlaces(data);
  return data;
}

async function loadRemote(): Promise<{ data: AppData; etag: string; fileId?: string }> {
  if (isAppsScriptConfigured()) {
    const data = normalize(await bridgeReadData<AppData>());
    return { data, etag: String(Date.now()) };
  }
  const fileId = await googleDriveService.ensureJsonFile(DATA_FILE, emptyAppData());
  const loaded = await googleDriveService.readJsonFile<AppData>(fileId);
  return { data: normalize(loaded.data), etag: loaded.etag, fileId };
}

export async function readAppData(): Promise<AppData> {
  if (cache && Date.now() - cache.at < CACHE_MS) return clone(cache.data);

  if (!isGoogleDriveConfigured()) {
    const data = readLocal();
    cache = { data, etag: "local", at: Date.now() };
    return clone(data);
  }

  const loaded = await loadRemote();
  cache = { ...loaded, at: Date.now() };
  return clone(loaded.data);
}

export async function mutateAppData<T>(mutator: (data: AppData) => T | Promise<T>): Promise<T> {
  const run = mutateQueue.then(async () => {
    for (let attempt = 0; attempt < 6; attempt++) {
      const current = isGoogleDriveConfigured()
        ? await loadRemote()
        : { data: readLocal(), etag: "local", fileId: undefined };
      const working = clone(current.data);
      const result = await mutator(working);

      if (!isGoogleDriveConfigured()) {
        writeLocal(working);
        cache = { data: working, etag: "local", at: Date.now() };
        logInfo("Saved application data to local JSON (Drive bridge not set yet)");
        return result;
      }

      try {
        if (isAppsScriptConfigured()) {
          await bridgeWriteData(working);
          cache = { data: working, etag: String(Date.now()), at: Date.now() };
          return result;
        }
        if (!isServiceAccountConfigured()) {
          throw new GoogleDriveError("Google Drive is not configured.");
        }
        const etag = await googleDriveService.writeJsonFile(
          current.fileId!,
          working,
          current.etag
        );
        cache = { data: working, etag, fileId: current.fileId, at: Date.now() };
        return result;
      } catch (error) {
        const code = (error as { code?: string }).code;
        if (code === "DRIVE_CONFLICT" && attempt < 5) {
          await new Promise((r) => setTimeout(r, 80 * (attempt + 1)));
          continue;
        }
        throw error;
      }
    }
    throw new GoogleDriveError("Unable to save data to Google Drive after several retries.");
  });

  mutateQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export function invalidateAppDataCache(): void {
  cache = null;
}
