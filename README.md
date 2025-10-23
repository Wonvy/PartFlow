# 🧩 PartFlow - 跨平台零件管理系统

> 支持桌面端（Electron）、移动端（React Native/Expo）与 Web 管理端  
> Monorepo 架构 · TypeScript · 云同步 · AI 识别

---

## 📦 项目结构

```
/partflow
├── apps/
│   ├── web/           # Web 管理端 (Vite + React)
│   ├── desktop/       # 桌面端 (Electron + React)
│   └── mobile/        # 移动端 (Expo + React Native)
│
├── packages/
│   ├── core/          # 核心数据模型与逻辑
│   ├── server/        # Node.js 后端服务 (Fastify)
│   ├── ai/            # 图像识别与分析模块
│   ├── ui/            # 通用 UI 组件库
│   └── utils/         # 工具函数与 Hook 集
│
└── docs/              # 开发文档
```

---

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# Web 管理端 (http://localhost:5173)
pnpm run dev:web

# 桌面端 (Electron)
pnpm run dev:desktop

# 移动端 (Expo)
pnpm run dev:mobile

# 后端服务 (http://localhost:3333)
pnpm run dev:server
```

### 构建

```bash
# 构建所有 packages
pnpm run build:packages

# 构建 Web
pnpm run build:web

# 构建桌面端
pnpm run build:desktop
```

---

## 🛠️ 技术栈

- **前端框架**: React 18
- **桌面端**: Electron 32
- **移动端**: Expo + React Native
- **后端**: Node.js + Fastify
- **语言**: TypeScript
- **构建工具**: Vite
- **包管理**: pnpm workspaces
- **AI**: OpenAI Vision API / TensorFlow.js

---

## 📖 文档

- 📘 [开发说明](./docs/开发说明.md) - 技术栈与架构设计
- 🚀 [快速开始](./docs/快速开始.md) - 5 分钟入门指南
- 📖 [使用指南](./docs/使用指南.md) - 功能详细说明
- 📡 [API 文档](./docs/API文档.md) - REST API 完整文档
- 🎬 [功能演示](./docs/功能演示.md) - 功能演示脚本
- 📋 [项目总结](./docs/项目总结.md) - 功能清单与开发计划

---

## ✨ 核心功能

- 📷 **拍照导入**：手机拍照自动识别零件名称、规格、材质
- 📦 **库存管理**：支持入库、出库、预警提醒
- 🔍 **智能搜索**：按标签、规格、材质、位置快速筛选
- ☁️ **云同步**：桌面、手机、Web 实时同步
- 🧠 **AI 模块**：自动识别零件种类与属性
- 🛠️ **扩展接口**：支持导入 BOM、CAD、Excel 清单

---

## 📝 许可证

MIT License

