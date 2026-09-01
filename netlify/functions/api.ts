import type { Handler, HandlerEvent } from "@netlify/functions";
import serverless from "serverless-http";
import { createApp } from "../../server/src/app";

let proxy: ReturnType<typeof serverless> | null = null;

export const handler: Handler = async (event, context) => {
  if (!proxy) {
    const app = await createApp();
    proxy = serverless(app, {
      binary: ["application/pdf", "application/octet-stream"],
    });
  }
  const path = event.path && !event.path.startsWith("/api")
    ? (event.path.startsWith("/") ? `/api${event.path}` : `/api/${event.path}`)
    : event.path;
  const nextEvent = { ...event, path } as HandlerEvent;
  return proxy(nextEvent, context);
};
