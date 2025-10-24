# 删除分类 API 错误修复说明

## 问题描述

在删除分类时出现以下错误：
```
API Error: Bad Request
Body cannot be empty when content-type is set to 'application/json'
```

## 问题原因

Fastify 服务器期望 DELETE 请求要么：
1. 没有 `Content-Type: application/json` 头
2. 或者有请求体（body）

但我们的 API 客户端对所有请求都默认设置了 `Content-Type: application/json` 头，而 DELETE 请求通常不需要请求体，导致服务器报错。

## 解决方案

### 1. 修改 API 客户端逻辑

**修改前**：
```typescript
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",  // ❌ 总是设置
      ...options?.headers
    }
  });
  // ...
}
```

**修改后**：
```typescript
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // 对于 DELETE 请求，不设置 Content-Type 头
  const headers: Record<string, string> = {};
  
  // 只有当请求有 body 时才设置 Content-Type
  if (options?.body) {
    headers["Content-Type"] = "application/json";  // ✅ 只在有 body 时设置
  }
  
  // 合并用户提供的 headers
  if (options?.headers) {
    Object.assign(headers, options.headers);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  // 对于 204 No Content 响应，不尝试解析 JSON
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
```

### 2. 关键改进

#### 条件性 Content-Type 设置
- ✅ **有请求体时**：设置 `Content-Type: application/json`
- ✅ **无请求体时**：不设置 Content-Type 头
- ✅ **DELETE 请求**：通常无请求体，不设置 Content-Type

#### 204 响应处理
- ✅ **204 No Content**：不尝试解析 JSON（避免错误）
- ✅ **其他状态码**：正常解析 JSON 响应

### 3. 影响的文件

1. **`apps/web/src/api/client.ts`** - Web 端 API 客户端
2. **`apps/desktop/src/api/client.ts`** - 桌面端 API 客户端

### 4. 修复的 API 方法

以下 DELETE 方法现在可以正常工作：

```typescript
// 删除零件
deletePart: (id: string) => fetchAPI<void>(`/parts/${id}`, {
  method: "DELETE"
})

// 删除分类
deleteCategory: (id: string) => fetchAPI<void>(`/categories/${id}`, {
  method: "DELETE"
})

// 删除位置
deleteLocation: (id: string) => fetchAPI<void>(`/locations/${id}`, {
  method: "DELETE"
})
```

## 技术细节

### HTTP 标准

根据 HTTP 标准：
- **DELETE 请求**：通常不需要请求体
- **Content-Type 头**：只有在有请求体时才需要设置
- **204 响应**：表示成功但无内容返回

### Fastify 行为

Fastify 的 JSON 解析器：
- 如果设置了 `Content-Type: application/json`
- 但请求体为空
- 会抛出 `FST_ERR_CTP_EMPTY_JSON_BODY` 错误

### 修复策略

1. **智能头部设置**：根据请求是否有 body 来决定是否设置 Content-Type
2. **响应处理**：正确处理 204 No Content 响应
3. **向后兼容**：不影响现有的 POST/PUT 请求

## 测试验证

### 测试步骤

1. **Web 端测试**：
   - 访问 `http://10.0.0.3:5173/`
   - 进入"分类"页面
   - 尝试删除任意分类
   - 应该成功删除，不再报错

2. **桌面端测试**：
   - 启动桌面应用
   - 进入"分类"页面
   - 尝试删除任意分类
   - 应该成功删除，不再报错

### 预期结果

- ✅ 删除分类成功
- ✅ 不再出现 "Body cannot be empty" 错误
- ✅ 分类从列表中正确移除
- ✅ 相关零件自动取消关联

## 相关错误日志

### 修复前
```
{"level":30,"time":1761321110087,"pid":80316,"hostname":"WonvyAMD","reqId":"req-d3","res":{"statusCode":400},"err":{"type":"FastifyError","message":"Body cannot be empty when content-type is set to 'application/json'","stack":"FastifyError: Body cannot be empty when content-type is set to 'application/json'\n    at Parser.defaultJsonParser [as fn] (D:\\Code\\cursor\\PartFlow\\node_modules\\.pnpm\\fastify@4.29.1\\node_modules\\fastify\\lib\\contentTypeParser.js:295:19)","code":"FST_ERR_CTP_EMPTY_JSON_BODY","name":"FastifyError","statusCode":400},"msg":"Body cannot be empty when content-type is set to 'application/json'"}
```

### 修复后
```
{"level":30,"time":1761321115583,"pid":80316,"hostname":"WonvyAMD","reqId":"req-d5","res":{"statusCode":204},"responseTime":0.5564000606536865,"msg":"request completed"}
```

## 总结

通过智能设置 HTTP 头部和正确处理响应，成功解决了删除分类时的 API 错误。现在所有 DELETE 操作都可以正常工作，用户体验得到显著改善。

**关键改进**：
- 🎯 条件性 Content-Type 设置
- 🎯 正确处理 204 响应
- 🎯 保持向后兼容性
- 🎯 统一 Web 和桌面端行为
