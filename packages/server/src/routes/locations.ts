import { FastifyInstance } from "fastify";
import { createLocation } from "@partflow/core";
import type { Location } from "@partflow/core";

// 模拟数据库
const locationsDB: Location[] = [];

export async function locationsRoutes(fastify: FastifyInstance) {
  // 获取所有位置
  fastify.get("/locations", async (request, reply) => {
    return { data: locationsDB, total: locationsDB.length };
  });

  // 获取单个位置
  fastify.get("/locations/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const location = locationsDB.find((l) => l.id === id);
    
    if (!location) {
      reply.code(404);
      return { error: "Location not found" };
    }
    
    return { data: location };
  });

  // 创建位置
  fastify.post("/locations", async (request, reply) => {
    const body = request.body as any;
    const location = createLocation(body);
    locationsDB.push(location);
    
    reply.code(201);
    return { data: location };
  });

  // 更新位置
  fastify.put("/locations/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const index = locationsDB.findIndex((l) => l.id === id);
    
    if (index === -1) {
      reply.code(404);
      return { error: "Location not found" };
    }
    
    const body = request.body as any;
    locationsDB[index] = {
      ...locationsDB[index],
      ...body,
      id
    };
    
    return { data: locationsDB[index] };
  });

  // 删除位置
  fastify.delete("/locations/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const index = locationsDB.findIndex((l) => l.id === id);
    
    if (index === -1) {
      reply.code(404);
      return { error: "Location not found" };
    }
    
    locationsDB.splice(index, 1);
    reply.code(204);
    return;
  });
}

