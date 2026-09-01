import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env";
import { seedIfEmpty } from "./db/seed";
import api from "./routes";
import { apiLimiter } from "./middleware/rateLimit";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { logInfo } from "./utils/logger";

let ready: Promise<Express> | null = null;

export function createApp(): Promise<Express> {
  if (ready) return ready;
  ready = (async () => {
    logInfo("Preparing Travel Management API...");
    await seedIfEmpty();

    const app = express();
    app.set("trust proxy", 1);
    app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
    app.use(
      cors({
        origin: (origin, cb) => {
          if (!origin) return cb(null, true);
          if (env.clientOrigins.includes(origin) || env.clientOrigins.includes("*")) {
            return cb(null, true);
          }
          if (origin.endsWith(".netlify.app") || origin.includes("localhost")) {
            return cb(null, true);
          }
          return cb(null, false);
        },
        credentials: true,
      })
    );
    app.use(express.json({ limit: "1mb" }));
    app.use(cookieParser());
    if (env.nodeEnv !== "production") {
      app.use(morgan("dev"));
    }
    app.use("/api", apiLimiter, api);
    app.use(notFound);
    app.use(errorHandler);
    return app;
  })();
  return ready;
}
