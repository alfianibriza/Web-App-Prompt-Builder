import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Lightbulb, 
  Check, 
  Plus, 
  Users, 
  Database, 
  Layers, 
  ShieldCheck,
  RefreshCw,
  SendHorizontal
} from 'lucide-react';
import { AppRequirement } from '../types/prompt';

interface QuickModeBuilderProps {
  requirement: AppRequirement;
  onUpdateRequirement: (req: AppRequirement) => void;
  onAnalyzeAndExpand: (idea: string) => void;
  isAnalyzing: boolean;
}

export const QuickModeBuilder: React.FC<QuickModeBuilderProps> = ({
  requirement,
  onUpdateRequirement,
  onAnalyzeAndExpand,
  isAnalyzing,
}) => {
  const [ideaText, setIdeaText] = useState(requirement.description || '');

  const sampleIdeas = [
    'Saya ingin membuat aplikasi akademik sekolah dengan data guru, siswa, jadwal pelajaran, absensi harian, dan e-rapor.',
    'Aplikasi e-commerce toko baju dengan katalog produk, keranjang belanja, checkout Midtrans QRIS, dan lacak resi pengiriman.',
    'Platform SaaS CRM & Sales Pipeline dengan kanban board drag-and-drop, manajemen leads, dan analitik performa sales tim.',
    'Sistem klinik & rekam medis elektronik (e-RME) dengan antrean pasien, catatan dokter SOAP, dan resep digital obat.',
    'Aplikasi manajemen indekos & kontrakan dengan pencatatan kamar, tagihan sewa bulanan, dan reminder WhatsApp.',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaText.trim()) return;
    onAnalyzeAndExpand(ideaText);
  };

  const handleSelectSample = (sample: string) => {
    setIdeaText(sample);
    onAnalyzeAndExpand(sample);
  };

  return (
    <div className="space-y-6">
      {/* Banner / Title */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-900 border border-indigo-500/20">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            Mode Cepat (Quick Mode)
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-100">
          Cukup Masukkan Ide Anda, AI Menyusun Detail Teknisnya
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Masukkan deskripsi sederhana tentang aplikasi yang ingin Anda bangun. Sistem akan menganalisis kebutuhan sistem, memetakan user role, modul fitur, skema tabel database, endpoint API, dan arsitektur lengkap yang siap dieksekusi oleh AI coding.
        </p>
      </div>

      {/* Idea Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative rounded-xl border border-slate-700 bg-slate-900/90 shadow-inner focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all p-3">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Ide atau Kebutuhan Aplikasi Web Anda:
          </label>
          <textarea
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            rows={4}
            placeholder="Contoh: Saya ingin membuat aplikasi akademik sekolah lengkap dengan role guru, siswa, data kelas, jadwal mapel, absensi harian, dan pencatatan nilai rapor..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-400">
              💡 Tekan enter atau klik tombol analisis untuk mengekstrak arsitektur.
            </span>
            <button
              type="submit"
              disabled={isAnalyzing || !ideaText.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all"
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Sedang Menganalisis...' : 'Analisis & Lengkapi Otomatis'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Quick Idea Starters */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          Atau pilih salah satu contoh ide populer:
        </span>
        <div className="grid sm:grid-cols-2 gap-2">
          {sampleIdeas.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className="text-left p-2.5 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 hover:border-indigo-500/30 text-xs text-slate-300 transition-all group"
            >
              <span className="line-clamp-2 text-slate-300 group-hover:text-slate-100">
                "{sample}"
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Specification Quick Overview Cards */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Hasil Ekstraksi & Spesifikasi Saat Ini
        </h3>

        <div className="grid sm:grid-cols-2 gap-3">
          {/* App Info Card */}
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 space-y-1.5">
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block">
              Nama & Sasaran
            </span>
            <input
              type="text"
              value={requirement.name}
              onChange={(e) => onUpdateRequirement({ ...requirement, name: e.target.value })}
              placeholder="Nama Aplikasi"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded px-2 py-1 text-xs text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              value={requirement.targetUsers}
              onChange={(e) => onUpdateRequirement({ ...requirement, targetUsers: e.target.value })}
              placeholder="Target Pengguna (e.g. Guru, Siswa, Admin)"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* User Roles Card */}
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                User Roles ({requirement.roles.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  const newRoleName = prompt('Nama role baru (contoh: Supervisor):');
                  if (newRoleName) {
                    onUpdateRequirement({
                      ...requirement,
                      roles: [
                        ...requirement.roles,
                        { id: `r-${Date.now()}`, name: newRoleName, description: 'Role pengguna tambahan', permissions: ['read:data'] },
                      ],
                    });
                  }
                }}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Tambah
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              {requirement.roles.map((r) => (
                <span
                  key={r.id}
                  className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium"
                >
                  {r.name}
                </span>
              ))}
            </div>
          </div>

          {/* Modules Card */}
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 space-y-1.5">
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block">
              Modul Inti ({requirement.modules.length})
            </span>
            <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
              {requirement.modules.map((m) => (
                <div key={m.id} className="text-xs text-slate-300 flex items-start gap-1.5">
                  <span className="text-indigo-400 font-bold">•</span>
                  <div>
                    <span className="font-semibold text-slate-200">{m.name}</span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {m.features.slice(0, 2).join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Database Card */}
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 space-y-1.5">
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block">
              Database & Tech Stack
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Database</span>
                <span className="font-semibold text-slate-200">{requirement.database.type}</span>
              </div>
              <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Frontend</span>
                <span className="font-semibold text-slate-200 truncate block">{requirement.techStack.frontend.split(' ')[0]}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Tabel data: {requirement.database.tables.map(t => t.name).join(', ') || 'Belum dibuat'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
