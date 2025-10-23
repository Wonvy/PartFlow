import Fastify from "fastify";
import { initDatabase } from "./db/index.js";
import { partsRoutes } from "./routes/parts.js";
import { categoriesRoutes } from "./routes/categories.js";
import { locationsRoutes } from "./routes/locations.js";

// 初始化数据库
initDatabase();

const server = Fastify({ logger: true });

// CORS 支持
server.register(import("@fastify/cors"), {
  origin: true
});

// 健康检查
server.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// 示例数据初始化（仅开发环境）
server.post("/api/seed", async (request, reply) => {
  const { sampleCategories, sampleLocations, sampleParts } = await import("./seed.js");
  
  // 这里需要访问各个路由的数据存储
  // 实际实现需要重构数据存储层
  return {
    message: "示例数据初始化功能需要连接实际数据库",
    hint: "请使用 curl 命令手动创建示例数据，参考 docs/快速开始.md"
  };
});

// 注册路由
server.register(partsRoutes, { prefix: "/api" });
server.register(categoriesRoutes, { prefix: "/api" });
server.register(locationsRoutes, { prefix: "/api" });

const port = Number(process.env.PORT ?? 3333);
server
  .listen({ port, host: "0.0.0.0" })
  .then(() => {
    server.log.info(`🚀 Server listening on http://localhost:${port}`);
    server.log.info(`📝 API routes available at http://localhost:${port}/api`);
  })
  .catch((err) => {
    server.log.error(err);
    process.exit(1);
  });


