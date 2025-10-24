# Windows 防火墙设置指南

## 问题描述

在 Windows 系统上运行 Vite 开发服务器后，虽然可以在本机访问 `http://localhost:5173/`，但手机无法通过局域网 IP（如 `http://10.102.208.152:5173/`）访问页面。

这是因为 Windows 防火墙默认阻止了外部设备访问本机的端口。

## 解决方案

### 方法一：临时允许 Node.js（快速方法）

1. **首次运行时弹出防火墙提示**
   - 当你启动 `pnpm dev` 时，Windows 可能会弹出防火墙提示
   - **务必勾选"专用网络"和"公用网络"**
   - 点击"允许访问"

2. **如果已经错过提示，手动添加规则：**

   a. 按 `Win + R`，输入 `wf.msc`，回车打开 Windows Defender 防火墙

   b. 点击左侧"入站规则"

   c. 点击右侧"新建规则"

   d. 选择"程序" → 下一步

   e. 选择"此程序路径"，浏览找到 Node.js 的路径：
      - 通常在：`C:\Program Files\nodejs\node.exe`
      - 或使用命令查找：在终端运行 `where node`

   f. 选择"允许连接" → 下一步

   g. **勾选所有选项**（域、专用、公用）→ 下一步

   h. 输入名称：`Node.js Development Server` → 完成

### 方法二：允许特定端口（推荐，更安全）

1. 按 `Win + R`，输入 `wf.msc`，回车

2. 点击左侧"入站规则"

3. 点击右侧"新建规则"

4. 选择"端口" → 下一步

5. 选择"TCP"，输入特定本地端口：`5173` → 下一步

6. 选择"允许连接" → 下一步

7. **勾选所有选项**（域、专用、公用）→ 下一步

8. 输入名称：`Vite Dev Server (5173)` → 完成

### 方法三：使用 PowerShell 命令（最快）

以**管理员身份**打开 PowerShell，运行以下命令：

```powershell
# 允许 5173 端口的入站连接
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow

# 如果后端也需要访问，允许 3333 端口
New-NetFirewallRule -DisplayName "PartFlow Server" -Direction Inbound -LocalPort 3333 -Protocol TCP -Action Allow
```

### 方法四：临时关闭防火墙（不推荐，仅用于测试）

1. 打开"Windows 安全中心"
2. 点击"防火墙和网络保护"
3. 选择当前活动的网络（通常是"专用网络"）
4. 关闭"Microsoft Defender 防火墙"

**注意：测试完成后请重新开启防火墙！**

## 验证设置

### 1. 检查防火墙规则

在 PowerShell 中运行：

```powershell
Get-NetFirewallRule -DisplayName "*Vite*" | Format-List -Property DisplayName,Enabled,Direction,Action
```

### 2. 测试端口是否开放

在另一台设备（如手机）上访问：
- `http://10.102.208.152:5173/`

或使用在线端口检测工具。

### 3. 检查网络连接

确保：
- ✅ 手机和电脑连接在同一个 WiFi
- ✅ 不是使用手机热点（某些热点有 AP 隔离）
- ✅ 路由器没有启用"AP 隔离"或"客户端隔离"功能

## 常见问题

### Q: 设置后还是无法访问？

A: 检查以下几点：
1. 确认开发服务器正在运行（终端显示 Network 地址）
2. 尝试在电脑浏览器访问 `http://10.102.208.152:5173/`
3. 检查是否有第三方防火墙软件（如 360、腾讯管家等）
4. 确认路由器没有启用设备隔离

### Q: 需要为后端服务器（3333端口）也设置吗？

A: 是的，如果手机需要访问后端 API，也需要开放 3333 端口：

```powershell
New-NetFirewallRule -DisplayName "PartFlow API Server" -Direction Inbound -LocalPort 3333 -Protocol TCP -Action Allow
```

### Q: 删除防火墙规则

如果不再需要，可以删除规则：

```powershell
Remove-NetFirewallRule -DisplayName "Vite Dev Server"
```

## 推荐配置

建议使用**方法二（允许特定端口）**或**方法三（PowerShell命令）**，因为：
- ✅ 更安全：只开放需要的端口
- ✅ 更精确：不影响其他 Node.js 应用
- ✅ 更方便：可以随时启用/禁用规则

## 安全提示

⚠️ 开发完成后，建议：
1. 禁用或删除防火墙规则
2. 或者只允许专用网络访问
3. 生产环境请使用更严格的安全配置

