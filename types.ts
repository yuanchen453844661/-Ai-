
export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ImageData {
  id: string; // Unique ID for tracking
  base64: string;
  mimeType: string;
  url: string; // Blob URL for preview
}

export interface Session {
  id: string;
  original: ImageData;
  referenceImage?: ImageData | null; // New: For Side View or additional context
  generated: string | null;
  status: AppStatus;
  prompt: string; // Per-image prompt/notes
  error?: string | null;
}

export interface RenderOption {
  id: string;
  label: string;
  value: string; // The text used in the prompt
  description?: string;
}

export interface GenerateRequest {
  image: ImageData;
  referenceImage?: ImageData | null; // New field
  prompt: string;
  renderingType: string;
  renderingStyle: string;
  isCoveredPools: boolean;
}

export interface GenerateResponse {
  imageUrl: string;
}
