/**
 * 示例数据初始化脚本
 * 用于快速填充测试数据
 */

export const sampleCategories = [
  { name: "紧固件", description: "螺栓、螺母、垫片等" },
  { name: "紧固件/螺栓", parentId: "紧固件", description: "各类螺栓" },
  { name: "紧固件/螺母", parentId: "紧固件", description: "各类螺母" },
  { name: "传动件", description: "齿轮、轴承、皮带等" },
  { name: "传动件/轴承", parentId: "传动件", description: "各类轴承" },
  { name: "电子元件", description: "电阻、电容、芯片等" }
];

export const sampleLocations = [
  { name: "工具箱 A1", description: "一楼工作台左侧" },
  { name: "工具箱 A2", description: "一楼工作台右侧" },
  { name: "货架 B1", description: "二楼仓库第一排" },
  { name: "货架 B2", description: "二楼仓库第二排" }
];

export const sampleParts = [
  {
    name: "M6 × 20 螺栓",
    specification: "长度 20mm, 直径 6mm",
    material: "不锈钢 304",
    quantity: 150,
    minQuantity: 20,
    tags: ["紧固件", "螺栓", "不锈钢"]
  },
  {
    name: "M8 × 30 螺栓",
    specification: "长度 30mm, 直径 8mm",
    material: "碳钢",
    quantity: 80,
    minQuantity: 15,
    tags: ["紧固件", "螺栓", "碳钢"]
  },
  {
    name: "M6 螺母",
    specification: "内径 6mm",
    material: "不锈钢 304",
    quantity: 200,
    minQuantity: 30,
    tags: ["紧固件", "螺母"]
  },
  {
    name: "6001 轴承",
    specification: "内径 12mm, 外径 28mm",
    material: "合金钢",
    quantity: 25,
    minQuantity: 5,
    tags: ["传动件", "轴承"]
  },
  {
    name: "Arduino Nano",
    specification: "ATmega328P",
    material: "PCB",
    quantity: 10,
    minQuantity: 2,
    tags: ["电子元件", "开发板", "Arduino"]
  },
  {
    name: "LED 5mm 红色",
    specification: "5mm 直插",
    material: "塑料",
    quantity: 500,
    minQuantity: 50,
    tags: ["电子元件", "LED"]
  }
];

