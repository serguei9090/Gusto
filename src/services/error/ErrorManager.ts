import { debug, error, info, warn } from "@tauri-apps/plugin-log";
import { toast } from "sonner";

/**
 * ErrorManager Service
 * Centralized dispatcher for all application errors and logs.
 */
class ErrorManager {
  private static instance: ErrorManager;

  private constructor() {}

  public static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager();
    }
    return ErrorManager.instance;
  }

  /**
   * Handle an error by logging it to the backend and showing a user notification.
   * @param err The error object or message
   * @param context Contextual information (e.g., component name, operation)
   * @param notifyUser Whether to show a toast to the user
   */
  public async handleError(err: unknown, context: string, notifyUser = true) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : "";

    // 1. Log to Tauri Backend (Rust)
    await error(`[${context}] ${message}${stack ? `\nStack: ${stack}` : ""}`);

    // 2. Notify User if requested
    if (notifyUser) {
      toast.error("Something went wrong", {
        description: this.getFriendlyMessage(message, context),
        duration: 5000,
      });
    }
  }

  /**
   * Log a warning
   */
  public async logWarning(message: string, context: string) {
    await warn(`[${context}] ${message}`);
  }

  /**
   * Log info
   */
  public async logInfo(message: string, context: string) {
    await info(`[${context}] ${message}`);
  }

  /**
   * Log debug
   */
  public async logDebug(message: string, context: string) {
    await debug(`[${context}] ${message}`);
  }

  /**
   * Translate technical errors into user-friendly messages
   */
  private getFriendlyMessage(message: string, context: string): string {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes("no such column") || lowerMsg.includes("sql")) {
      return "Database structure mismatch. Re-trying auto-migration...";
    }
    if (lowerMsg.includes("database") || lowerMsg.includes("connection")) {
      return "Could not connect to the database. Please restart the app.";
    }
    if (lowerMsg.includes("network") || lowerMsg.includes("fetch")) {
      return "Network connection issue detected.";
    }

    return `An error occurred during ${context}. Team has been notified.`;
  }
}

export const errorManager = ErrorManager.getInstance();
