import { FastifyInstance } from "fastify";
import { createLocation } from "@partflow/core";
import { LocationsDAO } from "../db/dao/locations.js";

export async function locationsRoutes(fastify: FastifyInstance) {
  // 获取所有位置
  fastify.get("/locations", async (request, reply) => {
    const locations = LocationsDAO.findAll();
    return { data: locations, total: locations.length };
  });

  // 获取单个位置
  fastify.get("/locations/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const location = LocationsDAO.findById(id);
    
    if (!location) {
      reply.code(404);
      return { error: "Location not found" };
    }
    
    return { data: location };
  });

  // 创建盒子
  fastify.post("/locations", async (request, reply) => {
    const body = request.body as any;
    
    // 验证编号是否已存在
    if (body.code) {
      const existing = LocationsDAO.findByCode(body.code);
      if (existing) {
        reply.code(400);
        return { error: `盒子编号 ${body.code.toUpperCase()} 已存在` };
      }
    }
    
    const location = createLocation(body);
    const created = LocationsDAO.create(location);
    
    reply.code(201);
    return { data: created };
  });

  // 更新盒子
  fastify.put("/locations/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    
    try {
      const updated = LocationsDAO.update(id, body);
      
      if (!updated) {
        reply.code(404);
        return { error: "Location not found" };
      }
      
      return { data: updated };
    } catch (error) {
      if (error instanceof Error && error.message.includes('已存在')) {
        reply.code(400);
        return { error: error.message };
      }
      throw error;
    }
  });

  // 删除位置
  fastify.delete("/locations/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const deleted = LocationsDAO.delete(id);
    
    if (!deleted) {
      reply.code(404);
      return { error: "Location not found" };
    }
    
    reply.code(204);
    return;
  });
}

