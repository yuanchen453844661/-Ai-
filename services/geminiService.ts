
import { GoogleGenAI } from "@google/genai";
import { GenerateRequest, GenerateResponse } from "../types";
import { DEFAULT_PROMPT_PREFIX, DEFAULT_PROMPT_SUFFIX, DUSK_PROMPT, NIGHT_PROMPT } from "../constants";

export const generateRealisticImage = async (request: GenerateRequest): Promise<GenerateResponse> => {
  try {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      throw new Error("API配置错误：未找到 API Key。请点击左上角或设置按钮选择 API Key。");
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const { image, prompt, renderingType, renderingStyle, isCoveredPools, isDuskMode, isNightMode } = request;

    const base64Data = image.base64.split(',')[1];

    let environmentPrompt = "";
    if (isDuskMode) {
      environmentPrompt = `- 环境氛围 (Dusk): ${DUSK_PROMPT}`;
    } else if (isNightMode) {
      environmentPrompt = `- 环境氛围 (Night): ${NIGHT_PROMPT}`;
    }

    const finalPrompt = `
      ${DEFAULT_PROMPT_PREFIX}
      
      【关键配置 Key Configuration】:
      - 任务与视图类型: ${renderingType}
      - 推荐风格: ${renderingStyle}
      ${isCoveredPools ? '- 特殊处理: 对所有池体结构进行美化加盖处理 (Ensure all tanks/pools are architecturally covered).' : ''}
      ${environmentPrompt}

      【详细设计要求】: 
      1. 如果图像中有标记（如红线、文字、涂鸦），请作为设计引导并在最终图中移除它们。
      2. 保持原图的基本空间结构和透视关系。
      3. ${prompt || "生成高质量的实景效果。"}
      
      ${DEFAULT_PROMPT_SUFFIX}
    `;

    const parts: any[] = [
      { text: finalPrompt },
      {
        inlineData: {
          mimeType: image.mimeType,
          data: base64Data,
        },
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', 
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      }
    });

    let generatedImageUrl = '';

    if (response.candidates && response.candidates.length > 0) {
      const respParts = response.candidates[0].content.parts;
      for (const part of respParts) {
        if (part.inlineData && part.inlineData.data) {
          generatedImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!generatedImageUrl) {
      throw new Error("模型未能生成图像，请重试。");
    }

    return { imageUrl: generatedImageUrl };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const errorMessage = error.message || JSON.stringify(error);
    if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("API 调用配额已耗尽。请在 Google AI Studio 检查您的计费项目。");
    }
    if (errorMessage.includes("503") || errorMessage.includes("overloaded")) {
      throw new Error("模型服务当前繁忙 (503)，请稍后重试。");
    }
    if (errorMessage.includes("SAFETY") || errorMessage.includes("blocked")) {
        throw new Error("生成内容因安全策略被拦截，请尝试修改描述或上传合规的图片。");
    }
    throw new Error(`生成失败: ${error.message || "请检查网络或稍后重试"}`);
  }
};
