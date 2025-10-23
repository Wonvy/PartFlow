import { FastifyPluginAsync } from "fastify";
import { PartsDAO } from "../db/dao/parts";
import { CategoriesDAO } from "../db/dao/categories";
import { LocationsDAO } from "../db/dao/locations";

export const exportRoutes: FastifyPluginAsync = async (fastify) => {
  // 导出零件为 CSV
  fastify.get("/export/parts/csv", async (request, reply) => {
    try {
      const parts = await PartsDAO.search({});

      // CSV 头部
      const headers = [
        "ID",
        "名称",
        "规格",
        "材质",
        "分类ID",
        "位置ID",
        "库存",
        "最低库存",
        "标签",
        "创建时间",
        "更新时间"
      ];

      // 转换为 CSV 行
      const rows = parts.map(part => [
        part.id,
        part.name,
        part.specification || "",
        part.material || "",
        part.categoryId || "",
        part.locationId || "",
        part.quantity.toString(),
        part.minQuantity?.toString() || "",
        part.tags ? part.tags.join(";") : "",
        part.createdAt,
        part.updatedAt
      ]);

      // 生成 CSV 内容
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      // 添加 BOM 以支持中文
      const bom = "\uFEFF";
      const csvWithBom = bom + csvContent;

      reply
        .header("Content-Type", "text/csv; charset=utf-8")
        .header("Content-Disposition", `attachment; filename="parts_${Date.now()}.csv"`)
        .send(csvWithBom);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "导出失败" });
    }
  });

  // 导出零件为 JSON
  fastify.get("/export/parts/json", async (request, reply) => {
    try {
      const parts = await PartsDAO.search({});

      const jsonData = {
        exportDate: new Date().toISOString(),
        version: "1.0",
        totalCount: parts.length,
        data: parts
      };

      reply
        .header("Content-Type", "application/json; charset=utf-8")
        .header("Content-Disposition", `attachment; filename="parts_${Date.now()}.json"`)
        .send(jsonData);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "导出失败" });
    }
  });

  // 导出分类为 CSV
  fastify.get("/export/categories/csv", async (request, reply) => {
    try {
      const categories = await CategoriesDAO.findAll();

      const headers = ["ID", "名称", "描述", "父分类ID", "创建时间", "更新时间"];
      const rows = categories.map(cat => [
        cat.id,
        cat.name,
        cat.description || "",
        cat.parentId || "",
        cat.createdAt,
        cat.updatedAt
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      const bom = "\uFEFF";
      const csvWithBom = bom + csvContent;

      reply
        .header("Content-Type", "text/csv; charset=utf-8")
        .header("Content-Disposition", `attachment; filename="categories_${Date.now()}.csv"`)
        .send(csvWithBom);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "导出失败" });
    }
  });

  // 导出分类为 JSON
  fastify.get("/export/categories/json", async (request, reply) => {
    try {
      const categories = await CategoriesDAO.findAll();

      const jsonData = {
        exportDate: new Date().toISOString(),
        version: "1.0",
        totalCount: categories.length,
        data: categories
      };

      reply
        .header("Content-Type", "application/json; charset=utf-8")
        .header("Content-Disposition", `attachment; filename="categories_${Date.now()}.json"`)
        .send(jsonData);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "导出失败" });
    }
  });

  // 导出位置为 CSV
  fastify.get("/export/locations/csv", async (request, reply) => {
    try {
      const locations = await LocationsDAO.findAll();

      const headers = ["ID", "名称", "描述", "创建时间", "更新时间"];
      const rows = locations.map(loc => [
        loc.id,
        loc.name,
        loc.description || "",
        loc.createdAt,
        loc.updatedAt
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      const bom = "\uFEFF";
      const csvWithBom = bom + csvContent;

      reply
        .header("Content-Type", "text/csv; charset=utf-8")
        .header("Content-Disposition", `attachment; filename="locations_${Date.now()}.csv"`)
        .send(csvWithBom);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "导出失败" });
    }
  });

  // 导出位置为 JSON
  fastify.get("/export/locations/json", async (request, reply) => {
    try {
      const locations = await LocationsDAO.findAll();

      const jsonData = {
        exportDate: new Date().toISOString(),
        version: "1.0",
        totalCount: locations.length,
        data: locations
      };

      reply
        .header("Content-Type", "application/json; charset=utf-8")
        .header("Content-Disposition", `attachment; filename="locations_${Date.now()}.json"`)
        .send(jsonData);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "导出失败" });
    }
  });

  // 导出全部数据为 JSON（包含零件、分类、位置）
  fastify.get("/export/all/json", async (request, reply) => {
    try {
      const [parts, categories, locations] = await Promise.all([
        PartsDAO.search({}),
        CategoriesDAO.findAll(),
        LocationsDAO.findAll()
      ]);

      const jsonData = {
        exportDate: new Date().toISOString(),
        version: "1.0",
        data: {
          parts: {
            count: parts.length,
            items: parts
          },
          categories: {
            count: categories.length,
            items: categories
          },
          locations: {
            count: locations.length,
            items: locations
          }
        }
      };

      reply
        .header("Content-Type", "application/json; charset=utf-8")
        .header("Content-Disposition", `attachment; filename="partflow_backup_${Date.now()}.json"`)
        .send(jsonData);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "导出失败" });
    }
  });
};

