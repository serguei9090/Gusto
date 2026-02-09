// Browser/Development Mock Database
// Used when running outside Tauri environment (Vite dev server, tests)

// Stateful mock data
let mockCurrencies = [
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    decimal_places: 2,
    is_active: 1,
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    decimal_places: 2,
    is_active: 1,
  },
];

const mockCurrencyChain = {
  select: () => mockCurrencyChain,
  selectAll: () => mockCurrencyChain,
  // biome-ignore lint/suspicious/noExplicitAny: Mock implementation
  where: (_col: any, _op: any, _val: any) => {
    // Basic filter support for delete check
    return mockCurrencyChain;
  },
  orderBy: () => mockCurrencyChain,
  execute: async () => [...mockCurrencies],
  executeTakeFirst: async () => mockCurrencies[0],
};

const mockStats = {
  totalValue: 5432.1,
  lowStockCount: 3,
  recipeCount: 12,
  avgMargin: 68.5,
};

const mockAggregateChain = {
  select: () => mockAggregateChain,
  executeTakeFirst: async () => ({
    count: mockStats.recipeCount,
    avgMargin: mockStats.avgMargin,
  }),
  execute: async () => [
    { current_stock: 10, current_price: 5, currency: "USD" },
    { current_stock: 20, current_price: 2.5, currency: "EUR" },
  ],
};

const mockGenericChain = {
  select: (selection: unknown) => {
    // Basic heuristic to detect dashboard queries
    if (
      Array.isArray(selection) &&
      selection.some(
        // biome-ignore lint/suspicious/noExplicitAny: Mock implementation
        (s: any) => s?.sql?.includes("COUNT") || s?.sql?.includes("AVG"),
      )
    ) {
      return mockAggregateChain;
    }
    return mockGenericChain;
  },
  selectAll: () => mockGenericChain,
  where: () => mockGenericChain,
  whereRef: () => mockGenericChain,
  orderBy: () => mockGenericChain,
  limit: () => mockGenericChain,
  returning: () => mockGenericChain,
  execute: async () => [], // Default empty array for unknown queries
  executeTakeFirst: async () => ({ count: 5 }), // Default count for simple counts
  returningAll: () => mockGenericChain,
  // biome-ignore lint/suspicious/noExplicitAny: Mock implementation
  values: (vals: any) => {
    // Simulate insert for currencies
    if (vals?.code) {
      mockCurrencies.push({ ...vals, is_active: 1 });
    }
    return mockGenericChain;
  },
  set: () => mockGenericChain,
  delete: () => mockGenericChain,
  updateTable: () => mockGenericChain,
  insertInto: () => mockGenericChain,
  onConflict: () => mockGenericChain,
  doUpdateSet: () => mockGenericChain,
  transaction: () => ({
    execute: async (cb: (trx: unknown) => Promise<unknown>) => cb(mockDb),
  }),
};

export const mockDb = {
  selectFrom: (table: string) => {
    if (table === "currencies") return mockCurrencyChain;
    return mockGenericChain;
  },
  insertInto: (table: string) => {
    if (table === "currencies") {
      return {
        // biome-ignore lint/suspicious/noExplicitAny: Mock implementation
        values: (vals: any) => {
          const newCurrency = { ...vals, is_active: 1 };
          mockCurrencies.push(newCurrency);
          return {
            returning: () => ({
              executeTakeFirstOrThrow: async () => newCurrency,
            }),
            returningAll: () => ({
              execute: async () => [newCurrency],
            }),
            execute: async () => ({ insertId: BigInt(Date.now()) }),
          };
        },
        // biome-ignore lint/suspicious/noExplicitAny: Mock implementation
      } as any;
    }
    return mockGenericChain;
  },
  updateTable: (_table: string) => mockGenericChain,
  deleteFrom: (table: string) => {
    if (table === "currencies") {
      return {
        where: (col: string, op: string, val: string) => ({
          execute: async () => {
            if (col === "code" && op === "=") {
              mockCurrencies = mockCurrencies.filter((c) => c.code !== val);
            }
            return { numAffectedRows: 1n };
          },
        }),
        // biome-ignore lint/suspicious/noExplicitAny: Mock implementation
      } as any;
    }
    return mockGenericChain;
  },
  transaction: () => ({
    execute: async (cb: (trx: unknown) => Promise<unknown>) => cb(mockDb),
  }),
};
