# 📡 PartFlow API 文档

API Base URL: `http://localhost:3333/api`

所有 API 返回 JSON 格式数据。

---

## 🔧 零件管理 (Parts)

### 获取所有零件

```http
GET /api/parts
```

**查询参数**:
- `search` (可选): 搜索关键词
- `categoryId` (可选): 按分类筛选
- `locationId` (可选): 按位置筛选
- `lowStock` (可选): `true` 仅显示低库存零件

**响应示例**:
```json
{
  "data": [
    {
      "id": "part-001",
      "name": "M6 螺栓",
      "specification": "长度 20mm",
      "material": "不锈钢",
      "quantity": 100,
      "minQuantity": 20,
      "tags": ["紧固件", "螺栓"],
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

### 获取单个零件

```http
GET /api/parts/:id
```

### 创建零件

```http
POST /api/parts
Content-Type: application/json

{
  "name": "M6 螺栓",
  "specification": "长度 20mm",
  "material": "不锈钢",
  "quantity": 100,
  "minQuantity": 20,
  "tags": ["紧固件", "螺栓"],
  "categoryId": "cat-001",
  "locationId": "loc-001"
}
```

### 更新零件

```http
PUT /api/parts/:id
Content-Type: application/json

{
  "name": "M6 × 20 螺栓",
  "quantity": 150
}
```

### 删除零件

```http
DELETE /api/parts/:id
```

### 库存变动（入库/出库）

```http
POST /api/parts/:id/inventory
Content-Type: application/json

{
  "delta": 50,          // 正数为入库，负数为出库
  "reason": "采购入库",
  "operator": "张三"
}
```

### 获取库存变动历史

```http
GET /api/parts/:id/inventory-history
```

---

## 📂 分类管理 (Categories)

### 获取所有分类

```http
GET /api/categories
```

### 获取单个分类

```http
GET /api/categories/:id
```

### 创建分类

```http
POST /api/categories
Content-Type: application/json

{
  "name": "紧固件",
  "description": "螺栓、螺母、垫片等",
  "parentId": "parent-cat-id"  // 可选，用于创建子分类
}
```

### 更新分类

```http
PUT /api/categories/:id
```

### 删除分类

```http
DELETE /api/categories/:id
```

### 获取分类路径

```http
GET /api/categories/:id/path
```

**响应示例**:
```json
{
  "data": ["紧固件", "螺栓", "不锈钢螺栓"]
}
```

---

## 📍 位置管理 (Locations)

### 获取所有位置

```http
GET /api/locations
```

### 获取单个位置

```http
GET /api/locations/:id
```

### 创建位置

```http
POST /api/locations
Content-Type: application/json

{
  "name": "工具箱 A1",
  "description": "一楼工作台左侧"
}
```

### 更新位置

```http
PUT /api/locations/:id
```

### 删除位置

```http
DELETE /api/locations/:id
```

---

## 🏥 健康检查

```http
GET /health
```

**响应示例**:
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## 📝 数据模型

### Part (零件)

```typescript
{
  id: string;
  name: string;
  specification?: string;     // 规格
  material?: string;           // 材质
  tags?: string[];             // 标签
  categoryId?: string;         // 分类 ID
  locationId?: string;         // 位置 ID
  quantity: number;            // 当前库存
  minQuantity?: number;        // 预警阈值
  imageUrl?: string;           // 图片链接
  createdAt: string;
  updatedAt: string;
}
```

### Category (分类)

```typescript
{
  id: string;
  name: string;
  parentId?: string;           // 父分类 ID
  description?: string;
  createdAt: string;
}
```

### Location (位置)

```typescript
{
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}
```

### InventoryChange (库存变动)

```typescript
{
  id: string;
  partId: string;
  delta: number;               // 变动数量（正数入库，负数出库）
  reason?: string;             // 变动原因
  operator?: string;           // 操作人
  createdAt: string;
}
```

---

## 🔒 错误码

- `200` - 成功
- `201` - 创建成功
- `204` - 删除成功（无返回内容）
- `404` - 资源不存在
- `500` - 服务器错误

