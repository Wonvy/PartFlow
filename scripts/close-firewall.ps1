# PartFlow 关闭防火墙规则脚本
# 需要管理员权限运行

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  PartFlow 防火墙规则移除脚本" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否以管理员身份运行
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ 错误：需要管理员权限运行此脚本！" -ForegroundColor Red
    Write-Host ""
    Write-Host "请以管理员身份运行 PowerShell，然后执行此脚本。" -ForegroundColor Yellow
    Write-Host ""
    Pause
    exit 1
}

Write-Host "✅ 已确认管理员权限" -ForegroundColor Green
Write-Host ""

# 移除 Vite 开发服务器规则
$rule5173 = Get-NetFirewallRule -DisplayName "Vite Dev Server (5173)" -ErrorAction SilentlyContinue
if ($rule5173) {
    Write-Host "正在移除规则：Vite Dev Server (5173)..." -ForegroundColor Cyan
    try {
        Remove-NetFirewallRule -DisplayName "Vite Dev Server (5173)"
        Write-Host "✅ 已移除规则：Vite Dev Server (5173)" -ForegroundColor Green
    } catch {
        Write-Host "❌ 移除失败：$($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "ℹ️  规则 'Vite Dev Server (5173)' 不存在" -ForegroundColor Gray
}

Write-Host ""

# 移除后端 API 服务器规则
$rule3333 = Get-NetFirewallRule -DisplayName "PartFlow API Server (3333)" -ErrorAction SilentlyContinue
if ($rule3333) {
    Write-Host "正在移除规则：PartFlow API Server (3333)..." -ForegroundColor Cyan
    try {
        Remove-NetFirewallRule -DisplayName "PartFlow API Server (3333)"
        Write-Host "✅ 已移除规则：PartFlow API Server (3333)" -ForegroundColor Green
    } catch {
        Write-Host "❌ 移除失败：$($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "ℹ️  规则 'PartFlow API Server (3333)' 不存在" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  移除完成！" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "防火墙规则已关闭，外部设备将无法访问开发服务器。" -ForegroundColor Yellow
Write-Host ""
Pause

