-- PartFlow SQLite Schema
-- 零件管理系统数据库结构

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 盒子表
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE, -- 盒子编号，唯一
  name TEXT, -- 名称改为可选
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 零件表
CREATE TABLE IF NOT EXISTS parts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  specification TEXT,
  material TEXT,
  tags TEXT, -- JSON array
  category_id TEXT,
  location_id TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER,
  image_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- 库存变动表
CREATE TABLE IF NOT EXISTS inventory_changes (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL,
  change_type TEXT NOT NULL, -- 'in' 或 'out'
  quantity INTEGER NOT NULL,
  reason TEXT,
  operator TEXT,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
);

-- 标签表（可选，用于标签管理）
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT,
  created_at TEXT NOT NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category_id);
CREATE INDEX IF NOT EXISTS idx_parts_location ON parts(location_id);
CREATE INDEX IF NOT EXISTS idx_parts_name ON parts(name);
CREATE INDEX IF NOT EXISTS idx_inventory_changes_part ON inventory_changes(part_id);
CREATE INDEX IF NOT EXISTS idx_inventory_changes_timestamp ON inventory_changes(timestamp);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

