import React, { useState } from 'react';
import { 
  Database, 
  Layers, 
  Code, 
  Network, 
  ShieldCheck, 
  CheckSquare, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  GripVertical,
  SlidersHorizontal,
  Table,
  Lock,
  Globe
} from 'lucide-react';
import { 
  AppRequirement, 
  DatabaseTable, 
  DatabaseColumn, 
  ApiEndpoint, 
  AppModule, 
  AppPageRoute, 
  UserRole 
} from '../types/prompt';

interface ExpertModeBuilderProps {
  requirement: AppRequirement;
  onUpdateRequirement: (req: AppRequirement) => void;
}

export const ExpertModeBuilder: React.FC<ExpertModeBuilderProps> = ({
  requirement,
  onUpdateRequirement,
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'schema' | 'apis' | 'rbac' | 'routes' | 'rules'>('schema');

  // Reorder modules (Drag & drop or Arrow buttons)
  const moveModule = (index: number, direction: 'up' | 'down') => {
    const updated = [...requirement.modules];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onUpdateRequirement({ ...requirement, modules: updated });
  };

  // Add column to table
  const handleAddColumn = (tableIndex: number) => {
    const updatedTables = [...requirement.database.tables];
    const newCol: DatabaseColumn = {
      name: 'new_column',
      type: 'VARCHAR(100)',
      constraints: 'NOT NULL',
      description: 'Deskripsi kolom',
    };
    updatedTables[tableIndex].columns.push(newCol);
    onUpdateRequirement({
      ...requirement,
      database: { ...requirement.database, tables: updatedTables },
    });
  };

  const handleRemoveColumn = (tableIndex: number, colIndex: number) => {
    const updatedTables = [...requirement.database.tables];
    updatedTables[tableIndex].columns.splice(colIndex, 1);
    onUpdateRequirement({
      ...requirement,
      database: { ...requirement.database, tables: updatedTables },
    });
  };

  // Add table
  const handleAddTable = () => {
    const name = prompt('Nama tabel baru (contoh: orders, invoices, comments):');
    if (!name) return;
    const newTable: DatabaseTable = {
      id: `t-${Date.now()}`,
      name: name.toLowerCase().trim(),
      description: `Data entitas ${name}`,
      columns: [
        { name: 'id', type: 'UUID (PK)', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()' },
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
  };

  // Add API Endpoint
  const handleAddApi = () => {
    const newApi: ApiEndpoint = {
      id: `a-${Date.now()}`,
      method: 'GET',
      path: '/api/v1/resource',
      description: 'Mengambil data resource',
      authRequired: true,
    };
    onUpdateRequirement({
      ...requirement,
      apis: [...requirement.apis, newApi],
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Mode Pakar (Expert Mode)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Konfigurasi mendalam arsitektur sistem, skema basis data granular, endpoint API, dan kontrol RBAC.
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('schema')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg font-semibold transition-colors ${
            activeTab === 'schema'
              ? 'bg-slate-800 text-indigo-400 border-t-2 border-indigo-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          Data Modeler ({requirement.database.tables.length})
        </button>

        <button
          onClick={() => setActiveTab('apis')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg font-semibold transition-colors ${
            activeTab === 'apis'
              ? 'bg-slate-800 text-indigo-400 border-t-2 border-indigo-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          Endpoint API ({requirement.apis.length})
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg font-semibold transition-colors ${
            activeTab === 'rbac'
              ? 'bg-slate-800 text-indigo-400 border-t-2 border-indigo-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          RBAC Matrix ({requirement.roles.length} Role)
        </button>

        <button
          onClick={() => setActiveTab('routes')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg font-semibold transition-colors ${
            activeTab === 'routes'
              ? 'bg-slate-800 text-indigo-400 border-t-2 border-indigo-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Rute Halaman & Prioritas Modul
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg font-semibold transition-colors ${
            activeTab === 'architecture'
              ? 'bg-slate-800 text-indigo-400 border-t-2 border-indigo-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Tech Stack & DB Engine
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg font-semibold transition-colors ${
            activeTab === 'rules'
              ? 'bg-slate-800 text-indigo-400 border-t-2 border-indigo-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          Aturan AI & Checklist
        </button>
      </div>

      {/* SUBTAB 1: DATA MODELER */}
      {activeTab === 'schema' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Desainer Skema Basis Data ({requirement.database.type})
            </span>
            <button
              type="button"
              onClick={handleAddTable}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Tabel
            </button>
          </div>

          <div className="space-y-4">
            {requirement.database.tables.map((table, tIdx) => (
              <div key={table.id} className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                {/* Table Header */}
                <div className="p-3 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-indigo-400" />
                    <input
                      type="text"
                      value={table.name}
                      onChange={(e) => {
                        const updated = [...requirement.database.tables];
                        updated[tIdx].name = e.target.value;
                        onUpdateRequirement({
                          ...requirement,
                          database: { ...requirement.database, tables: updated },
                        });
                      }}
                      className="bg-transparent font-mono text-xs font-bold text-slate-100 focus:outline-none border-b border-transparent focus:border-indigo-400"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddColumn(tIdx)}
                      className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Kolom
                    </button>
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
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Columns List */}
                <div className="p-3 space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                    <span className="col-span-3">Nama Kolom</span>
                    <span className="col-span-3">Tipe Data</span>
                    <span className="col-span-4">Batasan (Constraints)</span>
                    <span className="col-span-2 text-right">Aksi</span>
                  </div>

                  {table.columns.map((col, cIdx) => (
                    <div key={cIdx} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={col.name}
                        onChange={(e) => {
                          const updated = [...requirement.database.tables];
                          updated[tIdx].columns[cIdx].name = e.target.value;
                          onUpdateRequirement({
                            ...requirement,
                            database: { ...requirement.database, tables: updated },
                          });
                        }}
                        className="col-span-3 bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-xs font-mono text-slate-200"
                      />
                      <input
                        type="text"
                        value={col.type}
                        onChange={(e) => {
                          const updated = [...requirement.database.tables];
                          updated[tIdx].columns[cIdx].type = e.target.value;
                          onUpdateRequirement({
                            ...requirement,
                            database: { ...requirement.database, tables: updated },
                          });
                        }}
                        className="col-span-3 bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-xs font-mono text-slate-200"
                      />
                      <input
                        type="text"
                        value={col.constraints || ''}
                        onChange={(e) => {
                          const updated = [...requirement.database.tables];
                          updated[tIdx].columns[cIdx].constraints = e.target.value;
                          onUpdateRequirement({
                            ...requirement,
                            database: { ...requirement.database, tables: updated },
                          });
                        }}
                        placeholder="e.g. PRIMARY KEY, UNIQUE, NOT NULL"
                        className="col-span-4 bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-xs font-mono text-slate-300"
                      />
                      <div className="col-span-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveColumn(tIdx, cIdx)}
                          className="p-1 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: ENDPOINT APIS */}
      {activeTab === 'apis' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Spesifikasi Endpoint REST / RPC API
            </span>
            <button
              type="button"
              onClick={handleAddApi}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Endpoint
            </button>
          </div>

          <div className="space-y-3">
            {requirement.apis.map((api, idx) => (
              <div key={api.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <select
                      value={api.method}
                      onChange={(e) => {
                        const updated = [...requirement.apis];
                        updated[idx].method = e.target.value as any;
                        onUpdateRequirement({ ...requirement, apis: updated });
                      }}
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs font-bold text-indigo-300"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="PATCH">PATCH</option>
                      <option value="DELETE">DELETE</option>
                    </select>

                    <input
                      type="text"
                      value={api.path}
                      onChange={(e) => {
                        const updated = [...requirement.apis];
                        updated[idx].path = e.target.value;
                        onUpdateRequirement({ ...requirement, apis: updated });
                      }}
                      placeholder="/api/v1/..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={api.authRequired}
                        onChange={(e) => {
                          const updated = [...requirement.apis];
                          updated[idx].authRequired = e.target.checked;
                          onUpdateRequirement({ ...requirement, apis: updated });
                        }}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Auth Wajib</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...requirement.apis];
                        updated.splice(idx, 1);
                        onUpdateRequirement({ ...requirement, apis: updated });
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={api.description}
                  onChange={(e) => {
                    const updated = [...requirement.apis];
                    updated[idx].description = e.target.value;
                    onUpdateRequirement({ ...requirement, apis: updated });
                  }}
                  placeholder="Deskripsi fungsionalitas endpoint..."
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded px-2 py-1 text-xs text-slate-200"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: RBAC MATRIX */}
      {activeTab === 'rbac' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Role-Based Access Control (RBAC)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Atur aturan otorisasi dan hak akses spesifik untuk setiap peran pengguna.
            </p>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-300 block">
              Aturan Otorisasi Global (1 baris per aturan)
            </span>
            <textarea
              value={requirement.auth.rbacRules.join('\n')}
              onChange={(e) => {
                const lines = e.target.value.split('\n').filter(l => l.trim().length > 0);
                onUpdateRequirement({
                  ...requirement,
                  auth: { ...requirement.auth, rbacRules: lines },
                });
              }}
              rows={5}
              placeholder="- Siswa hanya dapat membaca data miliknya sendiri.&#10;- Guru dapat menginput nilai untuk kelas yang diampu.&#10;- Admin memiliki akses penuh."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* SUBTAB 4: ROUTES & PRIORITAS MODUL (Drag and drop / reorderable) */}
      {activeTab === 'routes' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Prioritas Modul & Reordering
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Urutkan modul fungsional sesuai prioritas eksekusi kode AI (gunakan panah naik/turun).
            </p>
          </div>

          <div className="space-y-2">
            {requirement.modules.map((mod, idx) => (
              <div
                key={mod.id}
                className="p-3 rounded-lg border border-slate-800 bg-slate-900/80 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveModule(idx, 'up')}
                      className="p-0.5 hover:text-indigo-400 disabled:opacity-20 text-slate-400"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === requirement.modules.length - 1}
                      onClick={() => moveModule(idx, 'down')}
                      className="p-0.5 hover:text-indigo-400 disabled:opacity-20 text-slate-400"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <span className="font-semibold text-xs text-slate-200 block">{mod.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {mod.features.length} sub-fitur • Prioritas: {mod.priority || 'High'}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  Urutan #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 5: TECH STACK & DB ENGINE */}
      {activeTab === 'architecture' && (
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-200">Konfigurasi Database & Arsitektur Cloud</h3>
            <p className="text-[11px] text-slate-400">Pilih engine database dan ORM / client SDK yang akan diinstruksikan ke AI.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pb-3 border-b border-slate-800">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Tipe Database</label>
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
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
              >
                <option value="Firebase Firestore">Firebase Firestore (Cloud NoSQL & Real-time Sync)</option>
                <option value="PostgreSQL">PostgreSQL (Relational + Foreign Keys)</option>
                <option value="Supabase (PostgreSQL)">Supabase (PostgreSQL Managed + RLS)</option>
                <option value="MySQL">MySQL / MariaDB</option>
                <option value="MongoDB">MongoDB (NoSQL Document)</option>
                <option value="SQLite">SQLite (Lightweight Local)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">ORM / Data Access Layer</label>
              <select
                value={requirement.database.orm}
                onChange={(e) => onUpdateRequirement({
                  ...requirement,
                  database: { ...requirement.database, orm: e.target.value },
                })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
              >
                <option value="Firebase Web SDK (Modular Firestore)">Firebase Web SDK (Modular Firestore)</option>
                <option value="Prisma ORM">Prisma ORM</option>
                <option value="Drizzle ORM">Drizzle ORM</option>
                <option value="Supabase Client / PostgREST">Supabase Client / PostgREST</option>
                <option value="TypeORM">TypeORM</option>
                <option value="Mongoose">Mongoose</option>
                <option value="Native SQL Query">Native SQL Query</option>
              </select>
            </div>
          </div>

          <h3 className="font-bold text-slate-200">Tech Stack & Frameworks</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Frontend Stack</label>
              <input
                type="text"
                value={requirement.techStack.frontend}
                onChange={(e) => onUpdateRequirement({
                  ...requirement,
                  techStack: { ...requirement.techStack, frontend: e.target.value },
                })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Backend Stack</label>
              <input
                type="text"
                value={requirement.techStack.backend}
                onChange={(e) => onUpdateRequirement({
                  ...requirement,
                  techStack: { ...requirement.techStack, backend: e.target.value },
                })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">CSS & Styling</label>
              <input
                type="text"
                value={requirement.techStack.styling}
                onChange={(e) => onUpdateRequirement({
                  ...requirement,
                  techStack: { ...requirement.techStack, styling: e.target.value },
                })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">State Management</label>
              <input
                type="text"
                value={requirement.techStack.stateManagement}
                onChange={(e) => onUpdateRequirement({
                  ...requirement,
                  techStack: { ...requirement.techStack, stateManagement: e.target.value },
                })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: ATURAN AI & CHECKLIST */}
      {activeTab === 'rules' && (
        <div className="space-y-3 text-xs">
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-200">Aturan Implementasi AI (1 baris per aturan)</h3>
            <textarea
              value={requirement.implementationRules.join('\n')}
              onChange={(e) => {
                const lines = e.target.value.split('\n').filter(l => l.trim().length > 0);
                onUpdateRequirement({ ...requirement, implementationRules: lines });
              }}
              rows={4}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-200">Checklist Sebelum Selesai (1 baris per checklist item)</h3>
            <textarea
              value={requirement.preLaunchChecklist.join('\n')}
              onChange={(e) => {
                const lines = e.target.value.split('\n').filter(l => l.trim().length > 0);
                onUpdateRequirement({ ...requirement, preLaunchChecklist: lines });
              }}
              rows={4}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
};
