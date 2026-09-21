import { AppRequirement, AnalysisReport, MissingItem, RequirementConflict } from '../types/prompt';

export function detectDomain(text: string): string {
  const fullText = text.toLowerCase();
  if (/sekolah|akademik|guru|siswa|rapor|mapel|kelas|siakad/i.test(fullText)) {
    return 'Sistem Informasi Akademik Sekolah';
  } else if (/toko|belanja|cart|produk|checkout|ecommerce|penjual|vendor/i.test(fullText)) {
    return 'E-Commerce & Toko Online';
  } else if (/klinik|pasien|dokter|rekam medis|obat|resepsionis|hospital/i.test(fullText)) {
    return 'Klinik & Rekam Medis (e-RME)';
  } else if (/crm|leads|sales|prospek|pipa penjualan|pipeline|deal/i.test(fullText)) {
    return 'SaaS CRM & Sales Pipeline';
  } else if (/kasir|pos|point of sale|inventori|stok|barcode/i.test(fullText)) {
    return 'Point of Sale (POS) & Inventori';
  } else if (/tugas|project|kanban|task|sprint|agile/i.test(fullText)) {
    return 'Project & Task Management';
  } else if (/kos|sewa|tenant|properti|kamar/i.test(fullText)) {
    return 'Manajemen Indekos & Properti Sewa';
  }
  return 'Aplikasi Web Umum';
}

export function analyzeRequirements(req: AppRequirement): AnalysisReport {
  const missingItems: MissingItem[] = [];
  const conflicts: RequirementConflict[] = [];
  const recommendations: string[] = [];

  let score = 0;
  const totalWeight = 100;

  // 1. Basic Info (Weight: 15)
  if (req.name && req.name.trim().length > 2) {
    score += 5;
  } else {
    missingItems.push({
      id: 'miss-name',
      section: 'Informasi Dasar',
      title: 'Nama Aplikasi Belum Ditetapkan',
      message: 'Aplikasi belum memiliki nama yang spesifik dan representatif.',
      severity: 'high',
      recommendation: 'Tentukan nama aplikasi yang jelas (misal: "SIAKAD Prestasi" atau "EduGrade")',
    });
  }

  if (req.description && req.description.trim().length > 15) {
    score += 5;
  } else {
    missingItems.push({
      id: 'miss-desc',
      section: 'Informasi Dasar',
      title: 'Deskripsi / Tujuan Terlalu Singkat',
      message: 'Deskripsi tujuan sistem masih sangat minim atau belum diisi.',
      severity: 'high',
      recommendation: 'Jelaskan tujuan utama aplikasi, masalah yang diselesaikan, dan dampaknya bagi pengguna.',
    });
  }

  if (req.targetUsers && req.targetUsers.trim().length > 3) {
    score += 5;
  } else {
    missingItems.push({
      id: 'miss-target',
      section: 'Target Pengguna',
      title: 'Target Pengguna Belum Spesifik',
      message: 'Profil siapa yang akan menggunakan aplikasi belum didefinisikan.',
      severity: 'medium',
      recommendation: 'Sebutkan target pengguna konkret (misal: "Guru piket, siswa SMA, dan wali murid").',
    });
  }

  // 2. Roles & Permissions (Weight: 15)
  if (req.roles && req.roles.length > 0) {
    score += 8;
    const rolesWithoutPerms = req.roles.filter(r => !r.permissions || r.permissions.length === 0);
    if (rolesWithoutPerms.length > 0) {
      missingItems.push({
        id: 'miss-role-perms',
        section: 'Role & Permission',
        title: `Hak Akses Role Belum Rinci (${rolesWithoutPerms.length} role)`,
        message: `Role ${rolesWithoutPerms.map(r => `"${r.name}"`).join(', ')} belum memiliki daftar hak akses / permissions.`,
        severity: 'medium',
        recommendation: 'Rincikan permission granular (misal: "read:grades", "update:attendance", "export:report").',
      });
    } else {
      score += 7;
    }
  } else {
    missingItems.push({
      id: 'miss-roles',
      section: 'Role & Permission',
      title: 'User Roles Belum Didefinisikan',
      message: 'Sistem belum memiliki pembagian peran pengguna (misal Admin, User, Manager).',
      severity: 'high',
      recommendation: 'Tambahkan minimal 2 peran pengguna dengan tingkatan otorisasi berbeda.',
    });
  }

  // 3. Features & Modules (Weight: 20)
  if (req.modules && req.modules.length > 0) {
    score += 10;
    const emptyModules = req.modules.filter(m => !m.features || m.features.length === 0);
    if (emptyModules.length > 0) {
      missingItems.push({
        id: 'miss-module-feats',
        section: 'Modul & Fitur',
        title: `Sub-Fitur Kosong pada ${emptyModules.length} Modul`,
        message: `Modul ${emptyModules.map(m => `"${m.name}"`).join(', ')} belum memiliki daftar sub-fitur konkret.`,
        severity: 'high',
        recommendation: 'Uraikan 3-5 fitur fungsional pada setiap modul.',
      });
    } else {
      score += 10;
    }
  } else {
    missingItems.push({
      id: 'miss-modules',
      section: 'Modul & Fitur',
      title: 'Daftar Modul Belum Ada',
      message: 'Tidak ada modul atau fitur fungsional yang terdaftar untuk dibangun.',
      severity: 'high',
      recommendation: 'Petakan fitur aplikasi ke dalam 3-5 modul terstruktur.',
    });
  }

  // 4. User Flows & Pages (Weight: 10)
  if (req.userFlows && req.userFlows.length > 0) {
    score += 5;
  } else {
    missingItems.push({
      id: 'miss-flows',
      section: 'Alur Kerja (User Flow)',
      title: 'User Flow Belum Dipetakan',
      message: 'Langkah demi langkah pengguna dari awal login hingga menyelesaikan tugas belum ada.',
      severity: 'medium',
      recommendation: 'Tuliskan alur kerja utama berurutan (1. Login -> 2. Pilih Menu -> 3. Input Data -> 4. Konfirmasi).',
    });
  }

  if (req.pages && req.pages.length > 0) {
    score += 5;
  } else {
    missingItems.push({
      id: 'miss-pages',
      section: 'Struktur Halaman',
      title: 'Rute Halaman Belum Dipetakan',
      message: 'Daftar URL rute aplikasi web belum didefinisikan.',
      severity: 'medium',
      recommendation: 'Tambahkan daftar halaman utama seperti /dashboard, /profile, /settings.',
    });
  }

  // 5. Database & API (Weight: 20)
  if (req.database?.type && req.database.type.trim() !== '') {
    score += 5;
    if (req.database.tables && req.database.tables.length > 0) {
      score += 5;
    } else {
      missingItems.push({
        id: 'miss-db-tables',
        section: 'Database',
        title: 'Skema Tabel Belum Didefinisikan',
        message: `Database dipilih (${req.database.type}), namun belum ada tabel atau relasi kolom.`,
        severity: 'high',
        recommendation: 'Rancang entitas tabel utama beserta kolom primary key dan foreign key.',
      });
    }
  } else {
    missingItems.push({
      id: 'miss-db',
      section: 'Database',
      title: 'Tipe Database Belum Dipilih',
      message: 'Sistem penyimpanan data permanen belum ditentukan.',
      severity: 'medium',
      recommendation: 'Pilih PostgreSQL, MySQL, Supabase, atau MongoDB sesuai kebutuhan relasi data.',
    });
  }

  if (req.apis && req.apis.length > 0) {
    score += 10;
  } else {
    missingItems.push({
      id: 'miss-apis',
      section: 'API & Integrasi',
      title: 'Endpoint API Belum Spesifik',
      message: 'Daftar endpoint REST/RPC untuk komunikasi frontend-backend belum dibuat.',
      severity: 'medium',
      recommendation: 'Definisikan endpoint penting (contoh: POST /api/auth/login, GET /api/items).',
    });
  }

  // 6. Security, Auth, Validation & Tech Stack (Weight: 20)
  if (req.auth?.type && req.auth.type.trim() !== '') {
    score += 5;
  } else {
    missingItems.push({
      id: 'miss-auth',
      section: 'Autentikasi',
      title: 'Metode Autentikasi Belum Dipilih',
      message: 'Cara pengguna masuk dan mengamankan sesi belum ditentukan.',
      severity: 'high',
      recommendation: 'Tentukan JWT Bearer, Session Cookie, atau Supabase/Firebase Auth.',
    });
  }

  if (req.techStack?.frontend && req.techStack.frontend.trim() !== '') {
    score += 5;
  }
  if (req.validations && req.validations.length > 0) {
    score += 5;
  } else {
    recommendations.push('Tambahkan aturan validasi Zod untuk mencegah payload kotor atau malformed input.');
  }

  if (req.security?.sanitization && req.security?.rateLimiting) {
    score += 5;
  }

  // CONFLICT DETECTIONS
  // Conflict 1: Multi-role exists, but Auth is missing or has no RBAC
  if (req.roles && req.roles.length > 1) {
    if (!req.auth?.rbacRules || req.auth.rbacRules.length === 0) {
      conflicts.push({
        id: 'conf-multirole-no-rbac',
        title: 'Konflik Role & Otorisasi',
        explanation: `Aplikasi memiliki ${req.roles.length} role (${req.roles.map(r => r.name).join(', ')}), namun tidak ada aturan RBAC (Role-Based Access Control) yang eksplisit.`,
        solution: 'Definisikan aturan RBAC pada section Autentikasi untuk mencegah privilege escalation.',
      });
    }
  }

  // Conflict 2: Protected pages exist, but no Auth defined
  const protectedPages = (req.pages || []).filter(p => p.authRequired);
  if (protectedPages.length > 0 && (!req.auth?.type || req.auth.type.toLowerCase().includes('none'))) {
    conflicts.push({
      id: 'conf-pages-auth',
      title: 'Halaman Terproteksi Tanpa Sistem Autentikasi',
      explanation: `Terdapat ${protectedPages.length} rute halaman yang ditandai 'Auth Wajib', namun tipe autentikasi belum diatur.`,
      solution: 'Aktifkan autentikasi JWT / Session dan terapkan Route Guard.',
    });
  }

  // Conflict 3: E-commerce / transaction features exist, but no Payment or Order Table
  const hasPaymentFeature = (req.modules || []).some(m => 
    (m.features || []).some(f => /bayar|payment|checkout|transaksi|midtrans|stripe|duitku/i.test(f))
  );
  if (hasPaymentFeature) {
    const hasOrderTable = (req.database?.tables || []).some(t => /order|transaksi|pembayaran|payment|invoice/i.test(t.name));
    if (!hasOrderTable) {
      conflicts.push({
        id: 'conf-payment-no-table',
        title: 'Fitur Transaksi Tanpa Tabel Data Transaksi',
        explanation: 'Modul menyebutkan fitur pembayaran/checkout, namun tidak ditemukan tabel order/transaksi di skema database.',
        solution: 'Tambahkan tabel "transactions" atau "orders" dengan relasi ke user dan status pembayaran.',
      });
    }
    const hasPaymentIntegration = (req.integrations || []).some(ig => /midtrans|stripe|xendit|paypal/i.test(ig.name));
    if (!hasPaymentIntegration) {
      recommendations.push('Fitur pembayaran terdeteksi. Pertimbangkan menambah integrasi Midtrans / Stripe pada Third Party Integrations.');
    }
  }

  // General recommendations based on completion
  if (score < 50) {
    recommendations.push('Gunakan tombol "Lengkapi Otomatis dengan AI" untuk mengisi detail arsitektur yang belum lengkap.');
  } else if (score < 80) {
    recommendations.push('Perjelas tipe data skema database dan contoh JSON response API agar AI coding dapat langsung membuat mocking data yang presisi.');
  } else {
    recommendations.push('Spesifikasi sangat matang! Prompt siap disalin ke Google AI Studio, Cursor, Claude, atau ChatGPT.');
  }

  // Detect domain
  const fullText = `${req.name} ${req.description} ${req.targetUsers} ${(req.modules || []).map(m => m.name).join(' ')}`.toLowerCase();
  let detectedDomain = 'Aplikasi Web Umum';
  if (/sekolah|akademik|guru|siswa|rapor|mapel|kelas|siakad/i.test(fullText)) {
    detectedDomain = 'Sistem Informasi Akademik Sekolah';
  } else if (/toko|belanja|cart|produk|checkout|ecommerce|penjual|vendor/i.test(fullText)) {
    detectedDomain = 'E-Commerce & Toko Online';
  } else if (/klinik|pasien|dokter|rekam medis|obat|resepsionis|hospital/i.test(fullText)) {
    detectedDomain = 'Klinik & Rekam Medis (e-RME)';
  } else if (/crm|leads|sales|prospek|pipa penjualan|pipeline|deal/i.test(fullText)) {
    detectedDomain = 'SaaS CRM & Sales Pipeline';
  } else if (/kasir|pos|point of sale|inventori|stok|barcode/i.test(fullText)) {
    detectedDomain = 'Point of Sale (POS) & Inventori';
  } else if (/tugas|project|kanban|task|sprint|agile/i.test(fullText)) {
    detectedDomain = 'Project & Task Management';
  } else if (/kos|sewa|tenant|properti|kamar/i.test(fullText)) {
    detectedDomain = 'Manajemen Indekos & Properti Sewa';
  }

  return {
    completenessScore: Math.min(100, Math.max(0, score)),
    missingItems,
    conflicts,
    recommendations,
    detectedDomain,
    lastAnalyzed: new Date().toISOString(),
  };
}

export function generateDomainHeuristicRequirement(idea: string, currentReq?: AppRequirement): AppRequirement {
  const expansion = smartDomainExpansion(idea);
  const base = currentReq || ({} as AppRequirement);
  return {
    ...base,
    ...expansion,
    id: base.id || `req-${Date.now()}`,
    updatedAt: new Date().toISOString(),
  } as AppRequirement;
}

export function smartDomainExpansion(idea: string): Partial<AppRequirement> {
  const text = idea.toLowerCase();

  // Academic / School
  if (/sekolah|akademik|guru|siswa|siakad|pendidikan|rapor|absensi|ujian/i.test(text)) {
    return {
      name: 'SIAKAD Prestasi - Sistem Informasi Akademik Sekolah Terpadu',
      tagline: 'Platform Pengelolaan Data Nilai, Absensi, Jadwal, dan Portal Siswa-Guru',
      description: 'Aplikasi web akademik komprehensif untuk mendigitalkan seluruh administrasi sekolah, mulai dari pendataan siswa dan guru, penjadwalan kelas, pencatatan absensi harian berbasis barcode/web, input nilai ujian, hingga penerbitan e-Rapor dan portal komunikasi orang tua siswa.',
      targetUsers: 'Guru pengajar, wali kelas, siswa sekolah, orang tua siswa, dan staf tata usaha / Super Admin sekolah.',
      roles: [
        {
          id: 'r-1',
          name: 'Super Admin / Tata Usaha',
          description: 'Mengelola seluruh master data, akun pengguna, tahun akademik, kurikulum, dan konfigurasi sistem.',
          permissions: ['manage:users', 'manage:academic-years', 'manage:classes', 'manage:curriculum', 'view:audit-logs'],
        },
        {
          id: 'r-2',
          name: 'Guru Mata Pelajaran',
          description: 'Menginput absensi kehadiran siswa, mengelola materi pelajaran, dan menginput nilai tugas serta ujian.',
          permissions: ['input:attendance', 'input:grades', 'view:student-roster', 'create:assignments'],
        },
        {
          id: 'r-3',
          name: 'Wali Kelas',
          description: 'Memonitor rekapitulasi kehadiran kelas binaan, memberikan catatan sikap, dan mencetak e-Rapor siswa.',
          permissions: ['view:class-analytics', 'input:homeroom-notes', 'generate:report-cards'],
        },
        {
          id: 'r-4',
          name: 'Siswa / Orang Tua',
          description: 'Melihat jadwal pelajaran harian, memantau absensi kehadiran, dan melihat rekapitulasi nilai rapor.',
          permissions: ['view:own-schedule', 'view:own-attendance', 'view:own-grades'],
        },
      ],
      modules: [
        {
          id: 'm-1',
          name: 'Master Data & Kurikulum',
          priority: 'High',
          features: ['Manajemen Tahun Ajaran & Semester Aktif', 'Data Kelas & Rombel', 'Data Mata Pelajaran & Bobot Nilai', 'Alokasi Guru Pengampu per Kelas'],
        },
        {
          id: 'm-2',
          name: 'Presensi & Absensi Siswa',
          priority: 'High',
          features: ['Input Absensi Harian (Hadir, Sakit, Izin, Alpa)', 'Rekapitulasi Kehadiran per Bulan', 'Notifikasi Ketidakhadiran ke Portal Orang Tua', 'Export Rekap Absensi ke Excel/PDF'],
        },
        {
          id: 'm-3',
          name: 'Pengelolaan Nilai & e-Rapor',
          priority: 'High',
          features: ['Input Nilai Formatif & Sumatif', 'Perhitungan Nilai Akhir Otomatis Berdasarkan Bobot', 'Cetak e-Rapor Format Standar Kurikulum Nasional', 'Ranking & Analisis Ketuntasan Siswa'],
        },
        {
          id: 'm-4',
          name: 'Jadwal & Agenda Sekolah',
          priority: 'Medium',
          features: ['Kalender Akademik Interaktif', 'Jadwal Pelajaran Mingguan per Kelas', 'Pengumuman Penting Sekolah'],
        },
      ],
      userFlows: [
        'Admin login, mengonfigurasi tahun ajaran baru, mendata guru, siswa, kelas, dan jadwal mengajar.',
        'Guru masuk ke dashboard, memilih kelas dan mata pelajaran yang diampu hari ini.',
        'Guru mencatat absensi siswa dan menginput nilai tugas/ujian secara real-time.',
        'Wali kelas meninjau nilai seluruh mapel, menambahkan catatan kepribadian, lalu menerbitkan e-Rapor.',
        'Siswa dan orang tua masuk ke portal untuk melihat rekap kehadiran dan download e-Rapor semester.',
      ],
      pages: [
        { id: 'p-1', path: '/login', name: 'Halaman Login', description: 'Autentikasi dengan NISN/NIP dan Password', authRequired: false, allowedRoles: [] },
        { id: 'p-2', path: '/dashboard', name: 'Dashboard Utama', description: 'Statistik sekolah, jadwal hari ini, ringkasan kehadiran', authRequired: true, allowedRoles: ['Super Admin', 'Guru', 'Wali Kelas', 'Siswa'] },
        { id: 'p-3', path: '/students', name: 'Data Siswa & Rombel', description: 'Manajemen direktori siswa dan pembagian kelas', authRequired: true, allowedRoles: ['Super Admin', 'Wali Kelas'] },
        { id: 'p-4', path: '/attendance', name: 'Presensi Harian', description: 'Formulir input dan riwayat absensi kelas', authRequired: true, allowedRoles: ['Super Admin', 'Guru'] },
        { id: 'p-5', path: '/grading', name: 'Buku Nilai & Rapor', description: 'Input nilai tugas, UTS, UAS, dan cetak rapor', authRequired: true, allowedRoles: ['Super Admin', 'Guru', 'Wali Kelas'] },
        { id: 'p-6', path: '/portal-siswa', name: 'Portal Siswa/Ortu', description: 'Informasi nilai, presensi, dan jadwal siswa pribadi', authRequired: true, allowedRoles: ['Siswa'] },
      ],
      database: {
        type: 'PostgreSQL',
        orm: 'Prisma ORM',
        tables: [
          {
            id: 't-1',
            name: 'users',
            description: 'Data akun seluruh pemangku kepentingan sekolah',
            columns: [
              { name: 'id', type: 'UUID (PK)', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()' },
              { name: 'identifier', type: 'VARCHAR(50)', constraints: 'UNIQUE, NOT NULL // NISN atau NIP' },
              { name: 'name', type: 'VARCHAR(150)', constraints: 'NOT NULL' },
              { name: 'email', type: 'VARCHAR(100)', constraints: 'UNIQUE, NULLABLE' },
              { name: 'password_hash', type: 'VARCHAR(255)', constraints: 'NOT NULL' },
              { name: 'role', type: 'ENUM', constraints: "NOT NULL // 'ADMIN', 'TEACHER', 'HOMEROOM', 'STUDENT'" },
              { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP' },
            ],
          },
          {
            id: 't-2',
            name: 'students',
            description: 'Profil detail biodata siswa dan kelas aktif',
            columns: [
              { name: 'id', type: 'UUID (PK)', constraints: 'PRIMARY KEY' },
              { name: 'user_id', type: 'UUID (FK)', constraints: 'REFERENCES users(id) ON DELETE CASCADE' },
              { name: 'nisn', type: 'VARCHAR(20)', constraints: 'UNIQUE, NOT NULL' },
              { name: 'class_id', type: 'UUID (FK)', constraints: 'REFERENCES classes(id)' },
              { name: 'gender', type: 'CHAR(1)', constraints: 'NOT NULL' },
              { name: 'parent_phone', type: 'VARCHAR(20)', constraints: 'NULLABLE' },
            ],
          },
          {
            id: 't-3',
            name: 'attendance',
            description: 'Catatan presensi harian per siswa per mata pelajaran / harian',
            columns: [
              { name: 'id', type: 'UUID (PK)', constraints: 'PRIMARY KEY' },
              { name: 'student_id', type: 'UUID (FK)', constraints: 'REFERENCES students(id)' },
              { name: 'date', type: 'DATE', constraints: 'NOT NULL' },
              { name: 'status', type: 'ENUM', constraints: "'HADIR', 'SAKIT', 'IZIN', 'ALPA'" },
              { name: 'notes', type: 'TEXT', constraints: 'NULLABLE' },
              { name: 'recorded_by', type: 'UUID (FK)', constraints: 'REFERENCES users(id)' },
            ],
          },
          {
            id: 't-4',
            name: 'grades',
            description: 'Pencatatan nilai per mata pelajaran dan semester',
            columns: [
              { name: 'id', type: 'UUID (PK)', constraints: 'PRIMARY KEY' },
              { name: 'student_id', type: 'UUID (FK)', constraints: 'REFERENCES students(id)' },
              { name: 'subject_id', type: 'UUID (FK)', constraints: 'REFERENCES subjects(id)' },
              { name: 'academic_term_id', type: 'UUID (FK)', constraints: 'REFERENCES academic_terms(id)' },
              { name: 'score_assignment', type: 'NUMERIC(5,2)', constraints: 'DEFAULT 0' },
              { name: 'score_midterm', type: 'NUMERIC(5,2)', constraints: 'DEFAULT 0' },
              { name: 'score_final', type: 'NUMERIC(5,2)', constraints: 'DEFAULT 0' },
              { name: 'final_score', type: 'NUMERIC(5,2)', constraints: 'NOT NULL' },
            ],
          },
        ],
      },
      apis: [
        { id: 'a-1', method: 'POST', path: '/api/auth/login', description: 'Autentikasi dengan NIP/NISN & password', authRequired: false },
        { id: 'a-2', method: 'GET', path: '/api/students', description: 'Mendapatkan daftar siswa dengan filter kelas', authRequired: true },
        { id: 'a-3', method: 'POST', path: '/api/attendance/bulk', description: 'Simpan presensi kelas sekaligus', authRequired: true },
        { id: 'a-4', method: 'POST', path: '/api/grades/batch', description: 'Simpan nilai ujian per kelas', authRequired: true },
        { id: 'a-5', method: 'GET', path: '/api/reports/rapor/:studentId', description: 'Generate e-rapor PDF', authRequired: true },
      ],
      auth: {
        type: 'JWT Bearer Token dengan HTTP-Only Cookie',
        mechanism: 'Bcrypt password hashing (salt 12) + Stateless Access Token (1 jam) & Refresh Token (7 hari)',
        rbacRules: [
          'Siswa hanya dapat membaca data milik dirinya sendiri (Row Level Security / User ID filtering).',
          'Guru hanya dapat menginput nilai untuk kelas dan mata pelajaran yang ditugaskan padanya.',
          'Wali kelas dapat mengesahkan rapor siswa di kelas binaannya.',
          'Super Admin memiliki hak akses CRUD menyeluruh terhadap semua master data.',
        ],
      },
      techStack: {
        frontend: 'React 19 + TypeScript + Vite',
        backend: 'Node.js (Express.js) dengan TypeScript',
        styling: 'Tailwind CSS utility-first',
        stateManagement: 'TanStack React Query + Zustand',
        runtime: 'Node.js LTS (v20+)',
        additionalLibraries: ['Lucide React', 'Zod', 'jspdf (untuk e-rapor)', 'date-fns'],
      },
      uiUx: {
        designStyle: 'Enterprise Academic Dashboard',
        colorTheme: 'Slate 900 background dengan Indigo/Emerald accents',
        fontFamily: 'Plus Jakarta Sans (UI) & JetBrains Mono (Kode/Angka)',
        componentLibrary: 'Tailwind CSS + Lucide React',
        layoutPattern: 'Collapsible Sidebar + Breadcrumb Navigation + Data Tables',
        density: 'Compact (Productivity)',
      },
      responsive: {
        mobileNavigation: 'Bottom Navigation Bar untuk Siswa/Guru & Hamburger Menu untuk Admin',
        breakpoints: 'sm: 640px, md: 768px, lg: 1024px, xl: 1280px',
        touchTargetsMinSize: 'Min 44x44px untuk tombol presensi cepat',
        desktopOptimizations: 'Tabel keyboard navigation, spreadsheet-like quick grade input, split view',
      },
      security: {
        sanitization: true,
        rateLimiting: true,
        csrfProtection: true,
        corsPolicy: 'Hanya izinkan domain aplikasi terdaftar',
        dataValidation: 'Zod schema validation pada setiap request body',
        storageEncryption: 'Hash password dengan bcrypt salt round 12',
        authGuards: 'Express middleware verifyToken & checkRole',
      },
    };
  }

  // E-Commerce
  if (/toko|belanja|cart|produk|checkout|ecommerce|jual|beli|katalog/i.test(text)) {
    return {
      name: 'ModernMart - Platform E-Commerce & Toko Online',
      tagline: 'Sistem Toko Online Cepat dengan Keranjang, Checkout, dan Payment Gateway',
      description: 'Aplikasi web e-commerce lengkap untuk penjualan produk dengan katalog interaktif, pencarian & filter faceted, keranjang belanja real-time, integrasi gateway pembayaran Midtrans/Stripe, lacak pengiriman pesanan, serta dashboard manajemen stok dan analitik penjualan untuk penjual.',
      targetUsers: 'Pembeli umum, pemilik toko (Admin Toko), dan tim fulfillment gudang.',
      roles: [
        {
          id: 'r-1',
          name: 'Customer / Pembeli',
          description: 'Menjelajahi produk, menambahkan ke wishlist/keranjang, checkout, dan melacak pesanan.',
          permissions: ['view:products', 'manage:cart', 'create:orders', 'view:own-orders'],
        },
        {
          id: 'r-2',
          name: 'Store Admin / Merchant',
          description: 'Mengelola katalog produk, stok, kategori, promosi kupon, dan melihat analitik omset.',
          permissions: ['manage:products', 'manage:inventory', 'update:order-status', 'view:analytics'],
        },
      ],
      modules: [
        {
          id: 'm-1',
          name: 'Katalog & Pencarian Produk',
          priority: 'High',
          features: ['Pencarian Real-Time (Instant Search)', 'Filter berdasarkan Kategori, Rentang Harga, dan Rating', 'Halaman Detail Produk dengan Galeri Gambar & Variasi Ukuran/Warna'],
        },
        {
          id: 'm-2',
          name: 'Keranjang & Checkout',
          priority: 'High',
          features: ['Keranjang Belanja Persisten (LocalStorage + Database sync)', 'Kalkulasi Ongkos Kirim Otomatis', 'Integrasi Payment Gateway (QRIS, VA Bank, E-Wallet)', 'Input Kupon Diskon'],
        },
        {
          id: 'm-3',
          name: 'Manajemen Pesanan & Fulfillment',
          priority: 'High',
          features: ['Status Pesanan Realtime (Menunggu Pembayaran, Diproses, Dikirim, Selesai)', 'Input Nomor Resi Kurir', 'Notifikasi Status Pesanan ke Email/WA'],
        },
      ],
      userFlows: [
        'Pembeli menelusuri katalog, menyaring produk sesuai kategori, dan menambahkan ke keranjang.',
        'Pembeli membuka checkout, memasukkan alamat pengiriman, dan memilih kurir.',
        'Pembeli membayar melalui Payment Gateway menggunakan QRIS atau Virtual Account.',
        'Webhook pembayaran memperbarui status pesanan menjadi PAID secara otomatis.',
        'Admin toko memproses order, mengemas produk, dan menginput nomor resi pelacakan.',
      ],
      database: {
        type: 'PostgreSQL',
        orm: 'Prisma ORM',
        tables: [
          {
            id: 't-1',
            name: 'products',
            description: 'Data katalog produk dan inventori stok',
            columns: [
              { name: 'id', type: 'UUID (PK)', constraints: 'PRIMARY KEY' },
              { name: 'title', type: 'VARCHAR(200)', constraints: 'NOT NULL' },
              { name: 'slug', type: 'VARCHAR(220)', constraints: 'UNIQUE, NOT NULL' },
              { name: 'price', type: 'DECIMAL(12,2)', constraints: 'NOT NULL' },
              { name: 'stock', type: 'INTEGER', constraints: 'DEFAULT 0' },
              { name: 'images', type: 'TEXT[]', constraints: 'NOT NULL' },
            ],
          },
          {
            id: 't-2',
            name: 'orders',
            description: 'Catatan transaksi checkout pembeli',
            columns: [
              { name: 'id', type: 'UUID (PK)', constraints: 'PRIMARY KEY' },
              { name: 'user_id', type: 'UUID (FK)', constraints: 'REFERENCES users(id)' },
              { name: 'total_amount', type: 'DECIMAL(12,2)', constraints: 'NOT NULL' },
              { name: 'payment_status', type: 'ENUM', constraints: "'PENDING', 'PAID', 'FAILED', 'EXPIRED'" },
              { name: 'shipping_status', type: 'ENUM', constraints: "'PROCESSING', 'SHIPPED', 'DELIVERED'" },
            ],
          },
        ],
      },
      auth: {
        type: 'OAuth 2.0 (Google) + Email Password JWT',
        mechanism: 'Secure cookie session dengan refresh token rotation',
        rbacRules: ['Customer hanya bisa akses data cart dan order miliknya sendiri.', 'Admin toko memiliki akses ke endpoint inventori dan update order.'],
      },
      techStack: {
        frontend: 'React 19 + TypeScript + Tailwind CSS',
        backend: 'Node.js Express dengan Prisma ORM',
        styling: 'Tailwind CSS',
        stateManagement: 'Zustand (Cart State) + React Query',
        runtime: 'Node.js LTS',
        additionalLibraries: ['Lucide React', 'Zod', 'Midtrans Client Node'],
      },
      uiUx: {
        designStyle: 'Modern Clean Retail E-Commerce',
        colorTheme: 'High contrast light/dark mode dengan Brand Amber/Emerald',
        fontFamily: 'Plus Jakarta Sans',
        componentLibrary: 'Tailwind CSS + Lucide React',
        layoutPattern: 'Header Nav + Sticky Filter Sidebar + Product Grid',
        density: 'Comfortable (Standard)',
      },
      responsive: {
        mobileNavigation: 'Bottom Sticky Bar dengan icon Cart counter dan Quick Checkout',
        breakpoints: 'sm: 640px, md: 768px, lg: 1024px',
        touchTargetsMinSize: 'Min 48x48px untuk tombol Tambah ke Keranjang dan Beli Sekarang',
        desktopOptimizations: 'Hover zoom gambar produk, multi-column checkout, quick drawer cart preview',
      },
      security: {
        sanitization: true,
        rateLimiting: true,
        csrfProtection: true,
        corsPolicy: 'Whitelist domain produksi saja',
        dataValidation: 'Zod schema validation pada transaksi checkout',
        storageEncryption: 'Webhook signature verification untuk payment gateway callback',
        authGuards: 'Bearer token verification',
      },
    };
  }

  // Clinic / Healthcare
  if (/klinik|pasien|dokter|rekam medis|obat|kesehatan|janji temu/i.test(text)) {
    return {
      name: 'MediCare - Sistem Informasi Klinik & Rekam Medis Elektronik',
      tagline: 'Manajemen Antrean Pasien, Konsultasi Dokter, dan e-RME Terstandar',
      description: 'Sistem informasi klinik terintegrasi untuk pendaftaran pasien mandiri, pemanggilan antrean poliklinik real-time, pengisian Rekam Medis Elektronik format SOAP oleh dokter, peresepan obat digital ke apotek, dan kasir billing pembayaran.',
      targetUsers: 'Dokter spesialis/umum, perawat/resepsionis, petugas farmasi/apoteker, kasir, dan pasien.',
      roles: [
        {
          id: 'r-1',
          name: 'Resepsionis / Pendaftaran',
          description: 'Mendaftarkan pasien baru/lama, memeriksa kelengkapan identitas, dan menerbitkan nomor antrean poli.',
          permissions: ['create:patient', 'issue:queue-ticket', 'view:doctor-schedule'],
        },
        {
          id: 'r-2',
          name: 'Dokter',
          description: 'Memanggil pasien, memeriksa riwayat medis, mengisi catatan SOAP, dan meresepkan obat.',
          permissions: ['read:medical-records', 'write:soap-notes', 'prescribe:medication'],
        },
        {
          id: 'r-3',
          name: 'Apoteker / Farmasi',
          description: 'Menerima resep digital, menyiapkan obat, dan memperbarui status penyerahan resep.',
          permissions: ['dispense:medication', 'manage:medicine-inventory'],
        },
      ],
      modules: [
        {
          id: 'm-1',
          name: 'Antrean & Pendaftaran Pasien',
          priority: 'High',
          features: ['Input Data Pasien (NIK, No BPJS, Rekam Medis)', 'Display Layar Antrean Poli Real-Time dengan Panggilan Suara', 'Jadwal Praktek Dokter Aktif'],
        },
        {
          id: 'm-2',
          name: 'Rekam Medis Elektronik (e-RME) SOAP',
          priority: 'High',
          features: ['Subjektif (Keluhan Pasien)', 'Objektif (Tensi, Nadi, Suhu, BB/TB)', 'Asesmen (Diagnosis ICD-10)', 'Plan (Tindakan & Resep Obat Elektronik)'],
        },
      ],
      database: {
        type: 'PostgreSQL',
        orm: 'Prisma ORM',
        tables: [
          {
            id: 't-1',
            name: 'patients',
            description: 'Data rekam medis induk identitas pasien',
            columns: [
              { name: 'id', type: 'UUID (PK)', constraints: 'PRIMARY KEY' },
              { name: 'medical_record_number', type: 'VARCHAR(20)', constraints: 'UNIQUE, NOT NULL' },
              { name: 'nik', type: 'VARCHAR(16)', constraints: 'UNIQUE, NOT NULL' },
              { name: 'full_name', type: 'VARCHAR(150)', constraints: 'NOT NULL' },
              { name: 'date_of_birth', type: 'DATE', constraints: 'NOT NULL' },
            ],
          },
        ],
      },
      auth: {
        type: 'JWT Session dengan Role RBAC Ketat',
        mechanism: 'Session cookie dengan audit log akses data rekam medis pasien',
        rbacRules: ['Catatan medis pasien hanya dapat diakses oleh dokter yang menangani konsultasi aktif.'],
      },
      techStack: {
        frontend: 'React 19 + TypeScript + Vite',
        backend: 'Node.js Express + WebSocket (untuk display antrean)',
        styling: 'Tailwind CSS',
        stateManagement: 'Zustand + TanStack Query',
        runtime: 'Node.js LTS',
        additionalLibraries: ['Lucide React', 'Zod', 'date-fns'],
      },
      uiUx: {
        designStyle: 'Clean Medical UI',
        colorTheme: 'Teal & Slate high-contrast',
        fontFamily: 'Plus Jakarta Sans',
        componentLibrary: 'Tailwind CSS + Lucide Icons',
        layoutPattern: 'Split Screen Consultation View',
        density: 'Compact (Productivity)',
      },
      responsive: {
        mobileNavigation: 'Tablet optimized for doctors and mobile queue tracker for patients',
        breakpoints: 'sm: 640px, md: 768px, lg: 1024px',
        touchTargetsMinSize: 'Min 44x44px',
        desktopOptimizations: 'Dual-monitor support untuk layar panggil antrean',
      },
      security: {
        sanitization: true,
        rateLimiting: true,
        csrfProtection: true,
        corsPolicy: 'Strict hospital network policy',
        dataValidation: 'Zod schema validation',
        storageEncryption: 'Enkripsi data identitas pasien',
        authGuards: 'Multi-level role guards',
      },
    };
  }

  // Fallback / General Web App Heuristic
  return {
    name: idea.length > 5 ? `Aplikasi ${idea.slice(0, 30).trim()}` : 'Web Application Platform',
    tagline: 'Aplikasi Web Modern Terstruktur dengan Arsitektur Skalabel',
    description: idea || 'Platform web terintegrasi untuk mengoptimalkan alur operasional dan manajemen data pengguna secara real-time.',
    targetUsers: 'Pengguna terdaftar, staf operasional, dan Administrator sistem.',
    roles: [
      {
        id: 'r-1',
        name: 'Super Administrator',
        description: 'Pemegang hak akses penuh terhadap seluruh konfigurasi, user accounts, dan audit logs.',
        permissions: ['manage:all', 'manage:users', 'view:system-logs'],
      },
      {
        id: 'r-2',
        name: 'User / Anggota',
        description: 'Pengguna aktif yang memanfaatkan fungsionalitas inti aplikasi.',
        permissions: ['read:own-data', 'write:own-data'],
      },
    ],
    modules: [
      {
        id: 'm-1',
        name: 'Autentikasi & Profil Pengguna',
        priority: 'High',
        features: ['Registrasi & Login Akun', 'Manajemen Profil & Ganti Password', 'Verifikasi Sesi & Proteksi Rute'],
      },
      {
        id: 'm-2',
        name: 'Dashboard & Fungsionalitas Inti',
        priority: 'High',
        features: ['Tampilan Ringkasan Metrik / Statistik', 'Manajemen Data Utama (CRUD)', 'Pencarian, Filter, dan Paginasi Data'],
      },
      {
        id: 'm-3',
        name: 'Laporan & Pengaturan',
        priority: 'Medium',
        features: ['Export Data ke CSV/Excel', 'Pengaturan Preferensi Pengguna & Tema', 'Notifikasi Sistem'],
      },
    ],
    userFlows: [
      'Pengguna membuka aplikasi dan melakukan autentikasi login.',
      'Sistem mengarahkan pengguna ke dashboard sesuai role yang dimiliki.',
      'Pengguna melakukan input atau modifikasi data utama melalui form interaktif.',
      'Sistem memvalidasi data di sisi client dan server, lalu menyimpannya ke database.',
      'Pengguna menerima feedback notifikasi instan berupa toast success.',
    ],
    database: {
      type: 'PostgreSQL',
      orm: 'Prisma ORM',
      tables: [
        {
          id: 't-1',
          name: 'users',
          description: 'Data akun pengguna sistem',
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
    auth: {
      type: 'JWT Bearer Token dengan Secure Storage',
      mechanism: 'Bcrypt hashing + JWT access token & refresh token rotation',
      rbacRules: ['User hanya dapat mengubah data miliknya sendiri.', 'Admin dapat mengakses dan mengelola seluruh data.'],
    },
    techStack: {
      frontend: 'React 19 + TypeScript + Vite',
      backend: 'Node.js Express + TypeScript',
      styling: 'Tailwind CSS',
      stateManagement: 'Zustand + React Query',
      runtime: 'Node.js LTS',
      additionalLibraries: ['Lucide React', 'Zod'],
    },
    uiUx: {
      designStyle: 'Modern Minimalist Clean Dark/Light UI',
      colorTheme: 'Slate & Indigo palette',
      fontFamily: 'Plus Jakarta Sans',
      componentLibrary: 'Tailwind CSS + Lucide React',
      layoutPattern: 'Sidebar Navigation + Header + Main Card Container',
      density: 'Comfortable (Standard)',
    },
    responsive: {
      mobileNavigation: 'Collapsible Drawer / Sheet Menu',
      breakpoints: 'sm: 640px, md: 768px, lg: 1024px',
      touchTargetsMinSize: 'Min 44x44px',
      desktopOptimizations: 'Multi-column grid, table row actions, quick filter chips',
    },
    security: {
      sanitization: true,
      rateLimiting: true,
      csrfProtection: true,
      corsPolicy: 'Origin whitelist domain aplikasi',
      dataValidation: 'Zod schema validation',
      storageEncryption: 'Password hashing bcrypt 12 rounds',
      authGuards: 'JWT auth middleware',
    },
  };
}

export function resolveMissingItem(req: AppRequirement, item: MissingItem): AppRequirement {
  const clone: AppRequirement = JSON.parse(JSON.stringify(req));

  switch (item.id) {
    case 'miss-name':
      clone.name = clone.description
        ? `Aplikasi ${clone.description.slice(0, 24).trim()}`
        : 'Web Application Pro';
      break;

    case 'miss-desc':
      clone.description = 'Aplikasi web modern untuk mengotomasi alur kerja pengguna, manajemen data terpusat, dan kolaborasi tim secara real-time.';
      break;

    case 'miss-users':
      clone.targetUsers = 'Pengguna umum, staf operasional, dan Administrator sistem.';
      break;

    case 'miss-roles':
      clone.roles = [
        { id: `r-${Date.now()}-1`, name: 'Admin', description: 'Pengelola penuh sistem dan konfigurasi', permissions: ['manage:all'] },
        { id: `r-${Date.now()}-2`, name: 'User', description: 'Pengguna utama aplikasi', permissions: ['read:data', 'write:data'] },
      ];
      break;

    case 'miss-modules':
      clone.modules = [
        { id: `m-${Date.now()}-1`, name: 'Autentikasi & Akun', priority: 'High', features: ['Registrasi & Login', 'Manajemen Profil', 'Proteksi Sesi'] },
        { id: `m-${Date.now()}-2`, name: 'Manajemen Data Utama', priority: 'High', features: ['Daftar Data & Filter', 'Form Tambah & Edit', 'Export Laporan'] },
      ];
      break;

    case 'miss-flows':
      clone.userFlows = [
        'Pengguna membuka aplikasi dan melakukan login.',
        'Sistem memvalidasi kredensial dan menampilkan dashboard.',
        'Pengguna mengelola data utama dan menyimpan perubahan.',
        'Sistem memvalidasi data dan memberikan notifikasi sukses.',
      ];
      break;

    case 'miss-pages':
      clone.pages = [
        { id: `p-${Date.now()}-1`, path: '/login', name: 'Login', description: 'Halaman masuk pengguna', authRequired: false, allowedRoles: [] },
        { id: `p-${Date.now()}-2`, path: '/dashboard', name: 'Dashboard', description: 'Halaman dashboard utama', authRequired: true, allowedRoles: ['Admin', 'User'] },
        { id: `p-${Date.now()}-3`, path: '/settings', name: 'Pengaturan', description: 'Pengaturan profil dan akun', authRequired: true, allowedRoles: ['Admin', 'User'] },
      ];
      break;

    case 'miss-db':
      clone.database.type = 'PostgreSQL';
      clone.database.orm = 'Prisma ORM';
      break;

    case 'miss-db-tables':
      if (!clone.database.tables || clone.database.tables.length === 0) {
        clone.database.tables = [
          {
            id: `t-${Date.now()}-1`,
            name: 'users',
            description: 'Data akun pengguna',
            columns: [
              { name: 'id', type: 'UUID (PK)', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()' },
              { name: 'email', type: 'VARCHAR(120)', constraints: 'UNIQUE, NOT NULL' },
              { name: 'name', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
              { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP' },
            ],
          },
          {
            id: `t-${Date.now()}-2`,
            name: 'items',
            description: 'Data entitas utama aplikasi',
            columns: [
              { name: 'id', type: 'UUID (PK)', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()' },
              { name: 'user_id', type: 'UUID (FK)', constraints: 'REFERENCES users(id)' },
              { name: 'title', type: 'VARCHAR(255)', constraints: 'NOT NULL' },
              { name: 'status', type: 'VARCHAR(50)', constraints: "DEFAULT 'ACTIVE'" },
              { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP' },
            ],
          },
        ];
      }
      break;

    case 'miss-apis':
      clone.apis = [
        { id: `a-${Date.now()}-1`, method: 'POST', path: '/api/auth/login', description: 'Login pengguna', authRequired: false },
        { id: `a-${Date.now()}-2`, method: 'GET', path: '/api/items', description: 'Ambil daftar entitas', authRequired: true },
        { id: `a-${Date.now()}-3`, method: 'POST', path: '/api/items', description: 'Buat entitas baru', authRequired: true },
      ];
      break;

    case 'miss-auth':
      clone.auth.type = 'JWT Bearer Token dengan HTTP-Only Cookie';
      clone.auth.mechanism = 'Bcrypt password hashing (salt round 12) + JWT session verification';
      clone.auth.rbacRules = [
        'User hanya dapat mengakses dan memodifikasi data miliknya sendiri.',
        'Admin memiliki izin penuh untuk mengelola semua data dan master setting.',
      ];
      break;

    case 'miss-sec':
    case 'miss-sec-sanitize':
      clone.security.sanitization = true;
      clone.security.rateLimiting = true;
      clone.security.csrfProtection = true;
      clone.security.dataValidation = 'Zod schema validation';
      break;

    case 'miss-tech':
      clone.techStack.frontend = 'React 19 + TypeScript + Vite';
      clone.techStack.backend = 'Node.js Express + TypeScript';
      clone.techStack.styling = 'Tailwind CSS';
      clone.techStack.stateManagement = 'Zustand + React Query';
      break;

    default:
      break;
  }

  clone.updatedAt = new Date().toISOString();
  return clone;
}

