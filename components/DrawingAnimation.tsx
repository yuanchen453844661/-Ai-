
import React from 'react';

const DrawingAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 w-full h-full min-h-[300px]">
      <style>{`
        @keyframes drawStroke {
          0% { transform: translate(0, 0); }
          25% { transform: translate(5px, -5px); }
          50% { transform: translate(10px, 0); }
          75% { transform: translate(5px, 5px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes revealLine {
          0% { stroke-dashoffset: 60; opacity: 0; }
          20% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes headFocus {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          50% { transform: rotate(2deg) translateY(1px); }
        }
        @keyframes slideRuler {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-2px); }
        }
        .animate-hand-draw {
          animation: drawStroke 1.5s infinite linear;
        }
        .animate-line-1 {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: revealLine 2s infinite ease-out;
        }
        .animate-line-2 {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: revealLine 2s infinite ease-out 0.8s;
        }
        .animate-line-3 {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: revealLine 2s infinite ease-out 1.5s;
        }
        .animate-head-focus {
          animation: headFocus 3s infinite ease-in-out;
          transform-origin: 90px 70px;
        }
        .animate-ruler {
          animation: slideRuler 3s infinite ease-in-out;
        }
      `}</style>
      
      <div className="relative w-64 h-64 md:w-80 md:h-80">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
          
          {/* Desk Surface (Angled Drafting Table) */}
          <path d="M20 140 L180 140 L190 180 L10 180 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
          <path d="M10 180 L10 195 L25 195" fill="none" stroke="#94a3b8" strokeWidth="2" /> {/* Leg hint */}
          <path d="M190 180 L190 195 L175 195" fill="none" stroke="#94a3b8" strokeWidth="2" /> {/* Leg hint */}

          {/* Large Blueprint Paper */}
          <rect x="30" y="130" width="140" height="40" fill="#f8fafc" stroke="#e2e8f0" transform="skewX(-10)" />
          
          {/* Engineering Lines appearing on paper */}
          <g transform="translate(35, 135) skewX(-10)">
             {/* Grid lines (static) */}
             <line x1="0" y1="10" x2="140" y2="10" stroke="#e2e8f0" strokeWidth="1" />
             <line x1="0" y1="20" x2="140" y2="20" stroke="#e2e8f0" strokeWidth="1" />
             <line x1="0" y1="30" x2="140" y2="30" stroke="#e2e8f0" strokeWidth="1" />
             
             {/* Animated Drawing Lines (Geometric) */}
             <path d="M20 10 L60 10 L60 30" stroke="#475569" strokeWidth="2" fill="none" className="animate-line-1" />
             <circle cx="90" cy="20" r="10" stroke="#475569" strokeWidth="2" fill="none" className="animate-line-2" />
             <path d="M110 30 L130 10" stroke="#475569" strokeWidth="2" fill="none" className="animate-line-3" />
          </g>

          {/* Tools on Desk */}
          {/* T-Square / Ruler */}
          <rect x="40" y="160" width="80" height="5" fill="#94a3b8" rx="1" transform="rotate(-5 40 160)" />

          {/* Stick Figure Engineer */}
          <g>
            {/* Body (Leaning forward) */}
            <line x1="100" y1="140" x2="90" y2="90" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
            
            {/* Head Group */}
            <g className="animate-head-focus">
                {/* Head */}
                <circle cx="90" cy="75" r="18" fill="#f1f5f9" stroke="#334155" strokeWidth="3" />
                
                {/* Glasses (Grey/Black, Serious look) */}
                <g transform="translate(80, 72)">
                  <circle cx="0" cy="0" r="6" fill="#fff" stroke="#1e293b" strokeWidth="2" />
                  <circle cx="14" cy="0" r="6" fill="#fff" stroke="#1e293b" strokeWidth="2" />
                  <line x1="6" y1="0" x2="8" y2="0" stroke="#1e293b" strokeWidth="2" /> {/* Bridge */}
                  <line x1="-6" y1="0" x2="-10" y2="-5" stroke="#1e293b" strokeWidth="1.5" /> {/* Temple */}
                </g>
            </g>

            {/* Left Arm (Holding the Triangle Ruler) */}
            <path d="M90 100 L70 130" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            {/* Hand pressing down */}
            <circle cx="70" cy="130" r="4" fill="#334155" />
            
            {/* Triangle Ruler (Held by left hand) */}
            <path d="M60 130 L100 130 L60 100 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1" opacity="0.8" className="animate-ruler" />

            {/* Right Arm (Drawing with Pen) */}
            <g>
               <path d="M90 100 L120 120" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
               {/* Forearm & Hand moving */}
               <g className="animate-hand-draw">
                  <line x1="120" y1="120" x2="135" y2="135" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                  {/* Pen */}
                  <line x1="135" y1="135" x2="130" y2="145" stroke="#0f172a" strokeWidth="2" />
               </g>
            </g>
          </g>

        </svg>
      </div>
      
      <div className="text-center space-y-2 mt-2">
        <h3 className="text-xl font-bold text-slate-700 animate-pulse">
            正在绘制工程图纸...
        </h3>
        <p className="text-sm text-slate-500 font-medium">
            AI 工程师正在进行精确计算与建模
        </p>
      </div>
    </div>
  );
};

export default DrawingAnimation;
