import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 数据库文件路径
const DB_PATH = join(__dirname, "../../data/partflow.db");

// 创建数据库连接
export const db = new Database(DB_PATH, {
  verbose: console.log // 开发环境打印 SQL
});

// 启用外键约束
db.pragma("foreign_keys = ON");

// 初始化数据库
export function initDatabase() {
  console.log("📦 初始化数据库...");
  
  // 读取并执行 schema
  const schemaSQL = readFileSync(join(__dirname, "schema.sql"), "utf-8");
  db.exec(schemaSQL);
  
  console.log("✅ 数据库初始化完成");
}

// 关闭数据库连接
export function closeDatabase() {
  db.close();
  console.log("🔒 数据库连接已关闭");
}

// 优雅退出
process.on("SIGINT", () => {
  closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", () => {
  closeDatabase();
  process.exit(0);
});

