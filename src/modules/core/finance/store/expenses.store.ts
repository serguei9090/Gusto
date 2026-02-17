import Database from "@tauri-apps/plugin-sql";
import { create } from "zustand";

export interface FixedExpense {
  id: number;
  name: string;
  amount: number;
  period: "Monthly" | "Yearly";
  is_active: boolean;
}

export interface VariableExpense {
  id: number;
  name: string;
  rate: number;
  type: "PercentOfSales" | "FixedAmount";
  is_active: boolean;
}

interface ExpensesState {
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
  isLoading: boolean;
  error: string | null;

  loadExpenses: () => Promise<void>;

  // Fixed Expenses CRUD
  addFixedExpense: (
    name: string,
    amount: number,
    period: "Monthly" | "Yearly",
  ) => Promise<void>;
  updateFixedExpense: (
    id: number,
    updates: Partial<FixedExpense>,
  ) => Promise<void>;
  deleteFixedExpense: (id: number) => Promise<void>;

  // Variable Expenses CRUD
  addVariableExpense: (
    name: string,
    rate: number,
    type: "PercentOfSales" | "FixedAmount",
  ) => Promise<void>;
  updateVariableExpense: (
    id: number,
    updates: Partial<VariableExpense>,
  ) => Promise<void>;
  deleteVariableExpense: (id: number) => Promise<void>;
}

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  fixedExpenses: [],
  variableExpenses: [],
  isLoading: false,
  error: null,

  loadExpenses: async () => {
    set({ isLoading: true, error: null });
    try {
      const db = await Database.load("sqlite:gusto.db");

      // biome-ignore lint/suspicious/noExplicitAny: Raw DB result
      const fixedResult = await db.select<any[]>(
        "SELECT * FROM fixed_expenses WHERE is_active = 1",
      );
      const fixedExpenses = fixedResult.map((r) => ({
        ...r,
        amount: Number(r.amount),
        is_active: Boolean(r.is_active),
      }));

      // biome-ignore lint/suspicious/noExplicitAny: Raw DB result
      const variableResult = await db.select<any[]>(
        "SELECT * FROM variable_expenses WHERE is_active = 1",
      );
      const variableExpenses = variableResult.map((r) => ({
        ...r,
        rate: Number(r.rate),
        is_active: Boolean(r.is_active),
      }));

      set({ fixedExpenses, variableExpenses, isLoading: false });
    } catch (err) {
      console.error(err);
      set({ error: "Failed to load expenses", isLoading: false });
    }
  },

  addFixedExpense: async (name, amount, period) => {
    try {
      const db = await Database.load("sqlite:gusto.db");
      await db.execute(
        "INSERT INTO fixed_expenses (name, amount, period) VALUES ($1, $2, $3)",
        [name, amount.toFixed(2), period],
      );
      await get().loadExpenses();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  updateFixedExpense: async (id, updates) => {
    try {
      const db = await Database.load("sqlite:gusto.db");
      if (updates.name !== undefined) {
        await db.execute("UPDATE fixed_expenses SET name = $1 WHERE id = $2", [
          updates.name,
          id,
        ]);
      }
      if (updates.amount !== undefined) {
        await db.execute(
          "UPDATE fixed_expenses SET amount = $1 WHERE id = $2",
          [updates.amount.toFixed(2), id],
        );
      }
      if (updates.period !== undefined) {
        await db.execute(
          "UPDATE fixed_expenses SET period = $1 WHERE id = $2",
          [updates.period, id],
        );
      }
      await get().loadExpenses();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  deleteFixedExpense: async (id) => {
    try {
      const db = await Database.load("sqlite:gusto.db");
      await db.execute(
        "UPDATE fixed_expenses SET is_active = 0 WHERE id = $1",
        [id],
      );
      await get().loadExpenses();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  addVariableExpense: async (name, rate, type) => {
    try {
      const db = await Database.load("sqlite:gusto.db");
      await db.execute(
        "INSERT INTO variable_expenses (name, rate, type) VALUES ($1, $2, $3)",
        [name, rate.toFixed(4), type],
      );
      await get().loadExpenses();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  updateVariableExpense: async (id, updates) => {
    try {
      const db = await Database.load("sqlite:gusto.db");
      if (updates.name !== undefined) {
        await db.execute(
          "UPDATE variable_expenses SET name = $1 WHERE id = $2",
          [updates.name, id],
        );
      }
      if (updates.rate !== undefined) {
        await db.execute(
          "UPDATE variable_expenses SET rate = $1 WHERE id = $2",
          [updates.rate.toFixed(4), id],
        );
      }
      if (updates.type !== undefined) {
        await db.execute(
          "UPDATE variable_expenses SET type = $1 WHERE id = $2",
          [updates.type, id],
        );
      }
      await get().loadExpenses();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  deleteVariableExpense: async (id) => {
    try {
      const db = await Database.load("sqlite:gusto.db");
      await db.execute(
        "UPDATE variable_expenses SET is_active = 0 WHERE id = $1",
        [id],
      );
      await get().loadExpenses();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
}));
