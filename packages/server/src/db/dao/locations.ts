import { db } from "../index.js";
import type { Location } from "@partflow/core";

export class LocationsDAO {
  // 创建盒子
  static create(location: Location): Location {
    const stmt = db.prepare(`
      INSERT INTO locations (id, code, name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      location.id,
      location.code,
      location.name || null,
      location.description || null,
      location.createdAt,
      location.updatedAt
    );

    return location;
  }

  // 根据编号查找盒子（用于唯一性检查）
  static findByCode(code: string): Location | null {
    const stmt = db.prepare("SELECT * FROM locations WHERE code = ?");
    const row = stmt.get(code.toUpperCase()) as any;
    
    return row ? this.mapRowToLocation(row) : null;
  }

  // 获取所有盒子
  static findAll(): Location[] {
    const stmt = db.prepare("SELECT * FROM locations ORDER BY code ASC");
    const rows = stmt.all() as any[];
    
    return rows.map(row => this.mapRowToLocation(row));
  }

  // 根据 ID 获取盒子
  static findById(id: string): Location | null {
    const stmt = db.prepare("SELECT * FROM locations WHERE id = ?");
    const row = stmt.get(id) as any;
    
    return row ? this.mapRowToLocation(row) : null;
  }

  // 更新盒子
  static update(id: string, updates: Partial<Location>): Location | null {
    const existing = this.findById(id);
    if (!existing) return null;

    // 如果更新了 code，检查是否与其他盒子重复
    if (updates.code && updates.code !== existing.code) {
      const duplicate = this.findByCode(updates.code);
      if (duplicate) {
        throw new Error(`盒子编号 ${updates.code} 已存在`);
      }
    }

    const updated = {
      ...existing,
      ...updates,
      code: updates.code ? updates.code.toUpperCase() : existing.code,
      updatedAt: new Date().toISOString()
    };

    const stmt = db.prepare(`
      UPDATE locations SET
        code = ?,
        name = ?,
        description = ?,
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.code,
      updated.name || null,
      updated.description || null,
      updated.updatedAt,
      id
    );

    return updated;
  }

  // 删除盒子
  static delete(id: string): boolean {
    const stmt = db.prepare("DELETE FROM locations WHERE id = ?");
    const result = stmt.run(id);
    
    return result.changes > 0;
  }

  // 映射数据库行到 Location 对象
  private static mapRowToLocation(row: any): Location {
    return {
      id: row.id,
      code: row.code,
      name: row.name || undefined,
      description: row.description || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

