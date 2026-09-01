import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function requiredInProduction(name: string, fallback: string): string {
  const value = process.env[name] ?? fallback;
  if (process.env.NODE_ENV === "production" && !process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const origins = (process.env.CLIENT_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  clientOrigin: origins[0],
  clientOrigins: origins,
  jwtSecret: requiredInProduction("JWT_SECRET", "dev-only-change-me-travel-secret"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  cookieSecure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
  google: {
    enabled: process.env.GOOGLE_DRIVE_ENABLED !== "false",
    projectId: process.env.GOOGLE_PROJECT_ID ?? "",
    clientEmail: process.env.GOOGLE_CLIENT_EMAIL ?? "",
    privateKey: (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    rootFolderId: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ?? "",
    appsScriptUrl: process.env.GOOGLE_APPS_SCRIPT_URL ?? "",
    bridgeSecret: process.env.DRIVE_BRIDGE_SECRET ?? "",
  },
};

export function isAppsScriptConfigured(): boolean {
  return Boolean(env.google.appsScriptUrl && env.google.bridgeSecret && env.google.rootFolderId);
}

export function isServiceAccountConfigured(): boolean {
  return Boolean(env.google.clientEmail && env.google.privateKey && env.google.rootFolderId);
}

export function isGoogleDriveConfigured(): boolean {
  return Boolean(env.google.enabled && (isAppsScriptConfigured() || isServiceAccountConfigured()));
}
