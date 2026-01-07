import React from 'react';
import { Camera, Droplets } from 'lucide-react';
import { APP_NAME } from '../constants';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-600 to-sky-500 p-2 rounded-lg text-white shadow-lg shadow-blue-200">
            <Camera size={20} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-sky-500">
            {APP_NAME}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          <Droplets size={14} className="text-sky-500" />
          <span className="hidden sm:inline">环境工程·专业渲染版</span>
        </div>
      </div>
    </header>
  );
};

export default Header;