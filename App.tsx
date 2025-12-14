import React, { useState } from 'react';
import { Loader2, Wand2, AlertCircle, Image as ImageIcon, ArrowRight, LayoutTemplate, Palette } from 'lucide-react';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import ResultViewer from './components/ResultViewer';
import { generateRealisticImage } from './services/geminiService';
import { AppStatus, ImageData } from './types';
import { RENDERING_TYPES, INDUSTRIAL_STYLES } from './constants';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // New state for selections
  const [selectedType, setSelectedType] = useState<string>(RENDERING_TYPES[0].value);
  const [selectedStyle, setSelectedStyle] = useState<string>(INDUSTRIAL_STYLES[0].value);

  const handleImageSelected = (image: ImageData) => {
    setOriginalImage(image);
    setGeneratedUrl(null);
    setStatus(AppStatus.IDLE);
    setErrorMsg(null);
  };

  const handleGenerate = async () => {
    if (!originalImage) return;

    setStatus(AppStatus.PROCESSING);
    setErrorMsg(null);

    try {
      const result = await generateRealisticImage({
        image: originalImage,
        prompt: prompt.trim(),
        renderingType: selectedType,
        renderingStyle: selectedStyle
      });
      setGeneratedUrl(result.imageUrl);
      setStatus(AppStatus.SUCCESS);
    } catch (error: any) {
      setStatus(AppStatus.ERROR);
      setErrorMsg(error.message || "生成过程中发生了未知错误。");
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setGeneratedUrl(null);
    setStatus(AppStatus.IDLE);
    setPrompt("");
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-700">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro Hero - Only show when no image selected */}
        {!originalImage && (
          <div className="text-center mb-10 mt-8 space-y-4 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              污水处理厂 <span className="text-blue-600">实景渲染</span> 专家
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-600">
              上传 CAD 导图或手绘线稿，选择工业风格与视角，AI 瞬间生成高质量彩平图或鸟瞰效果图。
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
          
          {/* Left Panel: Inputs */}
          <div className={`flex flex-col p-6 md:p-8 transition-all duration-500 ease-in-out ${generatedUrl ? 'md:w-1/3 border-r border-slate-100' : 'md:w-full max-w-3xl mx-auto'}`}>
            
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ImageIcon className="text-blue-500" size={20}/>
                {originalImage ? "1. 原始线稿" : "上传线稿"}
              </h2>
              {originalImage && generatedUrl && (
                 <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">已完成</span>
              )}
            </div>

            {/* Upload Area or Preview */}
            <div className={`flex-none flex flex-col transition-all duration-300 ${originalImage ? 'min-h-[200px]' : 'min-h-[300px]'}`}>
              {!originalImage ? (
                <UploadArea onImageSelected={handleImageSelected} isProcessing={status === AppStatus.PROCESSING} />
              ) : (
                <div className="relative group w-full h-[200px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                  <img src={originalImage.url} alt="Preview" className="max-w-full max-h-full object-contain p-2" />
                  
                  {status !== AppStatus.PROCESSING && (
                    <button 
                      onClick={handleReset}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-600 p-2 rounded-full shadow-sm backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                      title="移除图片"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Controls Area */}
            {originalImage && (
              <div className="mt-6 space-y-6 animate-fade-in flex-1">
                
                {/* 1. Rendering Type Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                    <LayoutTemplate size={16} className="text-blue-500" />
                    2. 选择效果图类型
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {RENDERING_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.value)}
                        disabled={status === AppStatus.PROCESSING}
                        className={`text-xs py-2 px-2 rounded-lg border transition-all truncate ${
                          selectedType === type.value
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                        }`}
                        title={type.description}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Style Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                    <Palette size={16} className="text-blue-500" />
                    3. 选择工业风格
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {INDUSTRIAL_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.value)}
                        disabled={status === AppStatus.PROCESSING}
                        className={`text-xs py-2 px-3 rounded-lg border text-left transition-all ${
                          selectedStyle === style.value
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                        }`}
                        title={style.description}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Custom Prompt */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    4. 细节补充 (可选)
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={status === AppStatus.PROCESSING}
                    placeholder="例如：生化池需要有曝气纹理，周围增加一些灌木，天空要晴朗..."
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm transition-shadow h-20"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={status === AppStatus.PROCESSING || status === AppStatus.SUCCESS && !!generatedUrl}
                  className={`w-full py-3.5 px-6 rounded-lg font-semibold text-white shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${
                    status === AppStatus.PROCESSING
                      ? 'bg-slate-400 cursor-not-allowed'
                      : status === AppStatus.SUCCESS
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700'
                  }`}
                >
                  {status === AppStatus.PROCESSING ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      渲染引擎计算中...
                    </>
                  ) : status === AppStatus.SUCCESS ? (
                     <>
                      <Wand2 size={20} />
                      渲染完成
                     </>
                  ) : (
                    <>
                      <Wand2 size={20} />
                      开始渲染
                    </>
                  )}
                </button>
                
                {status === AppStatus.SUCCESS && (
                     <button onClick={() => { setGeneratedUrl(null); setStatus(AppStatus.IDLE); }} className="w-full py-2 text-sm text-slate-500 hover:text-blue-600">
                        调整参数并重试
                     </button>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Result Display (Only visible when generated or on large screens as placeholder) */}
          {(generatedUrl || status === AppStatus.PROCESSING) && (
             <div className="flex-1 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col animate-fade-in-right">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <SparklesIcon /> 渲染结果
                  </h3>
                </div>
                
                <div className="flex-1 p-4 relative">
                  {status === AppStatus.PROCESSING ? (
                    <div className="w-full h-full rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Wand2 size={20} className="text-blue-600 animate-pulse" />
                        </div>
                      </div>
                      <p className="animate-pulse">正在构建空间材质与光影...</p>
                    </div>
                  ) : generatedUrl ? (
                    <ResultViewer 
                      originalUrl={originalImage!.url} 
                      generatedUrl={generatedUrl} 
                      onReset={handleReset} 
                    />
                  ) : null}
                </div>
             </div>
          )}
          
          {/* Placeholder for desktop when idle */}
          {!generatedUrl && status !== AppStatus.PROCESSING && originalImage && (
             <div className="hidden md:flex flex-1 bg-slate-50/50 items-center justify-center border-l border-slate-100 text-slate-300 p-8 text-center">
                <div className="max-w-xs">
                    <ArrowRight size={48} className="mx-auto mb-4 text-slate-200" />
                    <p>在左侧配置视图类型和风格，点击“开始渲染”生成效果图。</p>
                </div>
             </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} RealVision AI. Designed for Water Treatment Engineering.</p>
      </footer>
    </div>
  );
};

// Helper icon component
const SparklesIcon = () => (
    <svg 
      className="text-sky-500" 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
    >
        <path d="M12 2L14.3 9.7L22 12L14.3 14.3L12 22L9.7 14.3L2 12L9.7 9.7L12 2Z" />
    </svg>
)

export default App;