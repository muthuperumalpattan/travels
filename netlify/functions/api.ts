import type { Handler, HandlerEvent } from "@netlify/functions";
import serverless from "serverless-http";
import { createApp } from "../../server/src/app";

let proxy: ReturnType<typeof serverless> | null = null;

function resolveApiPath(event: HandlerEvent): string {
  let pathname = event.path || "/";
  try {
    if (event.rawUrl) pathname = new URL(event.rawUrl).pathname || pathname;
  } catch {
    /* keep event.path */
  }

  pathname = pathname.split("?")[0] || "/";

  const markers = ["/.netlify/functions/api", "/api"];
  for (const marker of markers) {
    if (pathname === marker || pathname.startsWith(`${marker}/`)) {
      const rest = pathname.slice(marker.length) || "/";
      return `/api${rest.startsWith("/") ? rest : `/${rest}`}`;
    }
  }

  return pathname.startsWith("/api") ? pathname : `/api${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export const handler: Handler = async (event, context) => {
  if (!proxy) {
    const app = await createApp();
    proxy = serverless(app, {
      binary: ["application/pdf", "application/octet-stream"],
    });
  }

  const path = resolveApiPath(event);
  const nextEvent = { ...event, path } as HandlerEvent;
  return proxy(nextEvent, context);
};
