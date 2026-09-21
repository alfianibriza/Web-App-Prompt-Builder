import React, { useState } from 'react';
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Layers, 
  Shield, 
  Database, 
  Code2, 
  Palette, 
  FileCheck,
  HelpCircle
} from 'lucide-react';
import { AppRequirement, UserRole, AppModule, DatabaseTable, ApiEndpoint } from '../types/prompt';

interface GuidedModeBuilderProps {
  requirement: AppRequirement;
  onUpdateRequirement: (req: AppRequirement) => void;
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

export const GuidedModeBuilder: React.FC<GuidedModeBuilderProps> = ({
  requirement,
  onUpdateRequirement,
  currentStep: externalStep,
  onStepChange,
}) => {
  const [internalStep, setInternalStep] = useState(1);
  const currentStep = externalStep !== undefined ? externalStep : internalStep;

  const setCurrentStep = (step: number | ((prev: number) => number)) => {
    const nextStep = typeof step === 'function' ? step(currentStep) : step;
    setInternalStep(nextStep);
    if (onStepChange) {
      onStepChange(nextStep);
    }
  };

  const steps = [
    { id: 1, title: 'Identitas & Sasaran', icon: HelpCircle },
    { id: 2, title: 'Role & Izin Akses', icon: Shield },
    { id: 3, title: 'Modul & Alur Kerja', icon: Layers },
    { id: 4, title: 'Database & API', icon: Database },
    { id: 5, title: 'Teknologi & UI/UX', icon: Palette },
    { id: 6, title: 'Keamanan & Output', icon: FileCheck },
  ];

  // Helper to add a new role
  const handleAddRole = () => {
    const newRole: UserRole = {
      id: `r-${Date.now()}`,
      name: 'Role Baru',
      description: 'Tanggung jawab peran ini',
      permissions: ['read:data'],
    };
    onUpdateRequirement({
      ...requirement,
      roles: [...requirement.roles, newRole],
    });
  };

  const handleRemoveRole = (index: number) => {
    const updated = [...requirement.roles];
    updated.splice(index, 1);
    onUpdateRequirement({ ...requirement, roles: updated });
  };

  // Helper to add module
  const handleAddModule = () => {
    const newModule: AppModule = {
      id: `m-${Date.now()}`,
      name: 'Modul Baru',
      priority: 'High',
      features: ['Fitur 1', 'Fitur 2'],
    };
    onUpdateRequirement({
      ...requirement,
      modules: [...requirement.modules, newModule],
    });
  };

  const handleRemoveModule = (index: number) => {
    const updated = [...requirement.modules];
    updated.splice(index, 1);
    onUpdateRequirement({ ...requirement, modules: updated });
  };

  return (
    <div className="space-y-6">
      {/* Stepper Header (Variation 2 Design) */}
      <div className="border-b border-[rgba(228,228,231,0.1)] pb-4">
        <h2 className="text-xl font-['Syne'] font-extrabold uppercase tracking-tight text-[#e4e4e7]">
          STAGE 0{currentStep}: {steps[currentStep - 1]?.title.toUpperCase()}
        </h2>
        <p className="text-xs text-[rgba(228,228,231,0.5)] mt-1 font-sans">
          {currentStep === 1 && 'Define core identity, problem statement, and architectural guardrails.'}
          {currentStep === 2 && 'Design role-based access control (RBAC), user matrix, and permission levels.'}
          {currentStep === 3 && 'Specify functional modules, features priority, and step-by-step user workflows.'}
          {currentStep === 4 && 'Define relational database models, relationships, and RESTful API endpoints.'}
          {currentStep === 5 && 'Select modern technology stack, libraries, and design system specifications.'}
          {currentStep === 6 && 'Set security rules, validation constraints, and non-negotiable coding guardrails.'}
        </p>
      </div>

      {/* Stage Step Navigation Bar */}
      <div className="p-2 bg-[#111113] border border-[rgba(228,228,231,0.1)] rounded-[4px]">
        <div className="flex items-center justify-between overflow-x-auto pb-1 sm:pb-0 gap-1.5">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#18181b] text-[#e4e4e7] border border-[rgba(228,228,231,0.2)] font-bold shadow-sm'
                    : isCompleted
                    ? 'text-[#10b981] hover:bg-white/[0.03]'
                    : 'text-[rgba(228,228,231,0.5)] hover:text-[#e4e4e7] hover:bg-white/[0.03]'
                }`}
              >
                <span className={`w-4 h-4 rounded-[2px] flex items-center justify-center text-[10px] font-mono font-bold ${
                  isActive ? 'bg-[#6366f1] text-white' : isCompleted ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#18181b] text-[rgba(228,228,231,0.4)]'
                }`}>
                  {isCompleted ? <Check className="w-2.5 h-2.5" /> : step.id}
                </span>
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Contents */}
      <div className="p-5 bg-[#111113] border border-[rgba(228,228,231,0.1)] rounded-[4px] space-y-4">
        {/* STEP 1: Identitas & Sasaran */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="label-mono block mb-1.5">Application Name *</label>
                <input
                  type="text"
                  value={requirement.name}
                  onChange={(e) => onUpdateRequirement({ ...requirement, name: e.target.value })}
                  placeholder="Contoh: SIAKAD Prestasi Sekolah, TokoOnline Express"
                  className="w-full bg-[#18181b] border border-[rgba(228,228,231,0.1)] rounded-[4px] px-3.5 py-2 text-xs text-[#e4e4e7] focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              <div>
                <label className="label-mono block mb-1.5">Tagline / Sub-Title</label>
                <input
                  type="text"
                  value={requirement.tagline || ''}
                  onChange={(e) => onUpdateRequirement({ ...requirement, tagline: e.target.value })}
                  placeholder="Contoh: Platform Manajemen Absensi, Nilai, dan e-Rapor Terpadu"
                  className="w-full bg-[#18181b] border border-[rgba(228,228,231,0.1)] rounded-[4px] px-3.5 py-2 text-xs text-[#e4e4e7] focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              <div>
                <label className="label-mono block mb-1.5">Core Value Proposition & Purpose *</label>
                <textarea
                  value={requirement.description}
                  onChange={(e) => onUpdateRequirement({ ...requirement, description: e.target.value })}
                  rows={4}
                  placeholder="Jelaskan masalah apa yang diselesaikan dan apa fungsi utama aplikasi..."
                  className="w-full bg-[#18181b] border border-[rgba(228,228,231,0.1)] rounded-[4px] px-3.5 py-2 text-xs text-[#e4e4e7] focus:outline-none focus:border-[#6366f1] leading-relaxed"
                />
              </div>

              <div>
                <label className="label-mono block mb-1.5">Target User Personas *</label>
                <input
                  type="text"
                  value={requirement.targetUsers}
                  onChange={(e) => onUpdateRequirement({ ...requirement, targetUsers: e.target.value })}
                  placeholder="Contoh: Guru sekolah, siswa, wali murid, dan staf tata usaha"
                  className="w-full bg-[#18181b] border border-[rgba(228,228,231,0.1)] rounded-[4px] px-3.5 py-2 text-xs text-[#e4e4e7] focus:outline-none focus:border-[#6366f1]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Role & Izin Akses */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Langkah 2: User Roles & Hak Akses (RBAC)</h3>
                <p className="text-xs text-slate-400">Siapa saja yang dapat mengakses sistem dan batasan otorisasi mereka.</p>
              </div>
              <button
                type="button"
                onClick={handleAddRole}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Role
              </button>
            </div>

            <div className="space-y-3">
              {requirement.roles.map((role, idx) => (
                <div key={role.id} className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400">Role #{idx + 1}</span>
                    {requirement.roles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRole(idx)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Nama Role</label>
                      <input
                        type="text"
                        value={role.name}
                        onChange={(e) => {
                          const updated = [...requirement.roles];
                          updated[idx].name = e.target.value;
                          onUpdateRequirement({ ...requirement, roles: updated });
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Deskripsi Tanggung Jawab</label>
                      <input
                        type="text"
                        value={role.description}
                        onChange={(e) => {
                          const updated = [...requirement.roles];
                          updated[idx].description = e.target.value;
                          onUpdateRequirement({ ...requirement, roles: updated });
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Hak Akses / Permissions (pisahkan dengan koma)</label>
                    <input
                      type="text"
                      value={role.permissions.join(', ')}
                      onChange={(e) => {
                        const updated = [...requirement.roles];
                        updated[idx].permissions = e.target.value.split(',').map(p => p.trim()).filter(Boolean);
                        onUpdateRequirement({ ...requirement, roles: updated });
                      }}
                      placeholder="e.g. read:grades, write:attendance, export:pdf"
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Modul & Alur Kerja */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Langkah 3: Modul Aplikasi & Alur Pengguna (User Flow)</h3>
                <p className="text-xs text-slate-400">Petakan fitur aplikasi ke dalam modul logis dan urutan aksi pengguna.</p>
              </div>
              <button
                type="button"
                onClick={handleAddModule}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Modul
              </button>
            </div>

            {/* Modules */}
            <div className="space-y-3">
              {requirement.modules.map((mod, idx) => (
                <div key={mod.id} className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400">Modul #{idx + 1}</span>
                    {requirement.modules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveModule(idx)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Nama Modul</label>
                      <input
                        type="text"
                        value={mod.name}
                        onChange={(e) => {
                          const updated = [...requirement.modules];
                          updated[idx].name = e.target.value;
                          onUpdateRequirement({ ...requirement, modules: updated });
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Prioritas</label>
                      <select
                        value={mod.priority || 'High'}
                        onChange={(e) => {
                          const updated = [...requirement.modules];
                          updated[idx].priority = e.target.value as any;
                          onUpdateRequirement({ ...requirement, modules: updated });
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-100"
                      >
                        <option value="High">High (Wajib di MVP)</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Daftar Sub-Fitur (pisahkan dengan koma)</label>
                    <input
                      type="text"
                      value={mod.features.join(', ')}
                      onChange={(e) => {
                        const updated = [...requirement.modules];
                        updated[idx].features = e.target.value.split(',').map(f => f.trim()).filter(Boolean);
                        onUpdateRequirement({ ...requirement, modules: updated });
                      }}
                      placeholder="e.g. Input absensi harian, Rekap bulanan, Export PDF"
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-100"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* User flows */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Alur Kerja Utama (User Flow Step-by-Step, 1 baris per langkah)
              </label>
              <textarea
                value={requirement.userFlows.join('\n')}
                onChange={(e) => {
                  const lines = e.target.value.split('\n').filter(l => l.trim().length > 0);
                  onUpdateRequirement({ ...requirement, userFlows: lines });
                }}
                rows={4}
                placeholder="1. Pengguna login ke sistem&#10;2. Memilih menu operasional&#10;3. Melakukan input data&#10;4. Sistem memvalidasi dan menyimpan data"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Database & API */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Langkah 4: Database & Endpoint API</h3>
              <p className="text-xs text-slate-400">Pilih mesin database, ORM, dan definisikan tabel-tabel utama.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Tipe Database</label>
                <select
                  value={requirement.database.type}
                  onChange={(e) => {
                    const val = e.target.value;
                    const defaultOrm = val.includes('Firebase') 
                      ? 'Firebase Web SDK (Modular Firestore)' 
                      : val.includes('Supabase') 
                      ? 'Supabase Client / PostgREST' 
                      : val.includes('MongoDB') 
                      ? 'Mongoose' 
                      : 'Drizzle ORM';
                    onUpdateRequirement({
                      ...requirement,
                      database: { ...requirement.database, type: val, orm: defaultOrm },
                    });
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                >
                  <option value="Firebase Firestore">Firebase Firestore (Cloud NoSQL & Real-Time Sync)</option>
                  <option value="PostgreSQL">PostgreSQL (Relasional Kuat & Skalabel)</option>
                  <option value="Supabase (PostgreSQL)">Supabase (PostgreSQL Managed + RLS)</option>
                  <option value="MySQL">MySQL / MariaDB</option>
                  <option value="MongoDB">MongoDB (NoSQL Document)</option>
                  <option value="SQLite">SQLite (Lightweight Serverless)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">ORM / Data Access Layer</label>
                <select
                  value={requirement.database.orm}
                  onChange={(e) => onUpdateRequirement({
                    ...requirement,
                    database: { ...requirement.database, orm: e.target.value },
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                >
                  <option value="Firebase Web SDK (Modular Firestore)">Firebase Web SDK (Modular Firestore)</option>
                  <option value="Prisma ORM">Prisma ORM (Type-safe Schema)</option>
                  <option value="Drizzle ORM">Drizzle ORM (Zero overhead, SQL-like)</option>
                  <option value="Supabase Client / PostgREST">Supabase Client / PostgREST</option>
                  <option value="TypeORM">TypeORM</option>
                  <option value="Mongoose">Mongoose (Khusus MongoDB)</option>
                  <option value="Native SQL Query">Native SQL Queries</option>
                </select>
              </div>
            </div>

            {/* Tables preview list */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Daftar Tabel ({requirement.database.tables.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const tableName = prompt('Nama tabel baru (contoh: courses):');
                    if (tableName) {
                      const newTable: DatabaseTable = {
                        id: `t-${Date.now()}`,
                        name: tableName.toLowerCase().trim(),
                        description: `Data entitas ${tableName}`,
                        columns: [
                          { name: 'id', type: 'UUID (PK)', constraints: 'PRIMARY KEY' },
                          { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP' },
                        ],
                      };
                      onUpdateRequirement({
                        ...requirement,
                        database: {
                          ...requirement.database,
                          tables: [...requirement.database.tables, newTable],
                        },
                      });
                    }
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Tabel
                </button>
              </div>

              <div className="space-y-2">
                {requirement.database.tables.map((tbl, tIdx) => (
                  <div key={tbl.id} className="p-3 rounded-lg border border-slate-800 bg-slate-900/70 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-300">
                        📁 {tbl.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...requirement.database.tables];
                          updated.splice(tIdx, 1);
                          onUpdateRequirement({
                            ...requirement,
                            database: { ...requirement.database, tables: updated },
                          });
                        }}
                        className="text-slate-400 hover:text-rose-400 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">{tbl.description}</p>
                    <div className="text-[11px] text-slate-300 font-mono bg-slate-800/80 p-1.5 rounded">
                      Kolom: {tbl.columns.map(c => c.name).join(', ') || 'Belum ada kolom'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Teknologi & UI/UX */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Langkah 5: Teknologi, Desain UI/UX & Responsivitas</h3>
              <p className="text-xs text-slate-400">Tentukan frontend, backend, tema visual, dan standar responsive.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Frontend Framework</label>
                <input
                  type="text"
                  value={requirement.techStack.frontend}
                  onChange={(e) => onUpdateRequirement({
                    ...requirement,
                    techStack: { ...requirement.techStack, frontend: e.target.value },
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Backend Runtime / Framework</label>
                <input
                  type="text"
                  value={requirement.techStack.backend}
                  onChange={(e) => onUpdateRequirement({
                    ...requirement,
                    techStack: { ...requirement.techStack, backend: e.target.value },
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Gaya Desain UI</label>
                <select
                  value={requirement.uiUx.designStyle}
                  onChange={(e) => onUpdateRequirement({
                    ...requirement,
                    uiUx: { ...requirement.uiUx, designStyle: e.target.value },
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                >
                  <option value="Modern Minimalist Dark/Light UI">Modern Minimalist Dark/Light (Fokus Konten)</option>
                  <option value="Enterprise Clean Dashboard">Enterprise Clean Dashboard (Data Dense)</option>
                  <option value="Creative High-Tech Workspace">Creative High-Tech Workspace</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Sistem Navigasi Mobile</label>
                <input
                  type="text"
                  value={requirement.responsive.mobileNavigation}
                  onChange={(e) => onUpdateRequirement({
                    ...requirement,
                    responsive: { ...requirement.responsive, mobileNavigation: e.target.value },
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Keamanan & Output AI */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Langkah 6: Validasi, Keamanan & Ekspektasi Output AI</h3>
              <p className="text-xs text-slate-400">Atur instruksi penulisan kode, validasi Zod, dan batasan keamanan.</p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-200 block">Protokol Keamanan Wajib</span>
                <div className="grid sm:grid-cols-3 gap-2 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requirement.security.sanitization}
                      onChange={(e) => onUpdateRequirement({
                        ...requirement,
                        security: { ...requirement.security, sanitization: e.target.checked },
                      })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Input Sanitization (XSS)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requirement.security.rateLimiting}
                      onChange={(e) => onUpdateRequirement({
                        ...requirement,
                        security: { ...requirement.security, rateLimiting: e.target.checked },
                      })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Rate Limiting API</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requirement.security.csrfProtection}
                      onChange={(e) => onUpdateRequirement({
                        ...requirement,
                        security: { ...requirement.security, csrfProtection: e.target.checked },
                      })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>CORS & CSRF Guard</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Catatan Khusus / Permintaan Tambahan</label>
                <textarea
                  value={requirement.specialNotes}
                  onChange={(e) => onUpdateRequirement({ ...requirement, specialNotes: e.target.value })}
                  rows={3}
                  placeholder="Tambahkan catatan khusus, misalnya: 'Sediakan skrip database migration' atau 'Gunakan dark mode sebagai tema default'..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[rgba(228,228,231,0.1)]">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[rgba(228,228,231,0.15)] text-[#e4e4e7] hover:bg-white/[0.04] disabled:opacity-30 text-xs font-mono uppercase tracking-wider transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Stage
          </button>

          <span className="text-[11px] font-mono text-[rgba(228,228,231,0.5)]">
            STAGE 0{currentStep} / 0{steps.length}
          </span>

          <button
            type="button"
            disabled={currentStep === steps.length}
            onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-[4px] bg-[#6366f1] hover:bg-[#5558e6] text-white disabled:opacity-30 text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            Next Stage <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
