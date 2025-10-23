# 简单测试脚本

Write-Host "测试 API 连接..." -ForegroundColor Cyan

# 测试健康检查
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3333/health" -Method Get
    Write-Host "✓ 后端服务运行正常" -ForegroundColor Green
    Write-Host "  时间: $($health.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "✗ 后端服务未启动！" -ForegroundColor Red
    Write-Host "  请运行: pnpm run dev:server" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n创建示例零件..." -ForegroundColor Cyan

# 创建零件 1
$part1 = @{
    name = "M6 螺栓"
    specification = "长度 20mm"
    material = "不锈钢"
    quantity = 150
    minQuantity = 20
    tags = @("紧固件", "螺栓")
} | ConvertTo-Json

try {
    $result1 = Invoke-RestMethod -Uri "http://localhost:3333/api/parts" -Method Post -ContentType "application/json" -Body $part1
    Write-Host "✓ 已创建: $($result1.data.name)" -ForegroundColor Green
} catch {
    Write-Host "✗ 创建失败: $_" -ForegroundColor Red
}

# 创建零件 2
$part2 = @{
    name = "M8 螺栓"
    specification = "长度 30mm"
    material = "碳钢"
    quantity = 80
    minQuantity = 15
    tags = @("紧固件", "螺栓")
} | ConvertTo-Json

try {
    $result2 = Invoke-RestMethod -Uri "http://localhost:3333/api/parts" -Method Post -ContentType "application/json" -Body $part2
    Write-Host "✓ 已创建: $($result2.data.name)" -ForegroundColor Green
} catch {
    Write-Host "✗ 创建失败: $_" -ForegroundColor Red
}

# 创建零件 3
$part3 = @{
    name = "Arduino Nano"
    specification = "ATmega328P"
    material = "PCB"
    quantity = 10
    minQuantity = 2
    tags = @("电子元件", "开发板")
} | ConvertTo-Json

try {
    $result3 = Invoke-RestMethod -Uri "http://localhost:3333/api/parts" -Method Post -ContentType "application/json" -Body $part3
    Write-Host "✓ 已创建: $($result3.data.name)" -ForegroundColor Green
} catch {
    Write-Host "✗ 创建失败: $_" -ForegroundColor Red
}

Write-Host "`n获取所有零件..." -ForegroundColor Cyan
try {
    $allParts = Invoke-RestMethod -Uri "http://localhost:3333/api/parts" -Method Get
    Write-Host "✓ 当前共有 $($allParts.total) 个零件" -ForegroundColor Green
    foreach ($part in $allParts.data) {
        Write-Host "  - $($part.name) (库存: $($part.quantity))" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ 获取失败: $_" -ForegroundColor Red
}

Write-Host "`n✅ 完成！现在可以访问 Web 界面查看数据" -ForegroundColor Green
Write-Host "📱 http://localhost:5173" -ForegroundColor Cyan

