import React, { useCallback } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { MAX_FILE_SIZE_MB, SUPPORTED_MIME_TYPES } from '../constants';
import { ImageData } from '../types';

interface UploadAreaProps {
  onImagesSelected: (images: ImageData[]) => void;
  isProcessing: boolean;
  compact?: boolean; // New prop for compact mode
}

const UploadArea: React.FC<UploadAreaProps> = ({ onImagesSelected, isProcessing, compact = false }) => {
  
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Explicitly cast to File[] to ensure TypeScript correctly infers the type of elements
    const fileList = Array.from(files) as File[];
    
    // Process all files with Promises
    const imagePromises = fileList.map((file) => {
      return new Promise<ImageData | null>((resolve) => {
        // Validation
        if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
          alert(`文件 "${file.name}" 格式不支持。请上传 JPG, PNG 或 WebP。`);
          resolve(null);
          return;
        }

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          alert(`文件 "${file.name}" 过大。请上传小于 ${MAX_FILE_SIZE_MB}MB 的图片。`);
          resolve(null);
          return;
        }

        const reader = new FileReader();
        
        reader.onloadend = () => {
          const result = reader.result as string;
          // Create Blob URL for preview
          const url = URL.createObjectURL(file);
          
          resolve({
            id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36), // Generate unique ID
            base64: result,
            mimeType: file.type,
            url: url
          });
        };

        reader.onerror = () => {
          console.error(`Error reading file ${file.name}`);
          resolve(null);
        };

        reader.readAsDataURL(file);
      });
    });

    try {
      // Wait for all files to be processed
      const results = await Promise.all(imagePromises);
      
      // Filter out failed uploads (nulls)
      const validImages = results.filter((img): img is ImageData => img !== null);
      
      if (validImages.length > 0) {
        onImagesSelected(validImages);
      }
    } catch (error) {
      console.error("Batch upload processing error:", error);
    }

    // Reset input to allow selecting the same files again if needed
    event.target.value = '';
  }, [onImagesSelected]);

  // Compact version for the thumbnail list "Add" button
  if (compact) {
    return (
      <div className="relative group w-16 h-16 shrink-0 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer" title="添加更多图片">
        <input
          type="file"
          accept={SUPPORTED_MIME_TYPES.join(',')}
          multiple
          onChange={handleFileChange}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
        />
        <UploadCloud size={20} className="text-slate-400 group-hover:text-blue-500" />
      </div>
    );
  }

  return (
    <div className="relative group w-full h-full min-h-[250px] flex flex-col justify-center items-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-400 transition-all cursor-pointer overflow-hidden">
      <input
        type="file"
        accept={SUPPORTED_MIME_TYPES.join(',')}
        multiple // Enable multiple
        onChange={handleFileChange}
        disabled={isProcessing}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
      />
      
      <div className="flex flex-col items-center text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
          <UploadCloud size={32} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">上传总图或单体线稿</h3>
          <p className="text-sm text-slate-500 mt-1">支持批量上传 · JPG, PNG, WEBP (最大 {MAX_FILE_SIZE_MB}MB)</p>
        </div>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1 text-xs text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
            <ImageIcon size={12} /> CAD导图
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
            <ImageIcon size={12} /> 手绘草图
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadArea;