
import { RenderOption } from "./types";

export const APP_NAME = "RealVision AI";
export const MAX_FILE_SIZE_MB = 10;
export const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

// Updated base prompt for industrial/architectural context
export const DEFAULT_PROMPT_PREFIX = "作为一名专业的建筑可视化专家，请将这张线稿/草图转化为一张极其逼真的高质量实景效果图。";
export const DEFAULT_PROMPT_SUFFIX = ""; // Suffix cleared as it is integrated into the specific prompt below for better control

// New constant for Dusk mode
export const DUSK_PROMPT = "Modern office building at dusk, glowing interior lights, warm lighting spilling out from windows, glass facade, dramatic sky with sunset colors, cinematic lighting, wet asphalt road reflection, hyper-realistic, 8k resolution, architectural photography, highly detailed, moody atmosphere.建筑外增加路灯，布局合理，柔和光线";

// New constant for Night mode
export const NIGHT_PROMPT = "夜景，建筑可视化，写实风格，3D渲染，路灯，室内暖光，道路车流光轨，长曝光，黑色天空，Octane渲染，高细节，8k分辨率";

export const RENDERING_TYPES: RenderOption[] = [
  { 
    id: 'aerial', 
    label: '鸟瞰图', 
    value: '根据这张图的用地地形，生成一个现代污水厂，两个出入口，保持轮廓和道路位置不变。Low altitude aerial view, drone shot from lower angle, modern sewage treatment plant, industrial park layout,flat white roofs, Manicured landscape, lush green trees surrounding buildings, organized asphalt roads, lawns, clean water surfaces, sunny day, clear blue sky, soft natural lighting, Architectural visualization, photorealistic, 3D rendering, Octane render, Unreal Engine 5, high definition, 8k resolution, highly detailed textures, sharp focus, professional photography, cinematic lighting, masterpiece.负面词：模糊，水印', 
    description: '整体布局，保留地形轮廓' 
  },
  { 
    id: 'eye-level', 
    label: '人视图', 
    value: '识别图中的门和窗户轮廓，生成一张人视视角的效果图，能够同时看到建筑的多个面（结合正视图与侧视图信息）。布局合理，严格限制门和窗户的位置不变，严格限制外轮廓不变，现代建筑，白色真石漆外立面，建筑表面真实反射，有局部高光，提高真实摄影质感，明媚的光线，电影级别的光线，分析合理，高级感; 建筑周围增加景观布置，阳光明媚的白天，蓝天，布局合理， photorealistic, 3D rendering, Octane render, Unreal Engine 5, high definition, 8k resolution, highly detailed textures, sharp focus, professional photography, cinematic lighting, masterpiece.负面词：模糊，水印', 
    description: '模拟人眼观看，支持正侧双图合成' 
  },
  { id: 'color-plan', label: '彩平图', value: 'Architectural colored site plan, top-down 2D view with realistic textures and shadows', description: '带材质的平面布置' },
  { 
    id: 'top', 
    label: '俯视图', 
    value: '俯视图。识别图中的门和窗户轮廓，生成一张效果图，布局合理，严格限制门和窗户的位置不变，严格限制外轮廓不变，现代建筑，白色真石漆外立面，建筑表面真实反射，有局部高光，提高真实摄影质感，明媚的光线，电影级别的光线，分析合理，高级感; 建筑周围增加景观布置，阳光明媚的白天，蓝天，布局合理， photorealistic, 3D rendering, Octane render, Unreal Engine 5, high definition, 8k resolution, highly detailed textures, sharp focus, professional photography, cinematic lighting, masterpiece.负面词：模糊，水印', 
    description: '垂直向下的视图' 
  },
  { 
    id: 'front', 
    label: '正视图', 
    value: '正视图。识别图中的门和窗户轮廓，生成一张效果图，布局合理，严格限制门和窗户的位置不变，严格限制外轮廓不变，现代建筑，白色真石漆外立面，建筑表面真实反射，有局部高光，提高真实摄影质感，明媚的光线，电影级别的光线，分析合理，高级感; 建筑周围增加景观布置，阳光明媚的白天，蓝天，布局合理， photorealistic, 3D rendering, Octane render, Unreal Engine 5, high definition, 8k resolution, highly detailed textures, sharp focus, professional photography, cinematic lighting, masterpiece.负面词：模糊，水印', 
    description: '建筑正面立面' 
  },
  { 
    id: 'side', 
    label: '侧视图', 
    value: '侧视图。识别图中的门和窗户轮廓，生成一张效果图，布局合理，严格限制门和窗户的位置不变，严格限制外轮廓不变，现代建筑，白色真石漆外立面，建筑表面真实反射，有局部高光，提高真实摄影质感，明媚的光线，电影级别的光线，分析合理，高级感; 建筑周围增加景观布置，阳光明媚的白天，蓝天，布局合理， photorealistic, 3D rendering, Octane render, Unreal Engine 5, high definition, 8k resolution, highly detailed textures, sharp focus, professional photography, cinematic lighting, masterpiece.负面词：模糊，水印', 
    description: '建筑侧面展示' 
  },
];

export const INDUSTRIAL_STYLES: RenderOption[] = [
  { id: 'none', label: '无 (保留原结构)', value: 'Clean architectural structure, no specific industrial style overlay, keep original structural design simplicity', description: '不指定特定风格' },
  { id: 'modern-tech', label: '现代科技工业风', value: 'Modern high-tech industrial style, sleek metallic finishes, glass facades, blue mood lighting, clean concrete, futuristic sewage treatment plant aesthetic', description: '金属、玻璃、科技感' },
  { id: 'eco-garden', label: '生态园林化风格', value: 'Eco-friendly garden factory style, sewage treatment plant integrated with lush greenery, vertical gardens, wooden elements, sustainable architecture, park-like atmosphere', description: '绿植融合、公园化' },
  { id: 'minimalist', label: '极简清水混凝土', value: 'Minimalist brutalist style, exposed raw concrete (béton brut), clean geometric lines, soft daylight, high-end architectural gallery feel', description: '素雅、几何感、高级灰' },
  { id: 'red-brick', label: '复古红砖工业风', value: 'Renovated industrial heritage style, red brick textures combined with black steel structures, warm tone, adaptive reuse aesthetic', description: '红砖、黑钢、历史感' },
];
