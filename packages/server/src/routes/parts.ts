import { FastifyInstance } from "fastify";
import { createPart, createInventoryChange, applyInventoryChange, isLowStock } from "@partflow/core";
import type { Part, InventoryChange } from "@partflow/core";

// 模拟数据库（实际项目应使用 SQLite 或 MongoDB）
const partsDB: Part[] = [];
const inventoryChangesDB: InventoryChange[] = [];

export async function partsRoutes(fastify: FastifyInstance) {
  // 获取所有零件
  fastify.get("/parts", async (request, reply) => {
    const { search, categoryId, locationId, lowStock } = request.query as any;
    
    let filtered = [...partsDB];
    
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.specification?.toLowerCase().includes(term) ||
          p.material?.toLowerCase().includes(term)
      );
    }
    
    if (categoryId) {
      filtered = filtered.filter((p) => p.categoryId === categoryId);
    }
    
    if (locationId) {
      filtered = filtered.filter((p) => p.locationId === locationId);
    }
    
    if (lowStock === "true") {
      filtered = filtered.filter((p) => isLowStock(p));
    }
    
    return { data: filtered, total: filtered.length };
  });

  // 获取单个零件
  fastify.get("/parts/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const part = partsDB.find((p) => p.id === id);
    
    if (!part) {
      reply.code(404);
      return { error: "Part not found" };
    }
    
    return { data: part };
  });

  // 创建零件
  fastify.post("/parts", async (request, reply) => {
    const body = request.body as any;
    const part = createPart(body);
    partsDB.push(part);
    
    reply.code(201);
    return { data: part };
  });

  // 更新零件
  fastify.put("/parts/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const index = partsDB.findIndex((p) => p.id === id);
    
    if (index === -1) {
      reply.code(404);
      return { error: "Part not found" };
    }
    
    const body = request.body as any;
    partsDB[index] = {
      ...partsDB[index],
      ...body,
      id,
      updatedAt: new Date().toISOString()
    };
    
    return { data: partsDB[index] };
  });

  // 删除零件
  fastify.delete("/parts/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const index = partsDB.findIndex((p) => p.id === id);
    
    if (index === -1) {
      reply.code(404);
      return { error: "Part not found" };
    }
    
    partsDB.splice(index, 1);
    reply.code(204);
    return;
  });

  // 入库/出库
  fastify.post("/parts/:id/inventory", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    
    const part = partsDB.find((p) => p.id === id);
    if (!part) {
      reply.code(404);
      return { error: "Part not found" };
    }
    
    const change = createInventoryChange({
      partId: id,
      delta: body.delta,
      reason: body.reason,
      operator: body.operator
    });
    
    inventoryChangesDB.push(change);
    
    const updatedPart = applyInventoryChange(part, change);
    const index = partsDB.findIndex((p) => p.id === id);
    partsDB[index] = updatedPart;
    
    return { data: updatedPart };
  });

  // 获取零件库存变动历史
  fastify.get("/parts/:id/inventory-history", async (request, reply) => {
    const { id } = request.params as { id: string };
    const history = inventoryChangesDB.filter((c) => c.partId === id);
    
    return { data: history, total: history.length };
  });
}

