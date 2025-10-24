# PartFlow 开发服务器防火墙规则设置脚本
# 需要管理员权限运行

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  PartFlow 防火墙配置脚本" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否以管理员身份运行
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ 错误：需要管理员权限运行此脚本！" -ForegroundColor Red
    Write-Host ""
    Write-Host "请按以下步骤操作：" -ForegroundColor Yellow
    Write-Host "1. 右键点击 PowerShell" -ForegroundColor Yellow
    Write-Host "2. 选择 '以管理员身份运行'" -ForegroundColor Yellow
    Write-Host "3. 重新运行此脚本" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "或者在管理员 PowerShell 中运行：" -ForegroundColor Yellow
    Write-Host "   .\scripts\open-firewall.ps1" -ForegroundColor Cyan
    Write-Host ""
    Pause
    exit 1
}

Write-Host "✅ 已确认管理员权限" -ForegroundColor Green
Write-Host ""

# 检查是否已存在规则
$existingRule5173 = Get-NetFirewallRule -DisplayName "Vite Dev Server (5173)" -ErrorAction SilentlyContinue
$existingRule3333 = Get-NetFirewallRule -DisplayName "PartFlow API Server (3333)" -ErrorAction SilentlyContinue

# 添加 Vite 开发服务器规则（5173端口）
if ($existingRule5173) {
    Write-Host "⚠️  规则 'Vite Dev Server (5173)' 已存在，将更新..." -ForegroundColor Yellow
    Remove-NetFirewallRule -DisplayName "Vite Dev Server (5173)" -ErrorAction SilentlyContinue
}

Write-Host "正在添加防火墙规则：Vite Dev Server (端口 5173)..." -ForegroundColor Cyan
try {
    New-NetFirewallRule `
        -DisplayName "Vite Dev Server (5173)" `
        -Direction Inbound `
        -LocalPort 5173 `
        -Protocol TCP `
        -Action Allow `
        -Profile Domain,Private,Public `
        -Description "允许局域网访问 PartFlow Web 开发服务器" | Out-Null
    
    Write-Host "✅ 成功添加规则：Vite Dev Server (5173)" -ForegroundColor Green
} catch {
    Write-Host "❌ 添加规则失败：$($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 添加后端 API 服务器规则（3333端口）
if ($existingRule3333) {
    Write-Host "⚠️  规则 'PartFlow API Server (3333)' 已存在，将更新..." -ForegroundColor Yellow
    Remove-NetFirewallRule -DisplayName "PartFlow API Server (3333)" -ErrorAction SilentlyContinue
}

Write-Host "正在添加防火墙规则：PartFlow API Server (端口 3333)..." -ForegroundColor Cyan
try {
    New-NetFirewallRule `
        -DisplayName "PartFlow API Server (3333)" `
        -Direction Inbound `
        -LocalPort 3333 `
        -Protocol TCP `
        -Action Allow `
        -Profile Domain,Private,Public `
        -Description "允许局域网访问 PartFlow 后端 API 服务器" | Out-Null
    
    Write-Host "✅ 成功添加规则：PartFlow API Server (3333)" -ForegroundColor Green
} catch {
    Write-Host "❌ 添加规则失败：$($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  配置完成！" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "已添加以下防火墙规则：" -ForegroundColor Yellow
Write-Host "  ✅ Vite Dev Server (5173) - Web 前端" -ForegroundColor Green
Write-Host "  ✅ PartFlow API Server (3333) - 后端 API" -ForegroundColor Green
Write-Host ""
Write-Host "现在你可以：" -ForegroundColor Cyan
Write-Host "  1. 在电脑上访问：http://10.102.208.152:5173/" -ForegroundColor White
Write-Host "  2. 在手机上访问：http://10.102.208.152:5173/" -ForegroundColor White
Write-Host "  3. 使用二维码扫描功能分享给其他设备" -ForegroundColor White
Write-Host ""
Write-Host "提示：" -ForegroundColor Yellow
Write-Host "  - 请确保手机和电脑在同一个 WiFi 网络" -ForegroundColor Gray
Write-Host "  - 开发完成后，可运行 close-firewall.ps1 关闭规则" -ForegroundColor Gray
Write-Host ""

# 显示当前网络地址
Write-Host "当前电脑的局域网 IP 地址：" -ForegroundColor Cyan
Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -ne "127.0.0.1" } | 
    ForEach-Object {
        Write-Host "  📍 http://$($_.IPAddress):5173/" -ForegroundColor Green
    }

Write-Host ""
Pause

