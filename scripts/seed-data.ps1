# PowerShell 版本示例数据脚本

Write-Host "正在创建示例数据..." -ForegroundColor Cyan

# 创建分类
Write-Host "`n创建分类..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3333/api/categories" -Method Post -ContentType "application/json" -Body '{"name":"紧固件","description":"螺栓、螺母、垫片等"}' | Out-Null
Invoke-RestMethod -Uri "http://localhost:3333/api/categories" -Method Post -ContentType "application/json" -Body '{"name":"传动件","description":"齿轮、轴承、皮带等"}' | Out-Null
Invoke-RestMethod -Uri "http://localhost:3333/api/categories" -Method Post -ContentType "application/json" -Body '{"name":"电子元件","description":"电阻、电容、芯片等"}' | Out-Null

# 创建位置
Write-Host "创建位置..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3333/api/locations" -Method Post -ContentType "application/json" -Body '{"name":"工具箱 A1","description":"一楼工作台左侧"}' | Out-Null
Invoke-RestMethod -Uri "http://localhost:3333/api/locations" -Method Post -ContentType "application/json" -Body '{"name":"货架 B1","description":"二楼仓库第一排"}' | Out-Null

# 创建零件
Write-Host "创建零件..." -ForegroundColor Yellow

$parts = @(
    @{
        name = "M6 × 20 螺栓"
        specification = "长度 20mm, 直径 6mm"
        material = "不锈钢 304"
        quantity = 150
        minQuantity = 20
        tags = @("紧固件", "螺栓", "不锈钢")
    },
    @{
        name = "M8 × 30 螺栓"
        specification = "长度 30mm, 直径 8mm"
        material = "碳钢"
        quantity = 80
        minQuantity = 15
        tags = @("紧固件", "螺栓", "碳钢")
    },
    @{
        name = "M6 螺母"
        specification = "内径 6mm"
        material = "不锈钢 304"
        quantity = 200
        minQuantity = 30
        tags = @("紧固件", "螺母")
    },
    @{
        name = "6001 轴承"
        specification = "内径 12mm, 外径 28mm"
        material = "合金钢"
        quantity = 25
        minQuantity = 5
        tags = @("传动件", "轴承")
    },
    @{
        name = "Arduino Nano"
        specification = "ATmega328P"
        material = "PCB"
        quantity = 10
        minQuantity = 2
        tags = @("电子元件", "开发板", "Arduino")
    },
    @{
        name = "LED 5mm 红色"
        specification = "5mm 直插"
        material = "塑料"
        quantity = 500
        minQuantity = 50
        tags = @("电子元件", "LED")
    }
)

foreach ($part in $parts) {
    $json = $part | ConvertTo-Json -Compress
    Invoke-RestMethod -Uri "http://localhost:3333/api/parts" -Method Post -ContentType "application/json" -Body $json | Out-Null
    Write-Host "  ✓ 已创建: $($part.name)" -ForegroundColor Green
}

Write-Host "`n✅ 示例数据创建完成！" -ForegroundColor Green
Write-Host "📱 访问 http://localhost:5173 查看 Web 界面" -ForegroundColor Cyan

