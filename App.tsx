
import React, { useState, useEffect } from 'react';
import { Loader2, Wand2, AlertCircle, Image as ImageIcon, LayoutTemplate, Palette, CheckSquare, RefreshCw, Layers, X, Plus, ImagePlus, Trash2 } from 'lucide-react';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import ResultViewer from './components/ResultViewer';
import { generateRealisticImage } from './services/geminiService';
import { AppStatus, ImageData, Session } from './types';
import { RENDERING_TYPES, INDUSTRIAL_STYLES, SUPPORTED_MIME_TYPES, MAX_FILE_SIZE_MB } from './constants';

const App: React.FC = () => {
  // Global Settings
  const [selectedType, setSelectedType] = useState<string>(RENDERING_TYPES[0].value);
  const [selectedStyle, setSelectedStyle] = useState<string>(INDUSTRIAL_STYLES[0].value);
  const [isCoveredPools, setIsCoveredPools] = useState<boolean>(false);

  // Session State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  // UI State for Clear Confirmation
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState<boolean>(false);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  // Helper to determine if we are in "Eye Level" mode which supports 2 images
  const isEyeLevelMode = selectedType === RENDERING_TYPES.find(t => t.id === 'eye-level')?.value;

  const handleImagesSelected = (newImages: ImageData[]) => {
    const newSessions: Session[] = newImages.map(img => ({
      id: img.id,
      original: img,
      referenceImage: null,
      generated: null,
      status: AppStatus.IDLE,
      prompt: "",
      error: null
    }));

    setSessions(prev => [...prev, ...newSessions]);
    
    if (!activeSessionId && newSessions.length > 0) {
      setActiveSessionId(newSessions[0].id);
    } else if (newSessions.length > 0 && sessions.length === 0) {
       setActiveSessionId(newSessions[0].id);
    }
  };

  const handleRemoveSession = (e: React.MouseEvent, idToRemove: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== idToRemove);
    setSessions(newSessions);

    if (activeSessionId === idToRemove) {
      setActiveSessionId(newSessions.length > 0 ? newSessions[newSessions.length - 1].id : null);
    }
    
    // Reset clear confirm if list becomes empty
    if (newSessions.length === 0) {
        setIsClearConfirmOpen(false);
    }
  };

  const updateActiveSession = (updates: Partial<Session>) => {
    if (!activeSessionId) return;
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, ...updates } : s));
  };

  const handlePromptChange = (val: string) => {
    updateActiveSession({ prompt: val });
  };

  // Handler for uploading the secondary reference image (Side View)
  const handleReferenceImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeSessionId) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`文件过大，请上传小于 ${MAX_FILE_SIZE_MB}MB 的图片`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const refImage: ImageData = {
        id: "ref_" + Date.now(),
        base64: result,
        mimeType: file.type,
        url: URL.createObjectURL(file)
      };
      updateActiveSession({ referenceImage: refImage });
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // Reset
  };

  const handleRemoveReferenceImage = () => {
    updateActiveSession({ referenceImage: null });
  };

  const handleGenerate = async () => {
    if (!activeSession) return;

    // Determine source image (Original or Refinement)
    let sourceImage = activeSession.original;
    
    if (activeSession.status === AppStatus.SUCCESS && activeSession.generated) {
      const mimeType = activeSession.generated.split(';')[0].split(':')[1] || 'image/png';
      sourceImage = {
        id: activeSession.id + '_refine', // temp id
        base64: activeSession.generated,
        mimeType: mimeType,
        url: activeSession.generated
      };
    }

    updateActiveSession({ status: AppStatus.PROCESSING, error: null });

    try {
      const result = await generateRealisticImage({
        image: sourceImage,
        referenceImage: isEyeLevelMode ? activeSession.referenceImage : null, // Only send ref image in supported modes
        prompt: activeSession.prompt.trim(),
        renderingType: selectedType,
        renderingStyle: selectedStyle,
        isCoveredPools,
      });
      updateActiveSession({ 
        generated: result.imageUrl, 
        status: AppStatus.SUCCESS 
      });
    } catch (error: any) {
      updateActiveSession({ 
        status: AppStatus.ERROR, 
        error: error.message || "生成过程中发生了未知错误。" 
      });
    }
  };

  const handleDiscardResult = () => {
    updateActiveSession({ 
      generated: null, 
      status: AppStatus.IDLE, 
      error: null 
    });
  };

  const handleResetActive = () => {
      handleDiscardResult();
  };

  // New inline clear handlers
  const handleTriggerClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsClearConfirmOpen(true);
  };

  const handleConfirmClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSessionId(null);
    setSessions([]);
    setIsClearConfirmOpen(false);
  };

  const handleCancelClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsClearConfirmOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-700">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro Hero - Only show when no images */}
        {sessions.length === 0 && (
          <div className="text-center mb-10 mt-8 space-y-4 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              污水处理厂 <span className="text-blue-600">实景渲染</span> 专家
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-600">
              支持批量上传。上传 CAD 导图或手绘线稿，选择工业风格与视角，AI 瞬间生成高质量效果图。
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
          
          {/* Left Panel: Inputs */}
          <div className={`flex flex-col p-6 md:p-8 transition-all duration-500 ease-in-out ${sessions.length > 0 && activeSession?.generated ? 'md:w-1/3 border-r border-slate-100' : 'md:w-full max-w-3xl mx-auto'}`}>
            
            {/* 1. Image List / Upload Area */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                 <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <ImageIcon className="text-blue-500" size={20}/>
                    {sessions.length > 0 ? "1. 主视图列表 (正视图)" : "上传正视图/线稿"}
                 </h2>
                 {sessions.length > 0 && (
                    isClearConfirmOpen ? (
                        <div className="flex items-center gap-2 bg-red-50 px-2 py-1 rounded border border-red-100 animate-in fade-in zoom-in duration-200">
                            <span className="text-xs text-red-600 font-medium">确定清空?</span>
                            <button 
                              onClick={handleConfirmClear}
                              className="text-xs bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600 transition-colors shadow-sm"
                            >
                              是
                            </button>
                            <button 
                              onClick={handleCancelClear}
                              className="text-xs text-slate-500 hover:text-slate-700 px-1"
                            >
                              否
                            </button>
                        </div>
                    ) : (
                        <button 
                          type="button"
                          onClick={handleTriggerClear} 
                          className="text-xs text-red-500 hover:text-red-700 hover:underline px-2 py-1 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
                        >
                            <Trash2 size={12} />
                            清空列表
                        </button>
                    )
                 )}
              </div>

              {sessions.length === 0 ? (
                <UploadArea onImagesSelected={handleImagesSelected} isProcessing={false} />
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                  {sessions.map((session) => (
                    <div 
                        key={session.id}
                        onClick={() => setActiveSessionId(session.id)}
                        className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                            activeSessionId === session.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-300'
                        }`}
                    >
                        <img src={session.original.url} alt="thumbnail" className="w-full h-full object-cover" />
                        
                        {/* Status Indicators */}
                        {session.status === AppStatus.SUCCESS && (
                            <div className="absolute bottom-0 right-0 p-0.5 bg-green-500 rounded-tl-md">
                                <CheckSquare size={10} className="text-white" />
                            </div>
                        )}
                        {session.status === AppStatus.PROCESSING && (
                            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                                <Loader2 size={16} className="animate-spin text-blue-600" />
                            </div>
                        )}

                        {/* Remove Button */}
                        <button 
                            type="button"
                            onClick={(e) => handleRemoveSession(e, session.id)}
                            className="absolute top-0 right-0 bg-slate-900/50 hover:bg-red-500 text-white p-0.5 rounded-bl-md opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={12} />
                        </button>
                    </div>
                  ))}
                  {/* Mini Upload Button */}
                  <UploadArea onImagesSelected={handleImagesSelected} isProcessing={false} compact />
                </div>
              )}
            </div>

            {/* Controls Area - Only show if we have an active session */}
            {activeSession && (
              <div className="space-y-6 animate-fade-in flex-1">
                
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
                        type="button"
                        onClick={() => setSelectedType(type.value)}
                        disabled={activeSession.status === AppStatus.PROCESSING}
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

                  {/* Dynamic Section: Side View Uploader - ONLY for Eye Level */}
                  {isEyeLevelMode && activeSession.status !== AppStatus.PROCESSING && (
                    <div className="mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100 animate-fade-in">
                       <label className="flex items-center justify-between text-xs font-semibold text-blue-800 mb-2">
                          <span className="flex items-center gap-1"><ImagePlus size={14}/> 补充侧视图 (可选)</span>
                          {activeSession.referenceImage && (
                            <button onClick={handleRemoveReferenceImage} className="text-red-500 hover:underline">移除</button>
                          )}
                       </label>
                       
                       {!activeSession.referenceImage ? (
                         <div className="relative group flex items-center justify-center border-2 border-dashed border-blue-200 rounded-md bg-white hover:bg-blue-50 h-16 cursor-pointer transition-colors">
                            <input 
                              type="file" 
                              accept={SUPPORTED_MIME_TYPES.join(',')}
                              onChange={handleReferenceImageUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <span className="text-xs text-blue-400 group-hover:text-blue-600 flex items-center gap-1">
                              <Plus size={14} /> 点击上传侧视图以辅助生成
                            </span>
                         </div>
                       ) : (
                         <div className="flex items-center gap-3 bg-white p-2 rounded border border-blue-200">
                            <img src={activeSession.referenceImage.url} alt="Ref" className="w-10 h-10 object-cover rounded bg-slate-100" />
                            <div className="flex-1 min-w-0">
                               <p className="text-xs font-medium text-slate-700 truncate">侧视图已上传</p>
                               <p className="text-[10px] text-slate-400">将结合主视图共同生成</p>
                            </div>
                         </div>
                       )}
                    </div>
                  )}
                </div>

                {/* 2. Style Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                     <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <Palette size={16} className="text-blue-500" />
                      3. 选择工业风格
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={isCoveredPools}
                        onChange={(e) => setIsCoveredPools(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`text-xs font-medium transition-colors ${isCoveredPools ? 'text-blue-700' : 'text-slate-500 group-hover:text-blue-600'}`}>
                        池体加盖
                      </span>
                    </label>
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
                        title={style.description}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Custom Prompt (Bound to Active Session) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    4. 细节补充 {activeSession.status === AppStatus.SUCCESS ? "(优化当前图片)" : "(可选)"}
                  </label>
                  <textarea
                    value={activeSession.prompt}
                    onChange={(e) => handlePromptChange(e.target.value)}
                    disabled={activeSession.status === AppStatus.PROCESSING}
                    placeholder={activeSession.status === AppStatus.SUCCESS ? "例如：增加一些树木，把屋顶改成深色..." : "例如：周围增加一些灌木，天空要晴朗..."}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm transition-shadow h-16"
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
                  className={`w-full py-3.5 px-6 rounded-lg font-semibold text-white shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${
                    activeSession.status === AppStatus.PROCESSING
                      ? 'bg-slate-400 cursor-not-allowed'
                      : activeSession.status === AppStatus.SUCCESS
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700'
                  }`}
                >
                  {activeSession.status === AppStatus.PROCESSING ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {activeSession.generated ? "正在优化..." : "渲染引擎计算中..."}
                    </>
                  ) : activeSession.status === AppStatus.SUCCESS ? (
                     <>
                      <Layers size={20} />
                      基于当前结果优化生成
                     </>
                  ) : (
                    <>
                      <Wand2 size={20} />
                      {isEyeLevelMode && activeSession.referenceImage ? "融合双图并渲染" : "开始渲染"}
                    </>
                  )}
                </button>
                
                {activeSession.status === AppStatus.SUCCESS && (
                     <button 
                       type="button"
                       onClick={handleDiscardResult} 
                       className="w-full py-2 text-sm text-slate-500 hover:text-red-600 flex items-center justify-center gap-1 transition-colors"
                     >
                        <RefreshCw size={14} />
                        不满意，放弃当前结果并重置
                     </button>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Result Display */}
          {(sessions.length > 0) && (
             <div className="flex-1 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col animate-fade-in-right">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <CheckSquare size={18} className="text-blue-500" /> 
                    {activeSession?.status === AppStatus.SUCCESS ? "渲染结果 (可继续优化)" : "渲染结果"}
                  </h3>
                </div>
                
                <div className="flex-1 p-4 relative">
                  {!activeSession ? (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                          请在左侧选择一张图片开始
                      </div>
                  ) : activeSession.status === AppStatus.PROCESSING ? (
                    <div className="w-full h-full rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Wand2 size={20} className="text-blue-600 animate-pulse" />
                        </div>
                      </div>
                      <p className="animate-pulse">
                          {activeSession.generated ? "正在根据指令细化..." : (isEyeLevelMode && activeSession.referenceImage ? "正在融合双视角信息..." : "正在构建空间材质与光影...")}
                      </p>
                    </div>
                  ) : activeSession.generated ? (
                    <ResultViewer 
                      originalUrl={activeSession.original.url} 
                      generatedUrl={activeSession.generated} 
                      onReset={handleResetActive} 
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-slate-100/50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <div className="flex gap-4 mb-2">
                            <img src={activeSession.original.url} className="w-32 h-32 object-contain opacity-80 shadow-sm bg-white rounded border p-1" alt="Front" />
                            {activeSession.referenceImage && (
                                <img src={activeSession.referenceImage.url} className="w-32 h-32 object-contain opacity-80 shadow-sm bg-white rounded border p-1" alt="Side" />
                            )}
                        </div>
                        <p>准备就绪，请点击“{isEyeLevelMode && activeSession.referenceImage ? "融合双图并渲染" : "开始渲染"}”</p>
                    </div>
                  )}
                </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
