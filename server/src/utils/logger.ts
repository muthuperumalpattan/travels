export function logError(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  console.error(`[${new Date().toISOString()}] ${context}: ${message}`);
  if (stack && process.env.NODE_ENV !== "production") {
    console.error(stack);
  }
}

export function logInfo(message: string): void {
  console.log(`[${new Date().toISOString()}] ${message}`);
}
