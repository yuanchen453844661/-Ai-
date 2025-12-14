export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ImageData {
  base64: string;
  mimeType: string;
  url: string; // Blob URL for preview
}

export interface RenderOption {
  id: string;
  label: string;
  value: string; // The text used in the prompt
  description?: string;
}

export interface GenerateRequest {
  image: ImageData;
  prompt: string;
  renderingType: string;
  renderingStyle: string;
}

export interface GenerateResponse {
  imageUrl: string;
}
