import type { Selectable } from "kysely";

import { getDb } from "@/lib/db";
import type {
  Asset,
  AssetType,
  CreateAssetInput,
  UpdateAssetInput,
} from "@/types/asset.types";
import type { AssetsTable } from "@/types/db.types";
import { logger } from "@/utils/logger";

export type AssetRow = Selectable<AssetsTable>;

export class AssetsRepository {
  async create(data: CreateAssetInput): Promise<Asset> {
    logger.debug("AssetsRepository.create: Starting insert", data);

    const payload = {
      name: data.name,
      category: data.category,
      unit_of_measure: data.unitOfMeasure,
      current_price: data.currentPrice
        ? Number(data.currentPrice.toFixed(2))
        : 0,
      price_per_unit: data.pricePerUnit
        ? Number(data.pricePerUnit.toFixed(2))
        : 0,
      currency: data.currency || "USD",
      supplier_id: data.supplierId || null,
      min_stock_level: data.minStockLevel || 0,
      current_stock: data.currentStock || 0,
      notes: data.notes || null,
      purchase_unit: data.purchaseUnit || null,
      conversion_ratio: data.conversionRatio || 1,
      is_active: data.isActive === false ? 0 : 1,
      asset_type: data.assetType || "operational",
    };

    try {
      const result = await getDb()
        .insertInto("assets")
        .values(payload)
        .returning("id")
        .executeTakeFirst();

      if (!result?.id) {
        logger.error("AssetsRepository.create: Failed to retrieve ID.", {
          payload,
          result,
        });
        throw new Error("Failed to insert asset: could not retrieve ID.");
      }

      logger.debug("AssetsRepository.create: Insert successful", result);

      // Record initial stock transaction if stock > 0
      if (data.currentStock && data.currentStock > 0) {
        await getDb()
          .insertInto("inventory_transactions")
          .values({
            asset_id: result.id,
            item_type: "asset",
            transaction_type: "purchase",
            quantity: data.currentStock,
            cost_per_unit: data.pricePerUnit || 0,
            total_cost: (data.currentStock || 0) * (data.pricePerUnit || 0),
            notes: "Initial stock on creation",
          })
          .execute();
      }

      return this.getById(result.id) as Promise<Asset>;
    } catch (error) {
      logger.error("AssetsRepository.create: DB Error", error);
      throw error;
    }
  }

  async getById(id: number): Promise<Asset | null> {
    const row = await getDb()
      .selectFrom("assets")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    return row ? this.mapRowToAsset(row) : null;
  }

  async getAll(): Promise<Asset[]> {
    const rows = await getDb()
      .selectFrom("assets")
      .selectAll()
      .where("is_active", "=", 1)
      .orderBy("name", "asc")
      .execute();

    return rows.map(this.mapRowToAsset);
  }

  private buildUpdateData(data: UpdateAssetInput): Record<string, unknown> {
    const updateData: Record<string, unknown> = {
      last_updated: new Date().toISOString(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.unitOfMeasure !== undefined)
      updateData.unit_of_measure = data.unitOfMeasure;
    if (data.currentPrice !== undefined)
      updateData.current_price = Number(data.currentPrice.toFixed(2));
    if (data.pricePerUnit !== undefined)
      updateData.price_per_unit = Number(data.pricePerUnit.toFixed(2));
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.supplierId !== undefined) updateData.supplier_id = data.supplierId;
    if (data.minStockLevel !== undefined)
      updateData.min_stock_level = data.minStockLevel;
    if (data.currentStock !== undefined)
      updateData.current_stock = data.currentStock;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.purchaseUnit !== undefined)
      updateData.purchase_unit = data.purchaseUnit;
    if (data.conversionRatio !== undefined)
      updateData.conversion_ratio = data.conversionRatio;
    if (data.isActive !== undefined)
      updateData.is_active = data.isActive ? 1 : 0;
    if (data.assetType !== undefined) updateData.asset_type = data.assetType;

    return updateData;
  }

  async update(id: number, data: UpdateAssetInput): Promise<Asset | null> {
    const updateData = this.buildUpdateData(data);

    const result = await getDb()
      .updateTable("assets")
      .set(updateData)
      .where("id", "=", id)
      .returning("id")
      .executeTakeFirst();

    if (!result) return null;

    return this.getById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await getDb()
      .deleteFrom("assets")
      .where("id", "=", id)
      .executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
  }

  async archive(id: number): Promise<boolean> {
    const result = await getDb()
      .updateTable("assets")
      .set({ is_active: 0 })
      .where("id", "=", id)
      .executeTakeFirst();

    return Number(result.numUpdatedRows) > 0;
  }

  async search(query: string): Promise<Asset[]> {
    const rows = await getDb()
      .selectFrom("assets")
      .selectAll()
      .where("name", "like", `%${query}%`)
      .where("is_active", "=", 1)
      .orderBy("name", "asc")
      .execute();

    return rows.map(this.mapRowToAsset);
  }

  async getLowStock(): Promise<Asset[]> {
    const rows = await getDb()
      .selectFrom("assets")
      .selectAll()
      .where((eb) =>
        eb.and([
          eb("min_stock_level", "is not", null),
          eb("current_stock", "<", eb.ref("min_stock_level")),
          eb("is_active", "=", 1),
        ]),
      )
      .execute();

    return rows.map(this.mapRowToAsset);
  }

  private mapRowToAsset(row: AssetRow): Asset {
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      unitOfMeasure: row.unit_of_measure,
      currentPrice: row.current_price,
      pricePerUnit: row.price_per_unit || 0,
      currency: row.currency as Asset["currency"],
      supplierId: row.supplier_id,
      minStockLevel: row.min_stock_level,
      currentStock: row.current_stock,
      lastUpdated: row.last_updated,
      notes: row.notes,
      purchaseUnit: row.purchase_unit,
      conversionRatio: row.conversion_ratio,
      isActive: Boolean(row.is_active),
      assetType: (row.asset_type as AssetType) || "operational",
    };
  }
}

export const assetsRepository = new AssetsRepository();
