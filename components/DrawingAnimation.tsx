
import React from 'react';

const DrawingAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 w-full h-full min-h-[300px]">
      <style>{`
        @keyframes drawStroke {
          0% { transform: translate(0, 0); }
          25% { transform: translate(4px, -3px); }
          50% { transform: translate(8px, 0); }
          75% { transform: translate(4px, 3px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes revealLine {
          0% { stroke-dashoffset: 60; opacity: 0; }
          20% { opacity: 0.6; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes headFocus {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          50% { transform: rotate(1.5deg) translateY(1px); }
        }
        @keyframes slideRuler {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-3px); }
        }
        .animate-hand-draw {
          animation: drawStroke 1.2s infinite ease-in-out;
        }
        .animate-line-1 {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: revealLine 2s infinite ease-out;
        }
        .animate-line-2 {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: revealLine 2s infinite ease-out 0.6s;
        }
        .animate-line-3 {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: revealLine 2s infinite ease-out 1.2s;
        }
        .animate-head-focus {
          animation: headFocus 3s infinite ease-in-out;
          transform-origin: 90px 75px;
        }
        .animate-ruler {
          animation: slideRuler 2.5s infinite ease-in-out;
        }
      `}</style>
      
      <div className="relative w-64 h-64 md:w-80 md:h-80">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
          
          {/* Desk Surface - Engineering Grey */}
          <path d="M15 145 L185 145 L195 185 L5 185 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
          
          {/* Engineering Paper */}
          <rect x="35" y="135" width="130" height="40" fill="#ffffff" stroke="#cbd5e1" transform="skewX(-8)" />
          
          {/* Engineering Lines on paper */}
          <g transform="translate(40, 140) skewX(-8)">
             <line x1="10" y1="5" x2="120" y2="5" stroke="#f1f5f9" strokeWidth="1" />
             <line x1="10" y1="15" x2="120" y2="15" stroke="#f1f5f9" strokeWidth="1" />
             <line x1="10" y1="25" x2="120" y2="25" stroke="#f1f5f9" strokeWidth="1" />
             
             <path d="M15 10 L50 10 L50 25" stroke="#64748b" strokeWidth="1.5" fill="none" className="animate-line-1" />
             <circle cx="85" cy="18" r="8" stroke="#64748b" strokeWidth="1.5" fill="none" className="animate-line-2" />
             <path d="M105 25 L125 5" stroke="#64748b" strokeWidth="1.5" fill="none" className="animate-line-3" />
          </g>

          {/* Stick Figure Engineer - Grayscale */}
          <g>
            {/* Body */}
            <line x1="100" y1="145" x2="90" y2="95" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
            
            {/* Head Group */}
            <g className="animate-head-focus">
                <circle cx="90" cy="78" r="18" fill="#f8fafc" stroke="#334155" strokeWidth="3" />
                <g transform="translate(80, 75)">
                  <circle cx="0" cy="0" r="5" fill="#fff" stroke="#1e293b" strokeWidth="2" />
                  <circle cx="15" cy="0" r="5" fill="#fff" stroke="#1e293b" strokeWidth="2" />
                  <line x1="5" y1="0" x2="10" y2="0" stroke="#1e293b" strokeWidth="2" />
                </g>
            </g>

            {/* Left Arm & Triangle Ruler */}
            <path d="M90 105 L65 135" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            <path d="M55 140 L95 140 L55 110 Z" fill="#94a3b8" stroke="#64748b" strokeWidth="1" opacity="0.7" className="animate-ruler" />

            {/* Right Arm & Engineering Pen */}
            <g>
               <path d="M90 105 L115 125" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
               <g className="animate-hand-draw">
                  <line x1="115" y1="125" x2="132" y2="142" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                  {/* The Pen */}
                  <line x1="132" y1="142" x2="128" y2="152" stroke="#000" strokeWidth="2" />
               </g>
            </g>
          </g>

        </svg>
      </div>
      
      <div className="text-center space-y-1 mt-3">
        <h3 className="text-lg font-bold text-slate-600 animate-pulse">
            图纸精密绘制中...
        </h3>
        <p className="text-xs text-slate-400 font-medium">
            正在分析线稿几何结构并构建 3D 环境
        </p>
      </div>
    </div>
  );
};

export default DrawingAnimation;
