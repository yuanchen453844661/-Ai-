import { RenderOption } from "./types";

export const APP_NAME = "RealVision AI";
export const MAX_FILE_SIZE_MB = 10;
export const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

// Updated base prompt for industrial/architectural context
export const DEFAULT_PROMPT_PREFIX = "作为一名专业的建筑可视化专家，请将这张线稿/草图转化为一张极其逼真的高质量实景效果图。";
export const DEFAULT_PROMPT_SUFFIX = "画面要求：8k分辨率，电影级光影，极度细节，照片级真实感，包含真实的环境遮蔽和材质纹理。";

export const RENDERING_TYPES: RenderOption[] = [
  { id: 'aerial', label: '鸟瞰图', value: 'High-angle aerial view drone shot, showing the entire layout and surrounding environment', description: '适合展示整体布局' },
  { id: 'eye-level', label: '人视图', value: 'Eye-level perspective shot, as seen by a pedestrian standing on the ground', description: '模拟人眼观看角度' },
  { id: 'color-plan', label: '彩平图', value: 'Architectural colored site plan, top-down 2D view with realistic textures and shadows', description: '带材质的平面布置' },
  { id: 'top', label: '俯视图', value: 'Direct top-down view (roof plan), satellite style', description: '垂直向下的视图' },
  { id: 'front', label: '正视图', value: 'Front elevation view, architectural facade render, flat lighting', description: '建筑正面立面' },
  { id: 'side', label: '侧视图', value: 'Side elevation view, architectural profile render', description: '建筑侧面展示' },
];

export const INDUSTRIAL_STYLES: RenderOption[] = [
  { id: 'modern-tech', label: '现代科技工业风', value: 'Modern high-tech industrial style, sleek metallic finishes, glass facades, blue mood lighting, clean concrete, futuristic sewage treatment plant aesthetic', description: '金属、玻璃、科技感' },
  { id: 'eco-garden', label: '生态园林化风格', value: 'Eco-friendly garden factory style, sewage treatment plant integrated with lush greenery, vertical gardens, wooden elements, sustainable architecture, park-like atmosphere', description: '绿植融合、公园化' },
  { id: 'minimalist', label: '极简清水混凝土', value: 'Minimalist brutalist style, exposed raw concrete (béton brut), clean geometric lines, soft daylight, high-end architectural gallery feel', description: '素雅、几何感、高级灰' },
  { id: 'red-brick', label: '复古红砖工业风', value: 'Renovated industrial heritage style, red brick textures combined with black steel structures, warm tone, adaptive reuse aesthetic', description: '红砖、黑钢、历史感' },
];
