import React, { useState } from 'react';
import { 
  FolderGit2, 
  Plus, 
  Copy, 
  Trash2, 
  History, 
  Sparkles, 
  Layers, 
  Upload, 
  Check, 
  ExternalLink,
  Database
} from 'lucide-react';
import { AppProject, PromptHistoryItem } from '../types/prompt';
import { PROMPT_TEMPLATES, PromptTemplate } from '../data/templates';
import { FirebaseConnectionStatus } from '../services/firebase';

interface MobileProjectViewProps {
  projects: AppProject[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onLoadTemplate: (template: PromptTemplate) => void;
  history: PromptHistoryItem[];
  onRestoreHistory: (item: PromptHistoryItem) => void;
  onImportMd: (file: File) => void;
  firebaseStatus?: FirebaseConnectionStatus;
}

export const MobileProjectView: React.FC<MobileProjectViewProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onDuplicateProject,
  onDeleteProject,
  onLoadTemplate,
  history,
  onRestoreHistory,
  onImportMd,
  firebaseStatus,
}) => {
  const [tab, setTab] = useState<'projects' | 'templates' | 'history'>('projects');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportMd(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 p-1">
      {/* Cloud Status Banner */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-400" />
          <div>
            <span className="text-xs font-bold text-slate-200 block">Cloud Firestore</span>
            <span className="text-[10px] text-slate-400">
              {firebaseStatus?.status === 'connected' ? 'Tersinkronisasi Real-Time' : 'Menghubungkan ke Cloud...'}
            </span>
          </div>
        </div>
        <span className={`w-2.5 h-2.5 rounded-full ${
          firebaseStatus?.status === 'connected' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
        }`} />
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 bg-slate-900 border border-slate-800 p-1 rounded-xl gap-1 text-xs">
        <button
          type="button"
          onClick={() => setTab('projects')}
          className={`py-2 rounded-lg font-semibold transition-all ${
            tab === 'projects' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Proyek ({projects.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('templates')}
          className={`py-2 rounded-lg font-semibold transition-all ${
            tab === 'templates' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Template ({PROMPT_TEMPLATES.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className={`py-2 rounded-lg font-semibold transition-all ${
            tab === 'history' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Riwayat ({history.length})
        </button>
      </div>

      {/* TAB 1: PROJECTS */}
      {tab === 'projects' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onNewProject}
              className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Buat Proyek Baru
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              title="Import file Markdown (.md)"
            >
              <Upload className="w-4 h-4 text-indigo-400" /> Import .md
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".md,.markdown,.txt"
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            {projects.map((proj) => {
              const isActive = proj.id === activeProjectId;
              return (
                <div
                  key={proj.id}
                  onClick={() => onSelectProject(proj.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <FolderGit2 className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span className={`text-xs font-bold truncate ${isActive ? 'text-slate-100' : 'text-slate-300'}`}>
                        {proj.name}
                      </span>
                      {isActive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold">
                          Aktif
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Target: {proj.requirement.targetAiTool} • Modul: {proj.requirement.modules.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onDuplicateProject(proj.id)}
                      className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Duplikasi proyek ini"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus proyek "${proj.name}"?`)) {
                            onDeleteProject(proj.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Hapus proyek ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATES */}
      {tab === 'templates' && (
        <div className="space-y-2">
          <p className="text-[11px] text-slate-400">
            Pilih salah satu template siap pakai untuk memulai perancangan aplikasi:
          </p>
          {PROMPT_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-indigo-500/40 transition-all space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{tmpl.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{tmpl.shortDesc || tmpl.requirement.description}</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 border border-slate-700 shrink-0">
                  {tmpl.category}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">
                  {tmpl.requirement.modules.length} Modul • {tmpl.requirement.roles.length} Role
                </span>
                <button
                  type="button"
                  onClick={() => onLoadTemplate(tmpl)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold active:scale-95 transition-all"
                >
                  Terapkan Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: HISTORY SNAPSHOTS */}
      {tab === 'history' && (
        <div className="space-y-2">
          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Belum ada riwayat snapshot tersimpan. Klik tombol Simpan di header untuk membuat snapshot.
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 flex items-center justify-between gap-2"
              >
                <div>
                  <span className="text-xs font-bold text-slate-200 block">{item.label}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.timestamp).toLocaleString('id-ID')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onRestoreHistory(item)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold active:scale-95 transition-all"
                >
                  Pulihkan
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
