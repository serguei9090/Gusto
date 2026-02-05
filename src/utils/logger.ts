export const isDebugMode = () => {
    return (import.meta as any).env.VITE_DEBUG_MODE === 'true';
};

export const logger = {
    debug: (message: string, ...args: any[]) => {
        if (isDebugMode()) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    },
    error: (message: string, ...args: any[]) => {
        console.error(`[ERROR] ${message}`, ...args);
    },
    info: (message: string, ...args: any[]) => {
        console.info(`[INFO] ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
        console.warn(`[WARN] ${message}`, ...args);
    }
};
