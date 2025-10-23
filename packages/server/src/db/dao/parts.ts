import { db } from "../index.js";
import type { Part } from "@partflow/core";

export class PartsDAO {
  // 创建零件
  static create(part: Part): Part {
    const stmt = db.prepare(`
      INSERT INTO parts (
        id, name, specification, material, tags, category_id, location_id,
        quantity, min_quantity, image_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      part.id,
      part.name,
      part.specification || null,
      part.material || null,
      part.tags ? JSON.stringify(part.tags) : null,
      part.categoryId || null,
      part.locationId || null,
      part.quantity,
      part.minQuantity || null,
      part.imageUrl || null,
      part.createdAt,
      part.updatedAt
    );

    return part;
  }

  // 获取所有零件
  static findAll(): Part[] {
    const stmt = db.prepare("SELECT * FROM parts ORDER BY created_at DESC");
    const rows = stmt.all() as any[];
    
    return rows.map(row => this.mapRowToPart(row));
  }

  // 根据 ID 获取零件
  static findById(id: string): Part | null {
    const stmt = db.prepare("SELECT * FROM parts WHERE id = ?");
    const row = stmt.get(id) as any;
    
    return row ? this.mapRowToPart(row) : null;
  }

  // 搜索零件
  static search(params: {
    search?: string;
    categoryId?: string;
    locationId?: string;
    lowStock?: boolean;
  }): Part[] {
    let sql = "SELECT * FROM parts WHERE 1=1";
    const values: any[] = [];

    if (params.search) {
      sql += " AND (name LIKE ? OR specification LIKE ? OR material LIKE ?)";
      const searchPattern = `%${params.search}%`;
      values.push(searchPattern, searchPattern, searchPattern);
    }

    if (params.categoryId) {
      sql += " AND category_id = ?";
      values.push(params.categoryId);
    }

    if (params.locationId) {
      sql += " AND location_id = ?";
      values.push(params.locationId);
    }

    if (params.lowStock) {
      sql += " AND quantity <= COALESCE(min_quantity, 0)";
    }

    sql += " ORDER BY created_at DESC";

    const stmt = db.prepare(sql);
    const rows = stmt.all(...values) as any[];
    
    return rows.map(row => this.mapRowToPart(row));
  }

  // 更新零件
  static update(id: string, updates: Partial<Part>): Part | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const stmt = db.prepare(`
      UPDATE parts SET
        name = ?,
        specification = ?,
        material = ?,
        tags = ?,
        category_id = ?,
        location_id = ?,
        quantity = ?,
        min_quantity = ?,
        image_url = ?,
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.name,
      updated.specification || null,
      updated.material || null,
      updated.tags ? JSON.stringify(updated.tags) : null,
      updated.categoryId || null,
      updated.locationId || null,
      updated.quantity,
      updated.minQuantity || null,
      updated.imageUrl || null,
      updated.updatedAt,
      id
    );

    return updated;
  }

  // 更新库存
  static updateQuantity(id: string, quantity: number): Part | null {
    const stmt = db.prepare(`
      UPDATE parts SET quantity = ?, updated_at = ? WHERE id = ?
    `);

    const updatedAt = new Date().toISOString();
    stmt.run(quantity, updatedAt, id);

    return this.findById(id);
  }

  // 删除零件
  static delete(id: string): boolean {
    const stmt = db.prepare("DELETE FROM parts WHERE id = ?");
    const result = stmt.run(id);
    
    return result.changes > 0;
  }

  // 映射数据库行到 Part 对象
  private static mapRowToPart(row: any): Part {
    return {
      id: row.id,
      name: row.name,
      specification: row.specification || undefined,
      material: row.material || undefined,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      categoryId: row.category_id || undefined,
      locationId: row.location_id || undefined,
      quantity: row.quantity,
      minQuantity: row.min_quantity || undefined,
      imageUrl: row.image_url || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

