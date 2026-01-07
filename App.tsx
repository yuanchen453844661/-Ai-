
import React, { useState, useEffect } from 'react';
import { Loader2, Wand2, AlertCircle, Image as ImageIcon, LayoutTemplate, Palette, CheckSquare, RefreshCw, Layers, X, Plus, ImagePlus, Trash2, Maximize2, Moon, Stars, Key, ExternalLink, Home, Droplets } from 'lucide-react';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import ResultViewer from './components/ResultViewer';
import IntroAnimation from './components/IntroAnimation';
import DrawingAnimation from './components/DrawingAnimation';
import { generateRealisticImage } from './services/geminiService';
import { AppStatus, ImageData, Session } from './types';
import { RENDERING_TYPES, INDUSTRIAL_STYLES, SUPPORTED_MIME_TYPES, MAX_FILE_SIZE_MB } from './constants';

const App: React.FC = () => {
  // API Key Selection State (Mandatory for Gemini 3 Pro)
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  
  // Intro Animation State
  const [showIntro, setShowIntro] = useState(true);

  // Global Settings
  const [selectedType, setSelectedType] = useState<string>(RENDERING_TYPES[0].value);
  const [selectedStyle, setSelectedStyle] = useState<string>(INDUSTRIAL_STYLES[0].value);
  const [isCoveredPools, setIsCoveredPools] = useState<boolean>(false);
  const [isDuskMode, setIsDuskMode] = useState<boolean>(false);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);

  // Session State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  // Zoom State
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      await (window as any).aistudio.openSelectKey();
      setHasKey(true);
    } catch (err) {
      console.error("Key selection failed", err);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  const handleImagesSelected = (newImages: ImageData[]) => {
    if (newImages.length === 0) return;
    const img = newImages[0];
    const newSession: Session = {
      id: img.id,
      original: img,
      referenceImage: null,
      generated: null,
      status: AppStatus.IDLE,
      prompt: "",
      error: null
    };
    setSessions([newSession]);
    setActiveSessionId(newSession.id);
  };

  const handleRemoveSession = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm && !window.confirm("确定要移除并替换当前图片吗？")) return;
    setSessions([]);
    setActiveSessionId(null);
  };

  const updateActiveSession = (updates: Partial<Session>) => {
    if (!activeSessionId) return;
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, ...updates } : s));
  };

  const handlePromptChange = (val: string) => {
    updateActiveSession({ prompt: val });
  };

  const handleDuskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsDuskMode(checked);
    if (checked) setIsNightMode(false);
  };

  const handleNightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsNightMode(checked);
    if (checked) setIsDuskMode(false);
  };

  const handleGenerate = async () => {
    if (!activeSession) return;

    updateActiveSession({ status: AppStatus.PROCESSING, error: null });

    try {
      const result = await generateRealisticImage({
        image: activeSession.original,
        referenceImage: null, 
        prompt: activeSession.prompt.trim(),
        renderingType: selectedType,
        renderingStyle: selectedStyle,
        isCoveredPools,
        isDuskMode,
        isNightMode,
      });
      updateActiveSession({ 
        generated: result.imageUrl, 
        status: AppStatus.SUCCESS 
      });
    } catch (error: any) {
      const msg = error.message || "";
      if (msg.includes("Requested entity was not found")) {
        setHasKey(false);
        updateActiveSession({ 
          status: AppStatus.ERROR, 
          error: "API Key 校验失败，请重新选择有效的付费项目 Key。" 
        });
      } else {
        updateActiveSession({ 
          status: AppStatus.ERROR, 
          error: error.message || "生成过程中发生了未知错误。" 
        });
      }
    }
  };

  const handleDiscardResult = () => {
    updateActiveSession({ 
      generated: null, 
      status: AppStatus.IDLE, 
      error: null 
    });
  };

  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto text-blue-400">
            <Key size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">需要选择 API Key</h1>
            <p className="text-slate-400 text-sm">
              当前应用使用的是 <strong>Gemini 3 Pro (Banana Pro)</strong> 模型，
              请选择一个来自已开启计费的 GCP 项目的 API Key 才能继续使用。
            </p>
          </div>
          <button 
            onClick={handleSelectKey}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
          >
            <Key size={18} />
            立即选择 API Key
          </button>
          <div className="pt-4 border-t border-slate-700">
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-blue-400 flex items-center justify-center gap-1 transition-colors"
            >
              查看计费说明文档 <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-700">
      {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
      <Header />

      {zoomedImageUrl && (
        <div 
            className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-zoom-out"
            onClick={() => setZoomedImageUrl(null)}
        >
            <img 
              src={zoomedImageUrl} 
              alt="Zoomed" 
              className="max-w-full max-h-full object-contain shadow-2xl rounded-sm cursor-default" 
              onClick={(e) => e.stopPropagation()} 
            />
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sessions.length === 0 && (
          <div className="text-center mb-10 mt-8 space-y-4 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              人居环境与工业 <span className="text-blue-600">Pro 级渲染</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-600">
              上传图纸或标记稿，AI 瞬间转化为温馨乡村风格、现代工业实景或生态修复效果。
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
          <div className={`flex flex-col p-6 md:p-8 transition-all duration-500 ease-in-out ${sessions.length > 0 && activeSession?.generated ? 'md:w-1/3 border-r border-slate-100' : 'md:w-full max-w-3xl mx-auto'}`}>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                 <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <ImageIcon className="text-blue-500" size={20}/>
                    {sessions.length > 0 ? "1. 当前图纸" : "上传图纸/标记稿"}
                 </h2>
              </div>

              {sessions.length === 0 ? (
                <UploadArea onImagesSelected={handleImagesSelected} isProcessing={false} />
              ) : (
                <div className="relative w-full rounded-xl overflow-hidden border-2 border-slate-100 bg-slate-50 group">
                    <div 
                      className="relative h-64 w-full cursor-zoom-in bg-slate-100/50 flex items-center justify-center"
                      onClick={() => setZoomedImageUrl(activeSession?.original.url || null)}
                    >
                       <img src={activeSession?.original.url} alt="Original" className="max-h-full max-w-full object-contain" />
                    </div>
                    {activeSession?.status !== AppStatus.PROCESSING && (
                      <button 
                        onClick={handleRemoveSession}
                        className="absolute top-2 right-2 p-2 bg-white/90 text-red-500 hover:text-white hover:bg-red-500 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 z-20"
                        title="删除并替换图片"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    {activeSession?.status === AppStatus.PROCESSING && (
                       <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-50">
                          <Loader2 size={32} className="text-blue-500 animate-spin mb-2" />
                          <p className="text-sm font-bold text-slate-700">Pro 引擎渲染中...</p>
                       </div>
                    )}
                </div>
              )}
            </div>

            {activeSession && (
              <div className="space-y-6 animate-fade-in flex-1">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                    <LayoutTemplate size={16} className="text-blue-500" />
                    2. 选择改造/渲染类型
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {RENDERING_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedType(type.value)}
                        disabled={activeSession.status === AppStatus.PROCESSING}
                        className={`text-xs py-2 px-2 rounded-lg border transition-all truncate flex items-center justify-center gap-1 ${
                          selectedType === type.value
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                        }`}
                      >
                        {type.id === 'residential-renovation' && <Home size={12} />}
                        {type.id === 'ecological-restoration' && <Droplets size={12} />}
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex flex-col gap-2 mb-2">
                     <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <Palette size={16} className="text-blue-500" />
                      3. 环境氛围配置
                    </label>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" checked={isDuskMode} onChange={handleDuskChange} className="w-4 h-4 rounded text-purple-600" />
                          <span className={`text-xs font-medium flex items-center gap-1 transition-colors ${isDuskMode ? 'text-purple-700' : 'text-slate-500'}`}>
                            <Moon size={12} /> 黄昏
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" checked={isNightMode} onChange={handleNightChange} className="w-4 h-4 rounded text-indigo-800" />
                          <span className={`text-xs font-medium flex items-center gap-1 transition-colors ${isNightMode ? 'text-indigo-800' : 'text-slate-500'}`}>
                            <Stars size={12} /> 夜景
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" checked={isCoveredPools} onChange={(e) => setIsCoveredPools(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                          <span className={`text-xs font-medium transition-colors ${isCoveredPools ? 'text-blue-700' : 'text-slate-500'}`}>
                            池体加盖
                          </span>
                        </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {INDUSTRIAL_STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setSelectedStyle(style.value)}
                        disabled={activeSession.status === AppStatus.PROCESSING}
                        className={`text-xs py-2 px-3 rounded-lg border text-left transition-all ${
                          selectedStyle === style.value
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    4. 细节补充 {activeSession.status === AppStatus.SUCCESS ? "(优化当前图片)" : "(可选)"}
                  </label>
                  <textarea
                    value={activeSession.prompt}
                    onChange={(e) => handlePromptChange(e.target.value)}
                    disabled={activeSession.status === AppStatus.PROCESSING}
                    placeholder={activeSession.status === AppStatus.SUCCESS ? "例如：增加门前绿化，调整天空颜色..." : "例如：增加彩绘细节，调整色调..."}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm transition-shadow h-16"
                  />
                </div>

                {activeSession.error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{activeSession.error}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={activeSession.status === AppStatus.PROCESSING}
                  className={`w-full py-3.5 px-6 rounded-lg font-semibold text-white shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${
                    activeSession.status === AppStatus.PROCESSING
                      ? 'bg-slate-400 cursor-not-allowed'
                      : activeSession.status === AppStatus.SUCCESS
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-blue-200'
                  }`}
                >
                  {activeSession.status === AppStatus.PROCESSING ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Pro 引擎渲染中...
                    </>
                  ) : activeSession.status === AppStatus.SUCCESS ? (
                     <>
                      <Layers size={20} />
                      基于当前结果优化
                     </>
                  ) : (
                    <>
                      <Wand2 size={20} />
                      开始 Pro 渲染
                    </>
                  )}
                </button>
                
                {activeSession.status === AppStatus.SUCCESS && (
                     <button type="button" onClick={handleDiscardResult} className="w-full py-2 text-sm text-slate-500 hover:text-red-600 flex items-center justify-center gap-1 transition-colors">
                        <RefreshCw size={14} /> 放弃当前并重置
                     </button>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col animate-fade-in-right">
             <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <CheckSquare size={18} className="text-blue-500" /> 渲染画布 (Pro)
                </h3>
             </div>
             
             <div className="flex-1 p-4 relative">
               {!activeSession ? (
                   <div className="w-full h-full flex items-center justify-center text-slate-400">
                       请上传一张图片开始
                   </div>
               ) : activeSession.status === AppStatus.PROCESSING ? (
                 <div className="w-full h-full rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center overflow-hidden">
                    <DrawingAnimation />
                 </div>
               ) : activeSession.generated ? (
                 <ResultViewer 
                   originalUrl={activeSession.original.url} 
                   generatedUrl={activeSession.generated} 
                   onReset={() => { setSessions([]); setActiveSessionId(null); }} 
                 />
               ) : (
                 <div className="w-full h-full rounded-xl bg-slate-100/50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2">
                     <p>图纸已加载，请配置参数后点击渲染按钮</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
