export type PartRecognitionResult = {
  name: string;
  specification?: string;
  material?: string;
  tags?: string[];
  confidence: number; // 0-1
};

export type ImageAnalysisOptions = {
  apiKey?: string;
  provider?: "openai" | "local";
};

/**
 * 使用 AI 分析零件图片，提取名称、规格、材质等信息
 * 注意：实际实现需要接入 OpenAI Vision API 或本地 TensorFlow.js 模型
 */
export async function recognizePartFromImage(
  imageData: string | Blob,
  options?: ImageAnalysisOptions
): Promise<PartRecognitionResult> {
  // 示例实现：返回模拟数据
  // 实际需要调用 OpenAI Vision API 或本地模型
  console.warn("recognizePartFromImage: using mock implementation");
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: "M6 螺栓",
        specification: "长度 20mm",
        material: "不锈钢",
        tags: ["紧固件", "螺栓"],
        confidence: 0.85
      });
    }, 1000);
  });
}

/**
 * 从图片中提取文字（OCR）
 */
export async function extractTextFromImage(
  imageData: string | Blob
): Promise<string[]> {
  console.warn("extractTextFromImage: using mock implementation");
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(["M6", "20mm", "不锈钢"]);
    }, 800);
  });
}

/**
 * 分类零件（基于名称与标签推断分类）
 */
export function categorizePartByName(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes("螺栓") || lowerName.includes("bolt")) {
    return "紧固件/螺栓";
  }
  if (lowerName.includes("螺母") || lowerName.includes("nut")) {
    return "紧固件/螺母";
  }
  if (lowerName.includes("轴承") || lowerName.includes("bearing")) {
    return "传动件/轴承";
  }
  if (lowerName.includes("齿轮") || lowerName.includes("gear")) {
    return "传动件/齿轮";
  }
  
  return "其他";
}

