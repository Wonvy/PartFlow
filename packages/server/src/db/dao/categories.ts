import { db } from "../index.js";
import type { Category } from "@partflow/core";

export class CategoriesDAO {
  // 创建分类
  static create(category: Category): Category {
    const stmt = db.prepare(`
      INSERT INTO categories (id, name, description, parent_id, icon, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      category.id,
      category.name,
      category.description || null,
      category.parentId || null,
      category.icon || null,
      category.createdAt,
      category.updatedAt
    );

    return category;
  }

  // 获取所有分类
  static findAll(): Category[] {
    const stmt = db.prepare("SELECT * FROM categories ORDER BY created_at DESC");
    const rows = stmt.all() as any[];
    
    return rows.map(row => this.mapRowToCategory(row));
  }

  // 根据 ID 获取分类
  static findById(id: string): Category | null {
    const stmt = db.prepare("SELECT * FROM categories WHERE id = ?");
    const row = stmt.get(id) as any;
    
    return row ? this.mapRowToCategory(row) : null;
  }

  // 获取根分类
  static findRoots(): Category[] {
    const stmt = db.prepare("SELECT * FROM categories WHERE parent_id IS NULL ORDER BY name");
    const rows = stmt.all() as any[];
    
    return rows.map(row => this.mapRowToCategory(row));
  }

  // 获取子分类
  static findChildren(parentId: string): Category[] {
    const stmt = db.prepare("SELECT * FROM categories WHERE parent_id = ? ORDER BY name");
    const rows = stmt.all(parentId) as any[];
    
    return rows.map(row => this.mapRowToCategory(row));
  }

  // 更新分类
  static update(id: string, updates: Partial<Category>): Category | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const stmt = db.prepare(`
      UPDATE categories SET
        name = ?,
        description = ?,
        parent_id = ?,
        icon = ?,
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.name,
      updated.description || null,
      updated.parentId || null,
      updated.icon || null,
      updated.updatedAt,
      id
    );

    return updated;
  }

  // 删除分类
  static delete(id: string): boolean {
    const stmt = db.prepare("DELETE FROM categories WHERE id = ?");
    const result = stmt.run(id);
    
    return result.changes > 0;
  }

  // 映射数据库行到 Category 对象
  private static mapRowToCategory(row: any): Category {
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      parentId: row.parent_id || undefined,
      icon: row.icon || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

