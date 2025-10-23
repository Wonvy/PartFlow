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

- 🎉 [项目展示](./docs/项目展示.md) - 完整项目展示与亮点
- 📘 [开发说明](./docs/开发说明.md) - 技术栈与架构设计
- 🚀 [快速开始](./docs/快速开始.md) - 5 分钟入门指南
- 📖 [使用指南](./docs/使用指南.md) - 功能详细说明
- 📷 [图片上传指南](./docs/图片上传指南.md) - 图片上传完整教程
- 📡 [API 文档](./docs/API文档.md) - REST API 完整文档
- 🎬 [功能演示](./docs/功能演示.md) - 功能演示脚本
- 📋 [项目总结](./docs/项目总结.md) - 功能清单与开发计划

---

## ✨ 核心功能

- 📷 **图片上传**：支持文件选择、拖拽、剪贴板粘贴（Ctrl+V）
- 📸 **相机拍照**：Web 端摄像头拍照，移动端原生相机拍摄 ⭐ 新增
- 📱 **移动优先**：手机/平板实时拍照，前后摄像头切换
- 📦 **库存管理**：支持入库、出库、预警提醒
- 🔍 **智能搜索**：按分类、位置、库存状态多条件筛选
- 🎯 **高级筛选**：分类、位置、低库存组合筛选
- 🗂️ **分类位置**：灵活的分类和位置管理
- 🛠️ **扩展接口**：支持导入 BOM、CAD、Excel 清单（待实现）

---

## 📝 许可证

MIT License

