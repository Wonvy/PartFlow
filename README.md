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
- **数据库**: SQLite 3 ⭐ 新增
- **语言**: TypeScript
- **构建工具**: Vite
- **包管理**: pnpm workspaces
- **AI**: OpenAI Vision API / TensorFlow.js (计划中)

---

## 📖 文档

- 🎉 [项目展示](./docs/项目展示.md) - 完整项目展示与亮点
- 📘 [开发说明](./docs/开发说明.md) - 技术栈与架构设计
- 🚀 [快速开始](./docs/快速开始.md) - 5 分钟入门指南
- 📖 [使用指南](./docs/使用指南.md) - 功能详细说明
- 📷 [图片上传指南](./docs/图片上传指南.md) - 图片上传完整教程
- 📸 [相机拍照演示](./docs/相机拍照功能演示.md) - 相机拍照功能演示
- 🎨 [极简主义设计指南](./docs/极简主义设计指南.md) - 设计系统文档 ⭐ 新增
- 💾 [数据持久化说明](./docs/数据持久化说明.md) - 数据库使用文档 ⭐ 新增
- 📡 [API 文档](./docs/API文档.md) - REST API 完整文档
- 🎬 [功能演示](./docs/功能演示.md) - 功能演示脚本
- 📋 [项目总结](./docs/项目总结.md) - 功能清单与开发计划

---

## ✨ 核心功能

- 💾 **数据持久化**：SQLite 数据库，数据永久保存，重启不丢失
- 📷 **图片上传**：支持文件选择、拖拽、剪贴板粘贴（Ctrl+V）
- 📸 **相机拍照**：Web 端摄像头拍照，移动端原生相机拍摄
- 📱 **移动优先**：手机/平板实时拍照，前后摄像头切换
- 📦 **零件管理**：创建、编辑、删除零件，图片上传，库存调整
- 🗂️ **分类管理**：创建、编辑、删除分类，点击查看分类零件
- 📍 **位置管理**：创建、编辑、删除位置，点击查看位置零件
- 📊 **库存管理**：快速入库/出库，库存变动历史记录
- 🔍 **智能搜索**：按名称、规格、材质关键词搜索
- 🎯 **高级筛选**：分类、位置、低库存组合筛选
- 📥 **数据导入导出**：CSV/JSON 格式，完整备份，批量导入 ⭐ 新增
- 🎨 **极简主义设计**：统一设计系统，专业优雅界面 ⭐ 新增

---

## 📝 许可证

MIT License

