import React from 'react';
import { 
  FileEdit, 
  FileText, 
  Sparkles, 
  FolderGit2, 
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';
import { MobileViewTab } from '../types/prompt';

interface MobileBottomNavProps {
  activeTab: MobileViewTab;
  onChangeTab: (tab: MobileViewTab) => void;
  completenessScore: number;
  conflictCount: number;
  missingHighCount: number;
  onQuickCopy: () => void;
  isCopied: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onChangeTab,
  completenessScore,
  conflictCount,
  missingHighCount,
  onQuickCopy,
  isCopied,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-[#090e1c]/95 backdrop-blur-lg border-t border-slate-800/90 z-40 px-2 py-1.5 safe-area-bottom shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Tab 1: Builder / Formulir */}
        <button
          type="button"
          onClick={() => onChangeTab('builder')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 min-w-[64px] ${
            activeTab === 'builder'
              ? 'text-indigo-400 bg-indigo-500/15 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <FileEdit className={`w-5 h-5 ${activeTab === 'builder' ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] mt-1 tracking-tight">Formulir</span>
        </button>

        {/* Tab 2: Hasil Prompt */}
        <button
          type="button"
          onClick={() => onChangeTab('prompt')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 min-w-[64px] relative ${
            activeTab === 'prompt'
              ? 'text-indigo-400 bg-indigo-500/15 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <FileText className={`w-5 h-5 ${activeTab === 'prompt' ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] mt-1 tracking-tight">Prompt</span>
          <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-indigo-500" />
        </button>

        {/* Tab 3: Analisis & Kualitas */}
        <button
          type="button"
          onClick={() => onChangeTab('analysis')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 min-w-[64px] relative ${
            activeTab === 'analysis'
              ? 'text-indigo-400 bg-indigo-500/15 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className="relative">
            <Sparkles className={`w-5 h-5 ${activeTab === 'analysis' ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
            {(conflictCount > 0 || missingHighCount > 0) && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-[#090e1c]" />
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">
            Analisis ({completenessScore}%)
          </span>
        </button>

        {/* Tab 4: Proyek / Templates */}
        <button
          type="button"
          onClick={() => onChangeTab('projects')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 min-w-[64px] ${
            activeTab === 'projects'
              ? 'text-indigo-400 bg-indigo-500/15 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <FolderGit2 className={`w-5 h-5 ${activeTab === 'projects' ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] mt-1 tracking-tight">Proyek</span>
        </button>

        {/* Quick 1-tap Copy Action */}
        <button
          type="button"
          onClick={onQuickCopy}
          className={`flex items-center justify-center p-2 rounded-xl border transition-all ${
            isCopied
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
              : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500/30 text-white shadow-md shadow-indigo-600/30 active:scale-95'
          }`}
          title="Salin seluruh prompt final ke clipboard"
        >
          {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>
    </nav>
  );
};
