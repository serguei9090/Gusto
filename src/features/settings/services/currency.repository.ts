import { sql } from "kysely";
import { db } from "@/lib/db";

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isActive: boolean;
}

export interface ExchangeRate {
  id: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: string;
  source?: string;
}

/**
 * Currency Repository for managing currencies and exchange rates
 */
export class CurrencyRepository {
  /**
   * Get all active currencies
   */
  async getAllCurrencies(): Promise<Currency[]> {
    const result = await db
      .selectFrom("currencies")
      .selectAll()
      .orderBy("code")
      .execute();

    return result.map((row) => ({
      code: row.code,
      name: row.name,
      symbol: row.symbol,
      decimalPlaces: row.decimal_places,
      isActive: row.is_active === 1,
    }));
  }

  /**
   * Get a specific currency by code
   */
  async getCurrency(code: string): Promise<Currency | null> {
    const result = await db
      .selectFrom("currencies")
      .selectAll()
      .where("code", "=", code)
      .executeTakeFirst();

    if (!result) return null;

    return {
      code: result.code,
      name: result.name,
      symbol: result.symbol,
      decimalPlaces: result.decimal_places,
      isActive: result.is_active === 1,
    };
  }

  /**
   * Get all exchange rates
   */
  async getAllExchangeRates(): Promise<ExchangeRate[]> {
    const result = await db
      .selectFrom("exchange_rates as er1")
      .selectAll()
      .where("effective_date", "=", (eb) =>
        eb
          .selectFrom("exchange_rates as er2")
          .select(sql<string>`MAX(er2.effective_date)`.as("max_date"))
          .whereRef("er2.from_currency", "=", "er1.from_currency")
          .whereRef("er2.to_currency", "=", "er1.to_currency"),
      )
      .orderBy("from_currency")
      .orderBy("to_currency")
      .execute();

    return result.map((row) => ({
      id: row.id,
      fromCurrency: row.from_currency,
      toCurrency: row.to_currency,
      rate: row.rate,
      effectiveDate: row.effective_date,
      source: row.source || undefined,
    }));
  }

  /**
   * Get exchange rate for a specific currency pair
   */
  async getExchangeRate(
    fromCurrency: string,
    toCurrency: string,
  ): Promise<ExchangeRate | null> {
    const result = await db
      .selectFrom("exchange_rates")
      .selectAll()
      .where("from_currency", "=", fromCurrency)
      .where("to_currency", "=", toCurrency)
      .orderBy("effective_date", "desc")
      .limit(1)
      .executeTakeFirst();

    if (!result) return null;

    return {
      id: result.id,
      fromCurrency: result.from_currency,
      toCurrency: result.to_currency,
      rate: result.rate,
      effectiveDate: result.effective_date,
      source: result.source || undefined,
    };
  }

  /**
   * Add a new exchange rate
   */
  async addExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    rate: number,
    effectiveDate?: string,
    source?: string,
  ): Promise<void> {
    await db
      .insertInto("exchange_rates")
      .values({
        from_currency: fromCurrency,
        to_currency: toCurrency,
        rate,
        effective_date: effectiveDate || sql<string>`date('now')`,
        source: source || "manual",
      })
      .execute();
  }

  /**
   * Update exchange rate (creates new entry with new date)
   */
  async updateExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    rate: number,
    source?: string,
  ): Promise<void> {
    await db
      .insertInto("exchange_rates")
      .values({
        from_currency: fromCurrency,
        to_currency: toCurrency,
        rate,
        effective_date: sql<string>`date('now')`,
        source: source || "manual",
      })
      .execute();
  }

  /**
   * Delete an exchange rate by ID
   */
  async deleteExchangeRate(id: number): Promise<void> {
    await db.deleteFrom("exchange_rates").where("id", "=", id).execute();
  }

  /**
   * Get base currency from app settings
   */
  async getBaseCurrency(): Promise<string> {
    const result = await db
      .selectFrom("app_settings")
      .select("value")
      .where("key", "=", "base_currency")
      .executeTakeFirst();

    return result?.value || "USD";
  }

  /**
   * Set base currency in app settings
   */
  async setBaseCurrency(currencyCode: string): Promise<void> {
    await db
      .insertInto("app_settings")
      .values({
        key: "base_currency",
        value: currencyCode,
        updated_at: sql<string>`CURRENT_TIMESTAMP`,
      })
      .onConflict((oc) =>
        oc.column("key").doUpdateSet({
          value: currencyCode,
          updated_at: sql<string>`CURRENT_TIMESTAMP`,
        }),
      )
      .execute();
  }

  /**
   * Add a new currency
   */
  async addCurrency(currency: Omit<Currency, "isActive">): Promise<void> {
    await db
      .insertInto("currencies")
      .values({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        decimal_places: currency.decimalPlaces,
        is_active: 1,
      })
      .execute();
  }

  /**
   * Toggle currency active status
   */
  async toggleCurrencyStatus(code: string): Promise<void> {
    await db
      .updateTable("currencies")
      .set({
        is_active: sql<number>`CASE WHEN is_active = 1 THEN 0 ELSE 1 END`,
      })
      .where("code", "=", code)
      .execute();
  }

  /**
   * Check if currency is used in any records
   */
  async checkCurrencyUsage(code: string): Promise<boolean> {
    const ingredientCount = await db
      .selectFrom("ingredients")
      .select(sql<number>`count(*)`.as("count"))
      .where("currency", "=", code)
      .executeTakeFirst();

    const recipeCount = await db
      .selectFrom("recipes")
      .select(sql<number>`count(*)`.as("count"))
      .where("currency", "=", code)
      .executeTakeFirst();

    // Check recipe versions as well to be safe
    const versionCount = await db
      .selectFrom("recipe_versions")
      .select(sql<number>`count(*)`.as("count"))
      .where("currency", "=", code)
      .executeTakeFirst();

    const totalUsage =
      (Number(ingredientCount?.count) || 0) +
      (Number(recipeCount?.count) || 0) +
      (Number(versionCount?.count) || 0);

    return totalUsage > 0;
  }

  /**
   * Delete a currency and its associated exchange rates
   */
  async deleteCurrency(code: string): Promise<void> {
    // Delete associated exchange rates
    await db
      .deleteFrom("exchange_rates")
      .where((eb) =>
        eb.or([eb("from_currency", "=", code), eb("to_currency", "=", code)]),
      )
      .execute();

    // Delete the currency
    await db.deleteFrom("currencies").where("code", "=", code).execute();
  }
}

export const currencyRepository = new CurrencyRepository();
