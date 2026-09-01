import { env } from "./config/env";
import { createApp } from "./app";
import { logInfo } from "./utils/logger";

async function main(): Promise<void> {
  const app = await createApp();
  app.listen(env.port, () => {
    logInfo(`Travel Management API listening on port ${env.port}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
