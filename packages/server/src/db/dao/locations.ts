import { db } from "../index.js";
import type { Location } from "@partflow/core";

export class LocationsDAO {
  // 创建位置
  static create(location: Location): Location {
    const stmt = db.prepare(`
      INSERT INTO locations (id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      location.id,
      location.name,
      location.description || null,
      location.createdAt,
      location.updatedAt
    );

    return location;
  }

  // 获取所有位置
  static findAll(): Location[] {
    const stmt = db.prepare("SELECT * FROM locations ORDER BY created_at DESC");
    const rows = stmt.all() as any[];
    
    return rows.map(row => this.mapRowToLocation(row));
  }

  // 根据 ID 获取位置
  static findById(id: string): Location | null {
    const stmt = db.prepare("SELECT * FROM locations WHERE id = ?");
    const row = stmt.get(id) as any;
    
    return row ? this.mapRowToLocation(row) : null;
  }

  // 更新位置
  static update(id: string, updates: Partial<Location>): Location | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const stmt = db.prepare(`
      UPDATE locations SET
        name = ?,
        description = ?,
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.name,
      updated.description || null,
      updated.updatedAt,
      id
    );

    return updated;
  }

  // 删除位置
  static delete(id: string): boolean {
    const stmt = db.prepare("DELETE FROM locations WHERE id = ?");
    const result = stmt.run(id);
    
    return result.changes > 0;
  }

  // 映射数据库行到 Location 对象
  private static mapRowToLocation(row: any): Location {
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

