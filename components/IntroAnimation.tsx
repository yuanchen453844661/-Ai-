
import React, { useEffect, useState } from 'react';
import { Camera, Droplets, Hexagon, Zap } from 'lucide-react';
import { APP_NAME } from '../constants';

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);

  useEffect(() => {
    // Sequence timing
    const subtitleTimer = setTimeout(() => setShowSubtitle(true), 800);
    const exitTimer = setTimeout(() => setIsExiting(true), 3500); // Start fade out
    const completeTimer = setTimeout(() => onComplete(), 4200); // Fully unmount

    return () => {
      clearTimeout(subtitleTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden transition-opacity duration-700 ease-in-out ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Background Tech Effects */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_50%_200px,#3b82f633,transparent)]"></div>
      </div>

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center text-center px-4 relative">
        
        {/* Animated Icon Container */}
        <div className="relative mb-8 animate-in fade-in zoom-in duration-1000">
          <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-30 animate-pulse rounded-full"></div>
          <div className="relative bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.5)]">
            <div className="relative">
               <Camera size={64} className="text-blue-400 relative z-10" />
               <Zap size={24} className="text-cyan-300 absolute -top-2 -right-2 animate-bounce" />
            </div>
            
            {/* Tech decorative corners */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-blue-500 rounded-tl"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-blue-500 rounded-tr"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-blue-500 rounded-bl"></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-blue-500 rounded-br"></div>
          </div>
        </div>

        {/* Title with Glitch/Reveal effect */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-300 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-white to-cyan-300 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
          {APP_NAME}
        </h1>

        {/* Separator Line */}
        <div className={`h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent w-0 transition-all duration-1000 ease-out mb-6 ${showSubtitle ? 'w-full max-w-md opacity-100' : 'opacity-0'}`}></div>

        {/* Producer Info */}
        <div className={`transform transition-all duration-1000 ${showSubtitle ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="flex items-center justify-center gap-3 text-slate-300 bg-slate-900/50 px-6 py-2 rounded-full border border-slate-800 backdrop-blur-md">
            <Droplets size={18} className="text-cyan-400" />
            <span className="text-sm md:text-lg font-light tracking-widest text-cyan-50">
              制作人：生态与水环境治理部
            </span>
          </div>
        </div>
      </div>
      
      {/* Loading Bar at bottom */}
      <div className="absolute bottom-10 w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 animate-[width_3s_ease-out_forwards] w-0"></div>
      </div>

    </div>
  );
};

export default IntroAnimation;
