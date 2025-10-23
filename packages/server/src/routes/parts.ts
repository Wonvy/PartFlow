import { FastifyInstance } from "fastify";
import { createPart, createInventoryChange, applyInventoryChange } from "@partflow/core";
import { PartsDAO } from "../db/dao/parts.js";
import { InventoryDAO } from "../db/dao/inventory.js";

export async function partsRoutes(fastify: FastifyInstance) {
  // 获取所有零件
  fastify.get("/parts", async (request, reply) => {
    const { search, categoryId, locationId, lowStock } = request.query as any;
    
    const parts = PartsDAO.search({
      search,
      categoryId,
      locationId,
      lowStock: lowStock === "true"
    });
    
    return { data: parts, total: parts.length };
  });

  // 获取单个零件
  fastify.get("/parts/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const part = PartsDAO.findById(id);
    
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
    const created = PartsDAO.create(part);
    
    reply.code(201);
    return { data: created };
  });

  // 更新零件
  fastify.put("/parts/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    
    const updated = PartsDAO.update(id, body);
    
    if (!updated) {
      reply.code(404);
      return { error: "Part not found" };
    }
    
    return { data: updated };
  });

  // 删除零件
  fastify.delete("/parts/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const deleted = PartsDAO.delete(id);
    
    if (!deleted) {
      reply.code(404);
      return { error: "Part not found" };
    }
    
    reply.code(204);
    return;
  });

  // 入库/出库
  fastify.post("/parts/:id/inventory", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    
    const part = PartsDAO.findById(id);
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
    
    // 保存库存变动记录
    InventoryDAO.create(change);
    
    // 更新零件库存
    const updatedPart = applyInventoryChange(part, change);
    PartsDAO.updateQuantity(id, updatedPart.quantity);
    
    return { data: updatedPart };
  });

  // 获取零件库存变动历史
  fastify.get("/parts/:id/inventory-history", async (request, reply) => {
    const { id } = request.params as { id: string };
    const history = InventoryDAO.findByPartId(id);
    
    return { data: history, total: history.length };
  });
}

