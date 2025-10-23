import { FastifyInstance } from "fastify";
import { createCategory, buildCategoryPath } from "@partflow/core";
import { CategoriesDAO } from "../db/dao/categories.js";

export async function categoriesRoutes(fastify: FastifyInstance) {
  // 获取所有分类
  fastify.get("/categories", async (request, reply) => {
    const categories = CategoriesDAO.findAll();
    return { data: categories, total: categories.length };
  });

  // 获取单个分类
  fastify.get("/categories/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const category = CategoriesDAO.findById(id);
    
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
    const created = CategoriesDAO.create(category);
    
    reply.code(201);
    return { data: created };
  });

  // 更新分类
  fastify.put("/categories/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    
    const updated = CategoriesDAO.update(id, body);
    
    if (!updated) {
      reply.code(404);
      return { error: "Category not found" };
    }
    
    return { data: updated };
  });

  // 删除分类
  fastify.delete("/categories/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const deleted = CategoriesDAO.delete(id);
    
    if (!deleted) {
      reply.code(404);
      return { error: "Category not found" };
    }
    
    reply.code(204);
    return;
  });

  // 获取分类路径
  fastify.get("/categories/:id/path", async (request, reply) => {
    const { id } = request.params as { id: string };
    const categories = CategoriesDAO.findAll();
    const path = buildCategoryPath(categories, id);
    
    return { data: path };
  });
}

