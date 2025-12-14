import React, { useState } from 'react';
import { Download, Maximize2, X } from 'lucide-react';

interface ResultViewerProps {
  originalUrl: string;
  generatedUrl: string;
  onReset: () => void;
}

const ResultViewer: React.FC<ResultViewerProps> = ({ originalUrl, generatedUrl, onReset }) => {
  const [activeTab, setActiveTab] = useState<'compare' | 'result' | 'original'>('compare');
  const [isFullScreen, setIsFullScreen] = useState(false);

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = generatedUrl;
    link.download = `realvision-render-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Overlay for full screen
  if (isFullScreen) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
        onClick={toggleFullScreen}
      >
        <button onClick={toggleFullScreen} className="absolute top-4 right-4 text-white hover:text-blue-400 p-2 transition-colors z-50">
          <X size={32} />
        </button>
        <img 
          src={generatedUrl} 
          alt="Full Screen Generated" 
          className="max-w-full max-h-full object-contain rounded-md shadow-2xl cursor-default" 
          onClick={(e) => e.stopPropagation()} 
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'compare' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            对比视图
          </button>
          <button
            onClick={() => setActiveTab('result')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'result' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            仅结果
          </button>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={toggleFullScreen}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="全屏查看结果"
          >
            <Maximize2 size={18} />
          </button>
          <button 
            onClick={downloadImage}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-all shadow-sm hover:shadow-blue-200"
          >
            <Download size={14} /> 下载
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative bg-slate-100 overflow-hidden">
        {activeTab === 'result' && (
          <div className="w-full h-full flex items-center justify-center p-4">
            <img 
              src={generatedUrl} 
              alt="Generated" 
              onClick={toggleFullScreen}
              className="max-w-full max-h-full object-contain shadow-lg rounded-lg cursor-zoom-in hover:shadow-xl transition-all"
              title="点击全屏查看"
            />
          </div>
        )}

        {activeTab === 'original' && (
          <div className="w-full h-full flex items-center justify-center p-4">
            <img src={originalUrl} alt="Original" className="max-w-full max-h-full object-contain shadow-lg rounded-lg grayscale opacity-90" />
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="w-full h-full flex flex-col md:flex-row">
            <div className="flex-1 h-1/2 md:h-full p-4 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col items-center justify-center relative group">
                <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm z-10">线稿/原图</span>
                <img src={originalUrl} alt="Original" className="max-w-full max-h-full object-contain shadow-md rounded" />
            </div>
            <div className="flex-1 h-1/2 md:h-full p-4 flex flex-col items-center justify-center relative group-hover:bg-slate-50 transition-colors">
                <span className="absolute top-2 left-2 bg-blue-600/80 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm z-10">AI 渲染</span>
                <img 
                  src={generatedUrl} 
                  alt="Generated" 
                  onClick={toggleFullScreen}
                  className="max-w-full max-h-full object-contain shadow-md rounded cursor-zoom-in hover:shadow-lg transition-all"
                  title="点击全屏查看"
                />
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-100 text-center">
         <button onClick={onReset} className="text-xs text-slate-400 hover:text-blue-600 underline">
            开始新的渲染任务
         </button>
      </div>
    </div>
  );
};

export default ResultViewer;