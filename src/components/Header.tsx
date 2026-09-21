import React from 'react';
import { 
  Terminal, 
  Sparkles, 
  Copy, 
  Download, 
  RotateCcw, 
  Save, 
  Check, 
  Cpu, 
  Zap, 
  Compass, 
  Sliders, 
  Menu, 
  Database,
  Layers,
  Sun,
  Moon
} from 'lucide-react';
import { AppRequirement } from '../types/prompt';
import { FirebaseConnectionStatus } from '../services/firebase';

interface HeaderProps {
  requirement: AppRequirement;
  onUpdateRequirement: (req: AppRequirement) => void;
  onAnalyzeWithAi: () => void;
  isAnalyzing: boolean;
  onCopyAll: () => void;
  isCopied: boolean;
  onDownloadMd: () => void;
  onReset: () => void;
  onSave: () => void;
  onToggleSidebar: () => void;
  activeViewMobile: 'builder' | 'preview';
  onToggleViewMobile: (view: 'builder' | 'preview') => void;
  firebaseStatus?: FirebaseConnectionStatus;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  requirement,
  onUpdateRequirement,
  onAnalyzeWithAi,
  isAnalyzing,
  onCopyAll,
  isCopied,
  onDownloadMd,
  onReset,
  onSave,
  onToggleSidebar,
  activeViewMobile,
  onToggleViewMobile,
  firebaseStatus,
  theme = 'dark',
  onToggleTheme,
}) => {
  const targetAiOptions: AppRequirement['targetAiTool'][] = [
    'Google AI Studio',
    'Claude 3.7 Sonnet',
    'ChatGPT / OpenAI',
    'Cursor',
    'Windsurf / v0',
    'Umum',
  ];

  return (
    <header className="border-b border-[rgba(228,228,231,0.1)] bg-[#0c0c0e] sticky top-0 z-40 transition-colors">
      {/* Top Primary Bar */}
      <div className="h-16 px-3 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Branding & Sidebar Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 text-[rgba(228,228,231,0.6)] hover:text-[#e4e4e7] hover:bg-[#18181b] rounded-[4px] border border-[rgba(228,228,231,0.1)] transition-all active:scale-95"
            title="Toggle Architecture Stages & Explorer"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-[#6366f1] flex items-center justify-center text-white font-extrabold text-sm font-['Syne'] shrink-0 shadow-sm">
              P
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <h3 className="font-['Syne'] font-extrabold uppercase text-sm sm:text-base tracking-tight text-[#e4e4e7]">
                  Prompt Builder
                </h3>
                <span className="hidden sm:inline-block status-pill px-1.5 py-0.5 rounded-[99px] bg-emerald-500/10 text-[#10b981] font-mono text-[9px] font-bold border border-emerald-500/20">
                  ARCHITECT
                </span>
              </div>
              <div className="label-mono text-[10px] text-[rgba(228,228,231,0.5)] truncate max-w-[160px] sm:max-w-xs block">
                {requirement.name || 'System Architect Edition'}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Architecture Mode Switcher Tabs */}
        <div className="hidden md:flex items-center bg-[#18181b] border border-[rgba(228,228,231,0.1)] p-0.5 rounded-[4px]">
          <button
            onClick={() => onUpdateRequirement({ ...requirement, mode: 'quick' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-xs font-semibold uppercase tracking-wider transition-all ${
              requirement.mode === 'quick'
                ? 'bg-[#6366f1] text-white shadow-sm'
                : 'text-[rgba(228,228,231,0.5)] hover:text-[#e4e4e7] hover:bg-white/[0.04]'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Quick</span>
          </button>

          <button
            onClick={() => onUpdateRequirement({ ...requirement, mode: 'guided' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-xs font-semibold uppercase tracking-wider transition-all ${
              requirement.mode === 'guided'
                ? 'bg-[#6366f1] text-white shadow-sm'
                : 'text-[rgba(228,228,231,0.5)] hover:text-[#e4e4e7] hover:bg-white/[0.04]'
            }`}
          >
            <Compass className="w-3 h-3 text-cyan-400" />
            <span>Guided</span>
          </button>

          <button
            onClick={() => onUpdateRequirement({ ...requirement, mode: 'expert' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-xs font-semibold uppercase tracking-wider transition-all ${
              requirement.mode === 'expert'
                ? 'bg-[#6366f1] text-white shadow-sm'
                : 'text-[rgba(228,228,231,0.5)] hover:text-[#e4e4e7] hover:bg-white/[0.04]'
            }`}
          >
            <Sliders className="w-3 h-3 text-indigo-300" />
            <span>Expert</span>
          </button>
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Target AI Selector in Space Mono */}
          <div className="hidden lg:flex items-center gap-1 bg-[#18181b] border border-[rgba(228,228,231,0.1)] px-2.5 py-1.5 rounded-[4px] text-xs">
            <span className="label-mono text-[10px]">Target:</span>
            <select
              value={requirement.targetAiTool}
              onChange={(e) => onUpdateRequirement({ ...requirement, targetAiTool: e.target.value as any })}
              className="bg-transparent text-xs font-mono font-bold text-[#6366f1] focus:outline-none cursor-pointer tracking-wider"
            >
              {targetAiOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-[#18181b] text-[#e4e4e7]">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* AI Analyze Button */}
          <button
            onClick={onAnalyzeWithAi}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold uppercase tracking-wider border border-[rgba(228,228,231,0.15)] hover:border-[#6366f1] text-[#e4e4e7] bg-[#18181b] hover:bg-[#222226] transition-all disabled:opacity-50 active:scale-95"
            title="Analisis AI untuk melengkapi spesifikasi"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : 'text-[#6366f1]'}`} />
            <span className="hidden sm:inline">
              {isAnalyzing ? 'Analyzing...' : 'Analyze AI'}
            </span>
          </button>

          {/* Copy All Button */}
          <button
            onClick={onCopyAll}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
              isCopied
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-[#6366f1] hover:bg-[#5558e6] text-white shadow-sm'
            }`}
            title="Salin Blueprint Prompt ke Clipboard"
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy All'}</span>
          </button>

          {/* Theme Toggle Button (Light/Dark Mode) */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 text-[rgba(228,228,231,0.7)] hover:text-[#e4e4e7] hover:bg-[#18181b] rounded-[4px] border border-[rgba(228,228,231,0.15)] transition-all active:scale-95 flex items-center justify-center"
            title={theme === 'light' ? 'Beralih ke Mode Gelap (Dark Mode)' : 'Beralih ke Mode Terang (Light Mode)'}
            aria-label="Toggle Dark or Light Theme"
          >
            {theme === 'light' ? (
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>

          {/* Save snapshot button */}
          <button
            onClick={onSave}
            className="p-2 text-[rgba(228,228,231,0.6)] hover:text-[#e4e4e7] hover:bg-[#18181b] rounded-[4px] border border-[rgba(228,228,231,0.1)] transition-all active:scale-95"
            title="Simpan Snapshot Proyek"
          >
            <Save className="w-3.5 h-3.5" />
          </button>

          {/* Download .md */}
          <button
            onClick={onDownloadMd}
            className="hidden sm:flex p-2 text-[rgba(228,228,231,0.6)] hover:text-[#e4e4e7] hover:bg-[#18181b] rounded-[4px] border border-[rgba(228,228,231,0.1)] transition-all active:scale-95"
            title="Unduh file .md"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Reset button */}
          <button
            onClick={onReset}
            className="hidden sm:flex p-2 text-[rgba(228,228,231,0.5)] hover:text-rose-400 hover:bg-[#18181b] rounded-[4px] border border-[rgba(228,228,231,0.1)] transition-all active:scale-95"
            title="Reset formulir"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Secondary Bar for Small Mobile Screens: Mode Switcher Pills + Target AI */}
      <div className="px-3 py-2 border-t border-slate-800/60 bg-slate-950/70 flex md:hidden items-center justify-between gap-2">
        {/* Mode Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-0.5 rounded-lg overflow-x-auto">
          <button
            onClick={() => onUpdateRequirement({ ...requirement, mode: 'quick' })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
              requirement.mode === 'quick'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            Cepat
          </button>

          <button
            onClick={() => onUpdateRequirement({ ...requirement, mode: 'guided' })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
              requirement.mode === 'guided'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3 h-3 text-cyan-400" />
            Terpandu
          </button>

          <button
            onClick={() => onUpdateRequirement({ ...requirement, mode: 'expert' })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
              requirement.mode === 'expert'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3 h-3 text-indigo-400" />
            Pakar
          </button>
        </div>

        {/* Target AI Compact Select */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-[11px] shrink-0">
          <Cpu className="w-3 h-3 text-indigo-400" />
          <select
            value={requirement.targetAiTool}
            onChange={(e) => onUpdateRequirement({ ...requirement, targetAiTool: e.target.value as any })}
            className="bg-transparent text-[11px] text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[120px]"
          >
            {targetAiOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-slate-900 text-slate-200 text-xs">
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};

