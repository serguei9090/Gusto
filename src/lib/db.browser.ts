// Browser/Development Mock Database
// Used when running outside Tauri environment (Vite dev server, tests)

const mockChain = {
    select: () => mockChain,
    selectAll: () => mockChain,
    where: () => mockChain,
    whereRef: () => mockChain,
    orderBy: () => mockChain,
    limit: () => mockChain,
    execute: async () => [],
    executeTakeFirst: async () => ({
        totalValue: 0,
        count: 0,
        avgMargin: 0,
        target_cost_percentage: 0,
        selling_price: 0,
        current_stock: 0,
        min_stock_level: 0,
    }),
    executeTakeFirstOrThrow: async () => ({ id: 1, name: "Mock Item" }),
    returningAll: () => mockChain,
    values: () => mockChain,
    set: () => mockChain,
    delete: () => mockChain,
    updateTable: () => mockChain,
    insertInto: () => mockChain,
    transaction: () => ({ execute: async (cb: any) => cb(mockDb) }),
};

export const mockDb: any = {
    selectFrom: (_table: string) => mockChain,
    insertInto: (_table: string) => mockChain,
    updateTable: (_table: string) => mockChain,
    deleteFrom: (_table: string) => mockChain,
    transaction: () => ({ execute: async (cb: (trx: any) => Promise<any>) => cb(mockDb) }),
};
