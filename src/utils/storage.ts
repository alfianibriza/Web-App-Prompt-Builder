import { AppProject, AppRequirement, PromptHistoryItem } from '../types/prompt';
import { PROMPT_TEMPLATES } from '../data/templates';

const PROJECTS_KEY = 'web_app_prompt_builder_projects_v1';
const ACTIVE_PROJECT_ID_KEY = 'web_app_prompt_builder_active_id';

export function createDefaultRequirement(): AppRequirement {
  const initialTpl = PROMPT_TEMPLATES[0].requirement;
  return JSON.parse(JSON.stringify(initialTpl));
}

export function createEmptyRequirement(): AppRequirement {
  return {
    id: `req-${Date.now()}`,
    name: '',
    tagline: '',
    description: '',
    targetUsers: '',
    roles: [
      { id: 'r-admin', name: 'Admin', description: 'Pengelola sistem utama', permissions: ['manage:all'] },
      { id: 'r-user', name: 'User', description: 'Pengguna umum aplikasi', permissions: ['read:own', 'write:own'] },
    ],
    modules: [
      { id: 'm-1', name: 'Autentikasi & Akun', priority: 'High', features: ['Registrasi akun baru', 'Login email/password', 'Manajemen profil'] },
      { id: 'm-2', name: 'Dashboard & Fungsionalitas Inti', priority: 'High', features: ['Ringkasan data utama', 'Formulir input data', 'Pencarian & filter'] },
    ],
    pages: [
      { id: 'p-1', path: '/login', name: 'Login', description: 'Halaman masuk pengguna', authRequired: false, allowedRoles: [] },
      { id: 'p-2', path: '/dashboard', name: 'Dashboard', description: 'Halaman utama setelah login', authRequired: true, allowedRoles: ['Admin', 'User'] },
    ],
    userFlows: [
      'Pengguna membuka web dan melakukan login.',
      'Sistem mengarahkan pengguna ke halaman dashboard utama.',
      'Pengguna mengelola data dan melihat laporan real-time.',
    ],
    database: {
      type: 'PostgreSQL',
      orm: 'Prisma ORM',
      tables: [
        {
          id: 't-users',
          name: 'users',
          description: 'Data akun pengguna',
          columns: [
            { name: 'id', type: 'UUID (PK)', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()' },
            { name: 'email', type: 'VARCHAR(120)', constraints: 'UNIQUE, NOT NULL' },
            { name: 'name', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
            { name: 'password_hash', type: 'VARCHAR(255)', constraints: 'NOT NULL' },
            { name: 'role', type: 'VARCHAR(50)', constraints: "DEFAULT 'USER'" },
            { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP' },
          ],
        },
      ],
    },
    apis: [
      { id: 'a-1', method: 'POST', path: '/api/auth/login', description: 'Login pengguna', authRequired: false },
      { id: 'a-2', method: 'GET', path: '/api/users/profile', description: 'Profil pengguna aktif', authRequired: true },
    ],
    auth: {
      type: 'JWT Bearer Token dengan HTTP-Only Cookie',
      mechanism: 'Bcrypt hashing salt round 12 + JWT token verification',
      rbacRules: ['User hanya dapat mengakses data miliknya.', 'Admin dapat mengakses seluruh data master.'],
    },
    techStack: {
      frontend: 'React 19 + TypeScript + Vite',
      backend: 'Node.js Express + TypeScript',
      styling: 'Tailwind CSS',
      stateManagement: 'Zustand + React Query',
      runtime: 'Node.js LTS',
      additionalLibraries: ['Lucide React', 'Zod'],
    },
    integrations: [],
    uiUx: {
      designStyle: 'Modern Clean Minimalist Dark/Light',
      colorTheme: 'Slate 900 background dengan Indigo accent',
      fontFamily: 'Plus Jakarta Sans',
      componentLibrary: 'Tailwind CSS + Lucide Icons',
      layoutPattern: 'Sidebar Navigation + Main Container',
      density: 'Compact (Productivity)',
    },
    responsive: {
      mobileNavigation: 'Collapsible Drawer / Sheet Menu',
      breakpoints: 'sm: 640px, md: 768px, lg: 1024px',
      touchTargetsMinSize: 'Min 44x44px',
      desktopOptimizations: 'Keyboard shortcuts dan multi-column layout',
    },
    security: {
      sanitization: true,
      rateLimiting: true,
      csrfProtection: true,
      corsPolicy: 'Whitelist domain produksi',
      dataValidation: 'Zod schema validation',
      storageEncryption: 'Password hashing bcrypt 12 rounds',
      authGuards: 'JWT auth middleware',
    },
    validations: [
      { id: 'v-1', field: 'email', rule: 'Valid email format', errorMessage: 'Alamat email tidak valid' },
    ],
    expectedAiOutput: {
      codeCompleteness: 'Full Production-Ready Code',
      fileStructureDetail: true,
      cleanArchitecturePattern: 'Feature-based (Modular)',
      includeSampleSeedData: true,
      includeEnvExample: true,
      includeTestingGuide: true,
    },
    implementationRules: [
      'Tulis kode secara lengkap tanpa potongan // TODO atau asumsi tak tertulis.',
      'Gunakan TypeScript strict mode di seluruh kode aplikasi.',
    ],
    preLaunchChecklist: [
      'Seluruh rute terproteksi dengan otorisasi role yang tepat.',
      'Validasi form menampilkan error yang jelas pada pengguna.',
    ],
    specialNotes: '',
    targetAiTool: 'Google AI Studio',
    mode: 'quick',
    updatedAt: new Date().toISOString(),
  };
}

export function getSavedProjects(): AppProject[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) {
      // Initialize with default template project
      const initialProject: AppProject = {
        id: 'proj-default-siakad',
        name: 'SIAKAD Prestasi Sekolah',
        requirement: PROMPT_TEMPLATES[0].requirement,
        history: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveProjects([initialProject]);
      return [initialProject];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading projects:', err);
    return [];
  }
}

export function saveProjects(projects: AppProject[]): void {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Error saving projects:', err);
  }
}

export function getActiveProjectId(): string | null {
  return localStorage.getItem(ACTIVE_PROJECT_ID_KEY);
}

export function setActiveProjectId(id: string): void {
  localStorage.setItem(ACTIVE_PROJECT_ID_KEY, id);
}

export function downloadPromptAsMarkdown(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.md') ? filename : `${filename}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
