import Database from "@tauri-apps/plugin-sql";
import { create } from "zustand";

export interface IncomeEntry {
  id: number;
  date: string;
  amount: number;
  description: string;
  source: string;
  recipe_id?: number | null;
  quantity?: number;
}

interface IncomeState {
  entries: IncomeEntry[];
  isLoading: boolean;
  error: string | null;

  loadIncome: (startDate?: string, endDate?: string) => Promise<void>;
  addIncome: (
    date: string,
    amount: number,
    description: string,
    source?: string,
    recipeId?: number | null,
    quantity?: number,
  ) => Promise<void>;
  deleteIncome: (id: number) => Promise<void>;
}

export const useIncomeStore = create<IncomeState>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,

  loadIncome: async (startDate, endDate) => {
    set({ isLoading: true, error: null });
    try {
      const db = await Database.load("sqlite:gusto.db");
      let query = "SELECT * FROM income_entries ORDER BY date DESC";
      const params: (string | number)[] = [];

      if (startDate && endDate) {
        query =
          "SELECT * FROM income_entries WHERE date BETWEEN $1 AND $2 ORDER BY date DESC";
        params.push(startDate, endDate);
      }

      // biome-ignore lint/suspicious/noExplicitAny: Raw DB result
      const result = await db.select<any[]>(query, params);

      const entries = result.map((r) => ({
        ...r,
        amount: Number(r.amount),
        quantity: r.quantity ? Number(r.quantity) : 1,
      }));

      set({ entries, isLoading: false });
    } catch (err) {
      console.error(err);
      set({ error: "Failed to load income entries", isLoading: false });
    }
  },

  addIncome: async (
    date,
    amount,
    description,
    source = "Sales",
    recipeId = null,
    quantity = 1,
  ) => {
    try {
      const db = await Database.load("sqlite:gusto.db");
      await db.execute(
        "INSERT INTO income_entries (date, amount, description, source, recipe_id, quantity) VALUES ($1, $2, $3, $4, $5, $6)",
        [date, amount.toFixed(2), description, source, recipeId, quantity],
      );
      // Reload current view
      await get().loadIncome();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  deleteIncome: async (id) => {
    try {
      const db = await Database.load("sqlite:gusto.db");
      await db.execute("DELETE FROM income_entries WHERE id = $1", [id]);
      // Reload current view
      await get().loadIncome();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
}));
