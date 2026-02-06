import { logger } from "./logger";

type AsyncAction<T> = (...args: unknown[]) => Promise<T>;

export const runWithHandling = async <T>(
  actionName: string,
  action: AsyncAction<T>,
  onError?: (error: unknown) => void,
): Promise<T | undefined> => {
  try {
    logger.debug(`Starting action: ${actionName}`);
    const result = await action();
    logger.debug(`Completed action: ${actionName}`);
    return result;
  } catch (error) {
    logger.error(`Failed action: ${actionName}`, error);
    if (onError) {
      onError(error);
    } else {
      // Default global error behavior could go here (e.g. toast)
      // For now, we just rethrow or let the caller handle if they want
      throw error;
    }
  }
};
