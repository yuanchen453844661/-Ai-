
import { GoogleGenAI } from "@google/genai";
import { GenerateRequest, GenerateResponse } from "../types";
import { DEFAULT_PROMPT_PREFIX, DEFAULT_PROMPT_SUFFIX, DUSK_PROMPT, NIGHT_PROMPT } from "../constants";

export const generateRealisticImage = async (request: GenerateRequest): Promise<GenerateResponse> => {
  try {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      throw new Error("API配置错误：未找到 API Key。请点击左上角或设置按钮选择 API Key。");
    }

    // Always create a new instance to get the latest key from the process.env
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const { image, referenceImage, prompt, renderingType, renderingStyle, isCoveredPools, isDuskMode, isNightMode } = request;

    // Remove the data URL prefix to get raw base64
    const base64Data = image.base64.split(',')[1];

    let environmentPrompt = "";
    if (isDuskMode) {
      environmentPrompt = `- 环境氛围 (Dusk): ${DUSK_PROMPT}`;
    } else if (isNightMode) {
      environmentPrompt = `- 环境氛围 (Night): ${NIGHT_PROMPT}`;
    }

    let finalPrompt = `
      ${DEFAULT_PROMPT_PREFIX}
      
      【关键配置 Key Configuration】:
      - 视图 Viewpoint: ${renderingType}
      - 风格 Style: ${renderingStyle}
      ${isCoveredPools ? '- 特殊结构: 所有污水处理池必须加盖 (Ensure all sewage treatment pools are covered with modern architectural structures/domes. No open water tanks).' : ''}
      ${environmentPrompt}

      【用户特定描述 User Description】: ${prompt || "Standard sewage treatment plant facility."}
      
      ${DEFAULT_PROMPT_SUFFIX}
    `;

    // If a reference image is provided, update the prompt
    if (referenceImage) {
      finalPrompt = `
      [指令 Instruction]: 请结合提供的两张图片生成一张新的实景图。
      - 图片 1 (Image 1) 是建筑的【正视图/主视图】(Front View / Main View)。
      - 图片 2 (Image 2) 是建筑的【侧视图/参考图】(Side View / Reference View)。
      
      [任务 Task]: 基于这两张图片的结构信息，构建该建筑的 3D 空间关系，并生成一张【人视视角 (Eye-level Perspective)】的实景效果图。
      请确保建筑的门窗位置、轮廓结构与两张参考图严格一致。
      
      ${finalPrompt}
      `;
    }

    const parts: any[] = [
      { text: finalPrompt },
      {
        inlineData: {
          mimeType: image.mimeType,
          data: base64Data,
        },
      }
    ];

    if (referenceImage) {
      const referenceBase64 = referenceImage.base64.split(',')[1];
      parts.push({
        inlineData: {
          mimeType: referenceImage.mimeType,
          data: referenceBase64,
        },
      });
    }

    // Using gemini-3-pro-image-preview (Banana Pro) as requested
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
        throw new Error("生成内容因安全策略被拦截，请尝试修改描述。");
    }

    throw new Error(`生成失败: ${error.message || "请检查网络或稍后重试"}`);
  }
};
