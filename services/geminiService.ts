import { GoogleGenAI } from "@google/genai";
import { GenerateRequest, GenerateResponse } from "../types";
import { DEFAULT_PROMPT_PREFIX, DEFAULT_PROMPT_SUFFIX } from "../constants";

export const generateRealisticImage = async (request: GenerateRequest): Promise<GenerateResponse> => {
  try {
    // Initialize inside the function to avoid top-level crashes if process.env.API_KEY is undefined on load
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const { image, prompt, renderingType, renderingStyle } = request;

    // Remove the data URL prefix (e.g., "data:image/png;base64,") to get raw base64
    const base64Data = image.base64.split(',')[1];

    // Construct a specific prompt based on user selection
    // Structure: [Role Definition] + [View Type] + [Style Definition] + [User Details] + [Quality Suffix]
    const finalPrompt = `
      ${DEFAULT_PROMPT_PREFIX}
      
      【视图类型 Viewpoint】: ${renderingType}
      【设计风格 Style】: ${renderingStyle}
      【用户特定描述 User Description】: ${prompt || "Standard sewage treatment plant facility."}
      
      ${DEFAULT_PROMPT_SUFFIX}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: finalPrompt,
          },
          {
            inlineData: {
              mimeType: image.mimeType,
              data: base64Data,
            },
          },
        ],
      },
    });

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

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};