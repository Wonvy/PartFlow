import { FastifyInstance } from "fastify";
import { createCategory, buildCategoryPath } from "@partflow/core";
import type { Category } from "@partflow/core";

// 模拟数据库
const categoriesDB: Category[] = [];

export async function categoriesRoutes(fastify: FastifyInstance) {
  // 获取所有分类
  fastify.get("/categories", async (request, reply) => {
    return { data: categoriesDB, total: categoriesDB.length };
  });

  // 获取单个分类
  fastify.get("/categories/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const category = categoriesDB.find((c) => c.id === id);
    
    if (!category) {
      reply.code(404);
      return { error: "Category not found" };
    }
    
    return { data: category };
  });

  // 创建分类
  fastify.post("/categories", async (request, reply) => {
    const body = request.body as any;
    const category = createCategory(body);
    categoriesDB.push(category);
    
    reply.code(201);
    return { data: category };
  });

  // 更新分类
  fastify.put("/categories/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const index = categoriesDB.findIndex((c) => c.id === id);
    
    if (index === -1) {
      reply.code(404);
      return { error: "Category not found" };
    }
    
    const body = request.body as any;
    categoriesDB[index] = {
      ...categoriesDB[index],
      ...body,
      id
    };
    
    return { data: categoriesDB[index] };
  });

  // 删除分类
  fastify.delete("/categories/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const index = categoriesDB.findIndex((c) => c.id === id);
    
    if (index === -1) {
      reply.code(404);
      return { error: "Category not found" };
    }
    
    categoriesDB.splice(index, 1);
    reply.code(204);
    return;
  });

  // 获取分类路径
  fastify.get("/categories/:id/path", async (request, reply) => {
    const { id } = request.params as { id: string };
    const path = buildCategoryPath(categoriesDB, id);
    
    return { data: path };
  });
}

