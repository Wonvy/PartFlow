import { db } from "../index.js";
import type { InventoryChange } from "@partflow/core";

export class InventoryDAO {
  // 创建库存变动记录
  static create(change: InventoryChange): InventoryChange {
    const stmt = db.prepare(`
      INSERT INTO inventory_changes (
        id, part_id, change_type, quantity, reason, operator, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      change.id,
      change.partId,
      change.changeType,
      change.quantity,
      change.reason || null,
      change.operator || null,
      change.timestamp
    );

    return change;
  }

  // 获取所有库存变动
  static findAll(): InventoryChange[] {
    const stmt = db.prepare("SELECT * FROM inventory_changes ORDER BY timestamp DESC");
    const rows = stmt.all() as any[];
    
    return rows.map(row => this.mapRowToInventoryChange(row));
  }

  // 根据零件 ID 获取库存变动
  static findByPartId(partId: string): InventoryChange[] {
    const stmt = db.prepare(`
      SELECT * FROM inventory_changes 
      WHERE part_id = ? 
      ORDER BY timestamp DESC
    `);
    const rows = stmt.all(partId) as any[];
    
    return rows.map(row => this.mapRowToInventoryChange(row));
  }

  // 获取最近的库存变动
  static findRecent(limit: number = 50): InventoryChange[] {
    const stmt = db.prepare(`
      SELECT * FROM inventory_changes 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    const rows = stmt.all(limit) as any[];
    
    return rows.map(row => this.mapRowToInventoryChange(row));
  }

  // 删除库存变动记录
  static delete(id: string): boolean {
    const stmt = db.prepare("DELETE FROM inventory_changes WHERE id = ?");
    const result = stmt.run(id);
    
    return result.changes > 0;
  }

  // 映射数据库行到 InventoryChange 对象
  private static mapRowToInventoryChange(row: any): InventoryChange {
    // 计算 delta：入库为正，出库为负
    const delta = row.change_type === "in" ? row.quantity : -row.quantity;
    
    return {
      id: row.id,
      partId: row.part_id,
      delta,
      changeType: row.change_type as "in" | "out",
      quantity: row.quantity,
      reason: row.reason || undefined,
      operator: row.operator || undefined,
      timestamp: row.timestamp
    };
  }
}

