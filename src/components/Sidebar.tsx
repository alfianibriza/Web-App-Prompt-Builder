import React, { useState } from 'react';
import { 
  FolderPlus, 
  Copy, 
  Trash2, 
  Layers, 
  History, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ChevronRight,
  Bookmark,
  FileText,
  Upload,
  BarChart3,
  ListOrdered,
  Database,
  Sun,
  Moon
} from 'lucide-react';
import { AppProject, AppRequirement, PromptHistoryItem } from '../types/prompt';
import { PROMPT_TEMPLATES, PromptTemplate } from '../data/templates';
import { FirebaseConnectionStatus } from '../services/firebase';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: AppProject[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onLoadTemplate: (template: PromptTemplate) => void;
  history: PromptHistoryItem[];
  onRestoreHistory: (item: PromptHistoryItem) => void;
  completenessScore: number;
  detectedDomain: string;
  onImportMd: (file: File) => void;
  onJumpToSection?: (sectionNumber: number) => void;
  onSelectStage?: (stageNumber: number) => void;
  currentStage?: number;
  firebaseStatus?: FirebaseConnectionStatus;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onDuplicateProject,
  onDeleteProject,
  onLoadTemplate,
  history,
  onRestoreHistory,
  completenessScore,
  detectedDomain,
  onImportMd,
  onJumpToSection,
  onSelectStage,
  currentStage = 1,
  firebaseStatus,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'stages' | 'projects' | 'templates' | 'history' | 'sections'>('stages');
  const [searchProject, setSearchProject] = useState('');

  const architectureStages = [
    { id: 1, label: '01. Identity & Goals', desc: 'Identitas, Tagline & Tujuan Sistem', section: 1 },
    { id: 2, label: '02. Roles & Permissions', desc: 'Hak Akses & Matrix User Roles', section: 4 },
    { id: 3, label: '03. Modules & Workflows', desc: 'Modul Fitur & Alur User Flow', section: 6 },
    { id: 4, label: '04. Database & API', desc: 'Skema Database & Endpoint API', section: 9 },
    { id: 5, label: '05. Technology Stack', desc: 'Framework, State & UI System', section: 11 },
    { id: 6, label: '06. Security & Output', desc: 'Security, Output & Aturan Koding', section: 17 },
  ];

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportMd(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sectionsList = [
    'ROLE AI',
    'KONTEKS PROYEK',
    'TUJUAN APLIKASI',
    'TARGET PENGGUNA',
    'USER ROLE & PERMISSION',
    'FITUR & MODUL',
    'USER FLOW',
    'STRUKTUR HALAMAN',
    'DATABASE',
    'API',
    'AUTHENTICATION & AUTHORIZATION',
    'UI/UX',
    'RESPONSIVE DESIGN',
    'SECURITY',
    'VALIDATION',
    'TEKNOLOGI YANG DIGUNAKAN',
    'STRUKTUR PROJECT',
    'REQUIREMENT TEKNIS',
    'OUTPUT YANG DIHARAPKAN',
    'ATURAN IMPLEMENTASI',
    'CHECKLIST SEBELUM SELESAI',
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      <aside className={`w-72 max-w-[85vw] border-r border-[rgba(228,228,231,0.1)] bg-[#111113] flex flex-col h-[calc(100vh-4rem)] z-50 shadow-2xl lg:shadow-none transition-all duration-300 ${
        isOpen ? 'fixed top-16 left-0 flex' : 'hidden lg:flex lg:static'
      }`}>
        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-[rgba(228,228,231,0.1)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#6366f1]" />
            <span className="label-mono font-bold text-[#e4e4e7]">
              Workspace Explorer
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[rgba(228,228,231,0.5)] hover:text-[#e4e4e7] hover:bg-[#18181b] lg:hidden rounded-[4px]"
            title="Tutup Menu Explorer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 p-2 border-b border-[rgba(228,228,231,0.1)] text-[11px] bg-[#0c0c0e]">
          <button
            onClick={() => setActiveTab('stages')}
            className={`py-1.5 rounded-[3px] font-medium text-center uppercase tracking-wider text-[10px] transition-all ${
              activeTab === 'stages'
                ? 'bg-[#18181b] text-[#e4e4e7] border border-[rgba(228,228,231,0.15)] font-semibold'
                : 'text-[rgba(228,228,231,0.5)] hover:text-[#e4e4e7]'
            }`}
          >
            Stages
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-1.5 rounded-[3px] font-medium text-center uppercase tracking-wider text-[10px] transition-all ${
              activeTab === 'projects'
                ? 'bg-[#18181b] text-[#e4e4e7] border border-[rgba(228,228,231,0.15)] font-semibold'
                : 'text-[rgba(228,228,231,0.5)] hover:text-[#e4e4e7]'
            }`}
          >
            Proyek
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-1.5 rounded-[3px] font-medium text-center uppercase tracking-wider text-[10px] transition-all ${
              activeTab === 'templates'
                ? 'bg-[#18181b] text-[#e4e4e7] border border-[rgba(228,228,231,0.15)] font-semibold'
                : 'text-[rgba(228,228,231,0.5)] hover:text-[#e4e4e7]'
            }`}
          >
            Template
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-1.5 rounded-[3px] font-medium text-center uppercase tracking-wider text-[10px] transition-all ${
              activeTab === 'history'
                ? 'bg-[#18181b] text-[#e4e4e7] border border-[rgba(228,228,231,0.15)] font-semibold'
                : 'text-[rgba(228,228,231,0.5)] hover:text-[#e4e4e7]'
            }`}
          >
            Riwayat
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
          {/* TAB 1: ARCHITECTURE STAGES */}
          {activeTab === 'stages' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="label-mono">
                  Architecture Stages
                </span>
                <span className="text-[10px] text-[#6366f1] font-mono">06 Steps</span>
              </div>

              <div className="space-y-1.5">
                {architectureStages.map((stage) => {
                  const isActive = currentStage === stage.id;
                  return (
                    <div
                      key={stage.id}
                      onClick={() => {
                        if (onSelectStage) onSelectStage(stage.id);
                        if (onJumpToSection) onJumpToSection(stage.section);
                      }}
                      className={`p-2.5 rounded-[4px] cursor-pointer transition-all border ${
                        isActive
                          ? 'bg-[#18181b] text-[#e4e4e7] border-[rgba(228,228,231,0.2)] shadow-sm'
                          : 'bg-transparent text-[rgba(228,228,231,0.6)] border-transparent hover:bg-white/[0.03] hover:text-[#e4e4e7]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs font-mono tracking-tight">
                          {stage.label}
                        </span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
                        )}
                      </div>
                      <p className="text-[10px] text-[rgba(228,228,231,0.4)] mt-0.5 truncate">
                        {stage.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-[rgba(228,228,231,0.1)]">
                <span className="label-mono block mb-2">
                  Struktur 21 Bagian Prompt
                </span>
                <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                  {sectionsList.map((sec, idx) => (
                    <button
                      key={sec}
                      onClick={() => onJumpToSection && onJumpToSection(idx + 1)}
                      className="w-full text-left px-2 py-1 rounded-[3px] hover:bg-[#18181b] text-[rgba(228,228,231,0.6)] hover:text-[#e4e4e7] flex items-center justify-between group transition-colors text-[11px]"
                    >
                      <span className="truncate">
                        <span className="text-[#6366f1] font-mono mr-1.5">{String(idx + 1).padStart(2, '0')}.</span>
                        {sec}
                      </span>
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[rgba(228,228,231,0.4)] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        {/* TAB 1: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Daftar Proyek ({projects.length})
              </span>
              <button
                onClick={onNewProject}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                Baru
              </button>
            </div>

            <div className="space-y-1.5">
              {projects.map((proj) => {
                const isActive = proj.id === activeProjectId;
                return (
                  <div
                    key={proj.id}
                    onClick={() => onSelectProject(proj.id)}
                    className={`group p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-indigo-950/40 border-indigo-500/40 text-slate-100 shadow-sm'
                        : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />}
                        <p className="font-semibold text-xs truncate">{proj.name || 'Proyek Tanpa Judul'}</p>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {new Date(proj.updatedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateProject(proj.id);
                        }}
                        className="p-1 hover:text-indigo-400 rounded hover:bg-slate-700/50"
                        title="Duplikasi Proyek"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {projects.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Hapus proyek "${proj.name}"?`)) {
                              onDeleteProject(proj.id);
                            }
                          }}
                          className="p-1 hover:text-rose-400 rounded hover:bg-slate-700/50"
                          title="Hapus Proyek"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Import Markdown File */}
            <div className="pt-3 border-t border-slate-800">
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-dashed border-slate-700 hover:border-indigo-500/60 text-slate-400 hover:text-slate-200 text-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Import Prompt (.md)
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="space-y-2.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Pilih Blueprint Siap Pakai
            </span>

            {PROMPT_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 hover:border-indigo-500/30 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {tpl.badge}
                  </span>
                  <span className="text-[10px] text-slate-400">{tpl.category}</span>
                </div>
                <h4 className="font-semibold text-slate-100 text-xs leading-snug">{tpl.name}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{tpl.shortDesc}</p>
                <button
                  onClick={() => {
                    if (confirm(`Muat template "${tpl.name}"? Ini akan memperbarui formulir saat ini.`)) {
                      onLoadTemplate(tpl);
                    }
                  }}
                  className="w-full mt-1 py-1 px-2 rounded-md bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-medium text-[11px] border border-indigo-500/30 transition-colors flex items-center justify-center gap-1"
                >
                  <Bookmark className="w-3 h-3" />
                  Gunakan Template
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Riwayat Snapshot ({history.length})
            </span>

            {history.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                <History className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p>Belum ada riwayat snapshot tersimpan.</p>
                <p className="text-[10px] mt-1 text-slate-600">Klik "Simpan" di toolbar untuk membuat snapshot.</p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 transition-all flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-medium text-xs text-slate-200 truncate">{item.label}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(item.timestamp).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Kembalikan spesifikasi ke snapshot "${item.label}"?`)) {
                        onRestoreHistory(item);
                      }
                    }}
                    className="px-2 py-1 text-[10px] rounded bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white font-medium transition-colors shrink-0"
                  >
                    Pulihkan
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: 21 SECTIONS */}
        {activeTab === 'sections' && (
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Struktur Prompt (21 Bagian Wajib)
            </span>
            {sectionsList.map((sec, idx) => (
              <button
                key={sec}
                onClick={() => onJumpToSection && onJumpToSection(idx + 1)}
                className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-800/80 text-slate-300 hover:text-indigo-300 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 group-hover:text-indigo-400 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs truncate">{sec}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Requirement Score Card - Variation 2 Design */}
      <div className="p-3 mx-3 mb-3 rounded-[4px] bg-[#18181b] border border-[rgba(228,228,231,0.1)] shrink-0">
        <div className="label-mono mb-1 text-[10px]">Requirement Score</div>
        <div className={`text-2xl font-['Syne'] font-extrabold ${
          completenessScore >= 80 ? 'text-[#10b981]' : completenessScore >= 50 ? 'text-amber-400' : 'text-rose-400'
        }`}>
          {completenessScore}%
        </div>
        <p className="text-[11px] text-[rgba(228,228,231,0.5)] mt-1 leading-normal font-sans">
          {completenessScore >= 80
            ? 'Spec is complete. Ready for production code generation.'
            : 'Spec needs more technical detail for reliable code generation.'}
        </p>
      </div>

      {/* Theme Mode & Cloud Firestore Status Footer */}
      <div className="p-3 border-t border-[rgba(228,228,231,0.1)] bg-[#0c0c0e] shrink-0 space-y-2.5">
        {/* Theme Mode Switcher */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[rgba(228,228,231,0.5)]">
            MODE TEMA
          </span>
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-2 py-1 rounded-[3px] bg-[#18181b] border border-[rgba(228,228,231,0.15)] text-[11px] font-mono text-[#e4e4e7] hover:bg-white/[0.04] transition-all"
            title={theme === 'light' ? 'Ganti ke Mode Gelap' : 'Ganti ke Mode Terang'}
          >
            {theme === 'light' ? (
              <>
                <Sun className="w-3 h-3 text-amber-500" />
                <span>TERANG</span>
              </>
            ) : (
              <>
                <Moon className="w-3 h-3 text-indigo-400" />
                <span>GELAP</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[rgba(228,228,231,0.06)]">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-semibold text-[rgba(228,228,231,0.8)] font-mono">FIRESTORE DB</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${
              firebaseStatus?.status === 'connected' 
                ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' 
                : firebaseStatus?.status === 'connecting'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-slate-500'
            }`} />
            <span className="text-[10px] font-mono text-[rgba(228,228,231,0.5)]">
              {firebaseStatus?.status === 'connected' ? 'CONNECTED' : 'SYNCING...'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  </>
);
};
