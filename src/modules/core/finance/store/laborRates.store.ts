import Database from "@tauri-apps/plugin-sql";
import { create } from "zustand";

export interface LaborRate {
  id: number;
  name: string;
  hourly_rate: number;
  currency: string;
  is_active: boolean;
}

interface LaborRatesState {
  rates: LaborRate[];
  isLoading: boolean;
  error: string | null;

  loadRates: () => Promise<void>;
  addRate: (name: string, rate: number) => Promise<void>;
  updateRate: (id: number, updates: Partial<LaborRate>) => Promise<void>;
  deleteRate: (id: number) => Promise<void>;
}

export const useLaborRatesStore = create<LaborRatesState>((set, get) => ({
  rates: [],
  isLoading: false,
  error: null,

  loadRates: async () => {
    set({ isLoading: true, error: null });
    try {
      const db = await Database.load("sqlite:gusto.db");
      // biome-ignore lint/suspicious/noExplicitAny: Raw DB result
      const result = await db.select<any[]>(
        "SELECT * FROM labor_rates WHERE is_active = 1",
      );

      // Parse rate string to numbers
      const rates = result.map((r) => ({
        ...r,
        hourly_rate: Number(r.hourly_rate),
        is_active: Boolean(r.is_active),
      }));

      set({ rates, isLoading: false });
    } catch (err) {
      console.error(err);
      set({ error: "Failed to load labor rates", isLoading: false });
    }
  },

  addRate: async (name, rate) => {
    try {
      const db = await Database.load("sqlite:gusto.db");
      await db.execute(
        "INSERT INTO labor_rates (name, hourly_rate) VALUES ($1, $2)",
        [name, rate.toFixed(4)],
      );
      await get().loadRates();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  updateRate: async (id, updates) => {
    try {
      const db = await Database.load("sqlite:gusto.db");
      if (updates.name !== undefined) {
        await db.execute("UPDATE labor_rates SET name = $1 WHERE id = $2", [
          updates.name,
          id,
        ]);
      }
      if (updates.hourly_rate !== undefined) {
        await db.execute(
          "UPDATE labor_rates SET hourly_rate = $1 WHERE id = $2",
          [updates.hourly_rate.toFixed(4), id],
        );
      }
      await get().loadRates();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  deleteRate: async (id) => {
    try {
      const db = await Database.load("sqlite:gusto.db");
      await db.execute("UPDATE labor_rates SET is_active = 0 WHERE id = $1", [
        id,
      ]);
      await get().loadRates();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
}));
