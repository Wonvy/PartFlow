import { FastifyPluginAsync } from "fastify";
import { PartsDAO } from "../db/dao/parts";
import { CategoriesDAO } from "../db/dao/categories";
import { LocationsDAO } from "../db/dao/locations";
import { Part, Category, Location } from "@partflow/core";

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export const importRoutes: FastifyPluginAsync = async (fastify) => {
  // 导入零件 - JSON
  fastify.post("/import/parts/json", async (request, reply) => {
    try {
      const body = request.body as { data: Partial<Part>[] };
      const parts = body.data;

      if (!Array.isArray(parts)) {
        return reply.status(400).send({ error: "数据格式错误" });
      }

      const result: ImportResult = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (const part of parts) {
        try {
          if (!part.name) {
            throw new Error("零件名称不能为空");
          }

          await PartsDAO.create({
            name: part.name,
            specification: part.specification,
            material: part.material,
            tags: part.tags || [],
            categoryId: part.categoryId,
            locationId: part.locationId,
            quantity: part.quantity || 0,
            minQuantity: part.minQuantity,
            imageUrl: part.imageUrl
          });

          result.success++;
        } catch (err) {
          result.failed++;
          result.errors.push(`零件 "${part.name}": ${err instanceof Error ? err.message : "未知错误"}`);
        }
      }

      reply.send(result);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "导入失败" });
    }
  });

  // 导入零件 - CSV
  fastify.post("/import/parts/csv", async (request, reply) => {
    try {
      const body = request.body as { csvData: string };
      const csvData = body.csvData;

      if (!csvData) {
        return reply.status(400).send({ error: "CSV 数据为空" });
      }

      // 解析 CSV
      const lines = csvData.split("\n").filter(line => line.trim());
      if (lines.length < 2) {
        return reply.status(400).send({ error: "CSV 数据格式错误" });
      }

      // 跳过表头
      const dataLines = lines.slice(1);

      const result: ImportResult = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (const line of dataLines) {
        try {
          // 简单的 CSV 解析（支持引号）
          const fields = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
          const values = fields.map(f => f.replace(/^"|"$/g, "").trim());

          if (values.length < 2) continue;

          const [id, name, specification, material, categoryId, locationId, quantity, minQuantity, tags] = values;

          if (!name) {
            throw new Error("零件名称不能为空");
          }

          await PartsDAO.create({
            name,
            specification: specification || undefined,
            material: material || undefined,
            tags: tags ? tags.split(";").filter(Boolean) : [],
            categoryId: categoryId || undefined,
            locationId: locationId || undefined,
            quantity: parseInt(quantity) || 0,
            minQuantity: minQuantity ? parseInt(minQuantity) : undefined
          });

          result.success++;
        } catch (err) {
          result.failed++;
          result.errors.push(`行数据错误: ${err instanceof Error ? err.message : "未知错误"}`);
        }
      }

      reply.send(result);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "导入失败" });
    }
  });

  // 导入分类 - JSON
  fastify.post("/import/categories/json", async (request, reply) => {
    try {
      const body = request.body as { data: Partial<Category>[] };
      const categories = body.data;

      if (!Array.isArray(categories)) {
        return reply.status(400).send({ error: "数据格式错误" });
      }

      const result: ImportResult = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (const category of categories) {
        try {
          if (!category.name) {
            throw new Error("分类名称不能为空");
          }

          await CategoriesDAO.create({
            name: category.name,
            description: category.description,
            parentId: category.parentId
          });

          result.success++;
        } catch (err) {
          result.failed++;
          result.errors.push(`分类 "${category.name}": ${err instanceof Error ? err.message : "未知错误"}`);
        }
      }

      reply.send(result);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "导入失败" });
    }
  });

  // 导入位置 - JSON
  fastify.post("/import/locations/json", async (request, reply) => {
    try {
      const body = request.body as { data: Partial<Location>[] };
      const locations = body.data;

      if (!Array.isArray(locations)) {
        return reply.status(400).send({ error: "数据格式错误" });
      }

      const result: ImportResult = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (const location of locations) {
        try {
          if (!location.name) {
            throw new Error("位置名称不能为空");
          }

          await LocationsDAO.create({
            name: location.name,
            description: location.description
          });

          result.success++;
        } catch (err) {
          result.failed++;
          result.errors.push(`位置 "${location.name}": ${err instanceof Error ? err.message : "未知错误"}`);
        }
      }

      reply.send(result);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "导入失败" });
    }
  });

  // 导入全部数据 - JSON
  fastify.post("/import/all/json", async (request, reply) => {
    try {
      const body = request.body as {
        data: {
          categories?: { items: Partial<Category>[] };
          locations?: { items: Partial<Location>[] };
          parts?: { items: Partial<Part>[] };
        }
      };

      const result = {
        categories: { success: 0, failed: 0, errors: [] as string[] },
        locations: { success: 0, failed: 0, errors: [] as string[] },
        parts: { success: 0, failed: 0, errors: [] as string[] }
      };

      // 导入分类
      if (body.data.categories?.items) {
        for (const category of body.data.categories.items) {
          try {
            if (!category.name) continue;
            await CategoriesDAO.create({
              name: category.name,
              description: category.description,
              parentId: category.parentId
            });
            result.categories.success++;
          } catch (err) {
            result.categories.failed++;
            result.categories.errors.push(`${category.name}: ${err instanceof Error ? err.message : "未知错误"}`);
          }
        }
      }

      // 导入位置
      if (body.data.locations?.items) {
        for (const location of body.data.locations.items) {
          try {
            if (!location.name) continue;
            await LocationsDAO.create({
              name: location.name,
              description: location.description
            });
            result.locations.success++;
          } catch (err) {
            result.locations.failed++;
            result.locations.errors.push(`${location.name}: ${err instanceof Error ? err.message : "未知错误"}`);
          }
        }
      }

      // 导入零件
      if (body.data.parts?.items) {
        for (const part of body.data.parts.items) {
          try {
            if (!part.name) continue;
            await PartsDAO.create({
              name: part.name,
              specification: part.specification,
              material: part.material,
              tags: part.tags || [],
              categoryId: part.categoryId,
              locationId: part.locationId,
              quantity: part.quantity || 0,
              minQuantity: part.minQuantity
            });
            result.parts.success++;
          } catch (err) {
            result.parts.failed++;
            result.parts.errors.push(`${part.name}: ${err instanceof Error ? err.message : "未知错误"}`);
          }
        }
      }

      reply.send(result);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "导入失败" });
    }
  });
};

