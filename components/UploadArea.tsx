import React, { useCallback } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { MAX_FILE_SIZE_MB, SUPPORTED_MIME_TYPES } from '../constants';
import { ImageData } from '../types';

interface UploadAreaProps {
  onImageSelected: (image: ImageData) => void;
  isProcessing: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onImageSelected, isProcessing }) => {
  
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
      alert("不支持的文件格式。请上传 JPG, PNG 或 WebP。");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`文件过大。请上传小于 ${MAX_FILE_SIZE_MB}MB 的图片。`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const url = URL.createObjectURL(file);
      onImageSelected({
        base64: result,
        mimeType: file.type,
        url: url
      });
    };
    reader.readAsDataURL(file);
    // Reset input
    event.target.value = '';
  }, [onImageSelected]);

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
          <p className="text-sm text-slate-500 mt-1">支持 JPG, PNG, WEBP (最大 {MAX_FILE_SIZE_MB}MB)</p>
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