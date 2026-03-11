// lib/logger.ts
export function logError(context: string, error: unknown) {
  console.error(`[${context}]`, error);
}
