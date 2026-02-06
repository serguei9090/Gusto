export const isDebugMode = () => {
  // biome-ignore lint/suspicious/noExplicitAny: Vite environment variables
  return (import.meta as any).env.VITE_DEBUG_MODE === "true";
};

export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (isDebugMode()) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  info: (message: string, ...args: unknown[]) => {
    console.info(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
};
