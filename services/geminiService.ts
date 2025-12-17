
import { GoogleGenAI } from "@google/genai";
import { GenerateRequest, GenerateResponse } from "../types";
import { DEFAULT_PROMPT_PREFIX, DEFAULT_PROMPT_SUFFIX } from "../constants";

export const generateRealisticImage = async (request: GenerateRequest): Promise<GenerateResponse> => {
  try {
    const apiKey = process.env.API_KEY;

    // Debug log (safe, doesn't reveal key)
    console.log("Gemini Service Initializing. API Key present:", !!apiKey);

    if (!apiKey) {
      throw new Error("API配置错误：未找到 API Key。请检查 Vercel 环境变量设置并重新部署。");
    }

    // Initialize inside the function
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const { image, referenceImage, prompt, renderingType, renderingStyle, isCoveredPools } = request;

    // Remove the data URL prefix to get raw base64
    const base64Data = image.base64.split(',')[1];

    let finalPrompt = `
      ${DEFAULT_PROMPT_PREFIX}
      
      【关键配置 Key Configuration】:
      - 视图 Viewpoint: ${renderingType}
      - 风格 Style: ${renderingStyle}
      ${isCoveredPools ? '- 特殊结构: 所有污水处理池必须加盖 (Ensure all sewage treatment pools are covered with modern architectural structures/domes. No open water tanks).' : ''}

      【用户特定描述 User Description】: ${prompt || "Standard sewage treatment plant facility."}
      
      ${DEFAULT_PROMPT_SUFFIX}
    `;

    // If a reference image is provided, update the prompt to explain the relationship
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

    console.log("Sending request to Gemini model...");

    const parts: any[] = [
      { text: finalPrompt },
      {
        inlineData: {
          mimeType: image.mimeType,
          data: base64Data,
        },
      }
    ];

    // Add secondary image if it exists
    if (referenceImage) {
      const referenceBase64 = referenceImage.base64.split(',')[1];
      parts.push({
        inlineData: {
          mimeType: referenceImage.mimeType,
          data: referenceBase64,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // supports multi-image
      contents: {
        parts: parts,
      },
    });

    console.log("Response received.");

    let generatedImageUrl = '';

    // Parse response to find image data
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
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
    console.error("Gemini API Error Full Object:", error);
    
    const errorMessage = error.message || JSON.stringify(error);

    // 1. Handle API Key missing/invalid
    if (errorMessage.includes("API key")) {
      throw new Error("API 密钥无效或未配置。请检查 Vercel 环境变量。");
    }

    // 2. Handle Quota Exceeded (429)
    if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("quota")) {
      throw new Error("API 调用配额已耗尽 (429)。您的 Gemini API 免费额度已用完，请稍后再试，或在 Google AI Studio 更换新的 API Key。");
    }

    // 3. Handle Model Overloaded (503)
    if (errorMessage.includes("503") || errorMessage.includes("overloaded")) {
      throw new Error("模型服务当前繁忙 (503)，请稍后重试。");
    }

    // 4. Handle Blocked Content (Safety settings)
    if (errorMessage.includes("SAFETY") || errorMessage.includes("blocked")) {
        throw new Error("生成的内容因安全策略被拦截，请尝试修改提示词或更换图片。");
    }

    throw new Error(`生成失败: ${error.message || "请检查网络或稍后重试"}`);
  }
};
