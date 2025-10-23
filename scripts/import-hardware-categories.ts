import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createCategory } from "@partflow/core";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 数据库文件路径
const DB_PATH = join(__dirname, "../packages/server/data/partflow.db");

// 创建数据库连接
const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");

interface CategoryNode {
  name: string;
  icon?: string;
  children?: CategoryNode[];
}

// 递归导入分类
function importCategory(node: CategoryNode, parentId?: string): void {
  const category = createCategory({
    name: node.name,
    icon: node.icon,
    parentId: parentId,
    description: ""
  });

  console.log(`  ${"  ".repeat(parentId ? (parentId.split("-").length - 1) : 0)}├─ ${node.icon || "📦"} ${node.name} (${category.id})`);

  // 插入数据库
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

  // 递归导入子分类
  if (node.children) {
    for (const child of node.children) {
      importCategory(child, category.id);
    }
  }
}

// 主函数
function main() {
  console.log("\n╔════════════════════════════════════════════════════════════════╗");
  console.log("║           📦 导入五金零件分类数据                           ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");

  // 读取 JSON 文件
  const categoriesPath = join(__dirname, "hardware-categories.json");
  const categoriesData: CategoryNode[] = JSON.parse(readFileSync(categoriesPath, "utf-8"));

  console.log("📂 分类结构：\n");

  // 导入所有分类
  for (const rootNode of categoriesData) {
    importCategory(rootNode);
  }

  // 统计
  const count = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
  
  console.log("\n" + "─".repeat(64));
  console.log(`\n✅ 导入完成！共导入 ${count.count} 个分类`);
  console.log("\n分类层级统计：");
  
  const level1 = db.prepare("SELECT COUNT(*) as count FROM categories WHERE parent_id IS NULL").get() as { count: number };
  const level2 = db.prepare("SELECT COUNT(*) as count FROM categories WHERE parent_id IN (SELECT id FROM categories WHERE parent_id IS NULL)").get() as { count: number };
  const level3 = db.prepare("SELECT COUNT(*) as count FROM categories WHERE parent_id IN (SELECT id FROM categories WHERE parent_id IS NOT NULL AND parent_id IN (SELECT id FROM categories WHERE parent_id IS NULL))").get() as { count: number };
  
  console.log(`  • 一级分类：${level1.count} 个`);
  console.log(`  • 二级分类：${level2.count} 个`);
  console.log(`  • 三级分类：${level3.count} 个`);
  
  console.log("\n╔════════════════════════════════════════════════════════════════╗");
  console.log("║           🎉 分类数据导入成功！                             ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");

  db.close();
}

main();

