#!/bin/bash

echo "正在创建示例数据..."

# 创建分类
echo "创建分类..."
curl -X POST http://localhost:3333/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"紧固件","description":"螺栓、螺母、垫片等"}'

curl -X POST http://localhost:3333/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"传动件","description":"齿轮、轴承、皮带等"}'

# 创建位置
echo "创建位置..."
curl -X POST http://localhost:3333/api/locations \
  -H "Content-Type: application/json" \
  -d '{"name":"工具箱 A1","description":"一楼工作台左侧"}'

# 创建零件
echo "创建零件..."
curl -X POST http://localhost:3333/api/parts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "M6 × 20 螺栓",
    "specification": "长度 20mm, 直径 6mm",
    "material": "不锈钢 304",
    "quantity": 150,
    "minQuantity": 20,
    "tags": ["紧固件", "螺栓", "不锈钢"]
  }'

curl -X POST http://localhost:3333/api/parts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "M8 × 30 螺栓",
    "specification": "长度 30mm, 直径 8mm",
    "material": "碳钢",
    "quantity": 80,
    "minQuantity": 15,
    "tags": ["紧固件", "螺栓", "碳钢"]
  }'

curl -X POST http://localhost:3333/api/parts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "M6 螺母",
    "specification": "内径 6mm",
    "material": "不锈钢 304",
    "quantity": 200,
    "minQuantity": 30,
    "tags": ["紧固件", "螺母"]
  }'

curl -X POST http://localhost:3333/api/parts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "6001 轴承",
    "specification": "内径 12mm, 外径 28mm",
    "material": "合金钢",
    "quantity": 25,
    "minQuantity": 5,
    "tags": ["传动件", "轴承"]
  }'

curl -X POST http://localhost:3333/api/parts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arduino Nano",
    "specification": "ATmega328P",
    "material": "PCB",
    "quantity": 10,
    "minQuantity": 2,
    "tags": ["电子元件", "开发板", "Arduino"]
  }'

curl -X POST http://localhost:3333/api/parts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "LED 5mm 红色",
    "specification": "5mm 直插",
    "material": "塑料",
    "quantity": 500,
    "minQuantity": 50,
    "tags": ["电子元件", "LED"]
  }'

echo ""
echo "✅ 示例数据创建完成！"
echo "访问 http://localhost:5173 查看 Web 界面"

