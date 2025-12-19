
import React, { useCallback } from 'react';
import { UploadCloud, Image as ImageIcon, FileText } from 'lucide-react';
import { MAX_FILE_SIZE_MB, SUPPORTED_MIME_TYPES } from '../constants';
import { ImageData } from '../types';

// Extend Window interface for PDF.js
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

interface UploadAreaProps {
  onImagesSelected: (images: ImageData[]) => void;
  isProcessing: boolean;
  compact?: boolean; 
}

const UploadArea: React.FC<UploadAreaProps> = ({ onImagesSelected, isProcessing, compact = false }) => {
  
  const convertPdfToImage = async (file: File): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        // Get the first page
        const page = await pdf.getPage(1);
        
        // Use a high scale for better quality (2.0 is usually good for AI analysis)
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error("Canvas context could not be created");
        }
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        // Convert to PNG as it preserves detail better than JPEG for drawings
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        console.error("PDF Conversion Error:", error);
        reject(error);
      }
    });
  };

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files) as File[];
    
    const imagePromises = fileList.map(async (file) => {
      // Validation
      if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
        alert(`文件 "${file.name}" 格式不支持。请上传图片或 PDF。`);
        return null;
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(`文件 "${file.name}" 过大。请上传小于 ${MAX_FILE_SIZE_MB}MB 的图片。`);
        return null;
      }

      try {
        let base64: string;
        let mimeType: string = file.type;

        if (file.type === 'application/pdf') {
          // If it's a PDF, convert it to an image first
          base64 = await convertPdfToImage(file);
          mimeType = 'image/png'; // It's now a PNG internally
        } else {
          // Normal image processing
          base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }

        return {
          id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
          base64: base64,
          mimeType: mimeType,
          url: base64 // Use the base64/converted URL for preview
        };
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        return null;
      }
    });

    try {
      const results = await Promise.all(imagePromises);
      const validImages = results.filter((img): img is ImageData => img !== null);
      
      if (validImages.length > 0) {
        onImagesSelected(validImages);
      }
    } catch (error) {
      console.error("Upload processing error:", error);
    }

    event.target.value = '';
  }, [onImagesSelected]);

  if (compact) {
    return (
      <div className="relative group w-16 h-16 shrink-0 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer" title="替换图片">
        <input
          type="file"
          accept={SUPPORTED_MIME_TYPES.join(',')}
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
          <p className="text-sm text-slate-500 mt-1">支持 JPG, PNG, WEBP, PDF (最大 {MAX_FILE_SIZE_MB}MB)</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          <div className="flex items-center gap-1 text-xs text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
            <ImageIcon size={12} /> CAD导图
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
            <ImageIcon size={12} /> 手绘草图
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
            <FileText size={12} className="text-blue-500" /> PDF 图纸
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadArea;
