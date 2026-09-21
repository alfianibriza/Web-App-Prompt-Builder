import { AppRequirement } from '../types/prompt';

export interface PromptSection {
  number: number;
  title: string;
  tag: string;
  content: string;
}

export function generatePromptSections(req: AppRequirement): PromptSection[] {
  const needsDefinition = (val?: string | null, fieldName = 'spesifikasi') => {
    if (!val || val.trim() === '') {
      return `[Perlu Ditentukan: ${fieldName}]`;
    }
    return val.trim();
  };

  const sections: PromptSection[] = [];

  // 1. ROLE AI
  const roleAiContent = `Anda adalah Senior Principal Full-Stack Software Engineer, System Architect, dan Production-Grade Code Generator.
Tugas Anda adalah menulis dan merancang arsitektur kode lengkap, aman, modular, dan siap digunakan (production-ready) untuk aplikasi web "${req.name || '[Perlu Ditentukan: Nama Aplikasi]'}".
Ikuti seluruh batasan teknis, arsitektur, pola desain, serta instruksi implementasi berikut dengan sangat ketat tanpa mengabaikan detail keamanan atau menyisakan placeholder kosong.`;
  sections.push({ number: 1, title: 'ROLE AI', tag: 'ROLE_AI', content: roleAiContent });

  // 2. KONTEKS PROYEK
  const konteksContent = `Nama Proyek: ${req.name || '[Perlu Ditentukan: Nama Proyek]'}
Tagline / Kategori: ${req.tagline || req.description?.slice(0, 60) || '[Perlu Ditentukan: Kategori Proyek]'}
Target AI Tool: ${req.targetAiTool || 'Google AI Studio / Cursor / Claude'}
Deskripsi Konteks:
${needsDefinition(req.description, 'Deskripsi konteks dan masalah yang diselesaikan aplikasi')}

Karakteristik Sistem:
- Berjalan sebagai aplikasi web modern yang cepat, aman, dan dapat diandalkan.
- Memprioritaskan integritas data, alur navigasi intuitif, dan pemisahan logika yang bersih (separation of concerns).`;
  sections.push({ number: 2, title: 'KONTEKS PROYEK', tag: 'KONTEKS_PROYEK', content: konteksContent });

  // 3. TUJUAN APLIKASI
  const tujuanContent = `Tujuan Utama Aplikasi:
${needsDefinition(req.description, 'Penjelasan spesifik tujuan bisnis/fungsional aplikasi')}

Key Success Metrics:
1. Mempermudah aktivitas pengguna target dalam mengelola operasional sistem secara real-time.
2. Meminimalkan kesalahan input data manual dengan validasi komprehensif di sisi klien dan server.
3. Memberikan transparansi informasi dan laporan yang akurat bagi setiap pemangku kepentingan.`;
  sections.push({ number: 3, title: 'TUJUAN APLIKASI', tag: 'TUJUAN_APLIKASI', content: tujuanContent });

  // 4. TARGET PENGGUNA
  const targetContent = `Target Pengguna Utama:
${needsDefinition(req.targetUsers, 'Profil target pengguna aplikasi (misal: Guru, Siswa, Admin Sekolah, Pelanggan, Vendor)')}

Karakteristik & Kebutuhan Pengguna:
- Menginginkan antarmuka yang bersih, responsif, dan mudah dipahami tanpa perlu pelatihan intensif.
- Membutuhkan alur kerja yang efisien dengan feedback visual yang jelas saat proses berlangsung.`;
  sections.push({ number: 4, title: 'TARGET PENGGUNA', tag: 'TARGET_PENGGUNA', content: targetContent });

  // 5. USER ROLE & PERMISSION
  let rolesContent = '';
  if (req.roles && req.roles.length > 0) {
    rolesContent = req.roles
      .map((r, i) => {
        const perms = r.permissions && r.permissions.length > 0 
          ? r.permissions.map(p => `    - ${p}`).join('\n')
          : '    - [Perlu Ditentukan: Rincian hak akses role ini]';
        return `### ${i + 1}. Role: ${r.name}
- Deskripsi: ${r.description || '[Perlu Ditentukan: Deskripsi tanggung jawab role]'}
- Hak Akses (Permissions):
${perms}`;
      })
      .join('\n\n');
  } else {
    rolesContent = `[Perlu Ditentukan: Daftar user role dan matriks permission belum didefinisikan secara spesifik]`;
  }
  sections.push({ number: 5, title: 'USER ROLE & PERMISSION', tag: 'USER_ROLE_PERMISSION', content: rolesContent });

  // 6. FITUR & MODUL
  let modulesContent = '';
  if (req.modules && req.modules.length > 0) {
    modulesContent = req.modules
      .map((m, i) => {
        const feats = m.features && m.features.length > 0
          ? m.features.map(f => `  * ${f}`).join('\n')
          : '  * [Perlu Ditentukan: Rincian sub-fitur modul ini]';
        return `#### Modul ${i + 1}: ${m.name}${m.priority ? ` [Priority: ${m.priority}]` : ''}
${m.description ? `Deskripsi: ${m.description}\n` : ''}Fitur Fungsional:
${feats}`;
      })
      .join('\n\n');
  } else {
    modulesContent = `[Perlu Ditentukan: Daftar modul dan fitur utama aplikasi]`;
  }
  sections.push({ number: 6, title: 'FITUR & MODUL', tag: 'FITUR_MODUL', content: modulesContent });

  // 7. USER FLOW
  let flowContent = '';
  if (req.userFlows && req.userFlows.length > 0) {
    flowContent = req.userFlows.map((f, i) => `${i + 1}. ${f}`).join('\n');
  } else {
    flowContent = `[Perlu Ditentukan: Alur kerja utama pengguna (User Flow end-to-end)]`;
  }
  sections.push({ number: 7, title: 'USER FLOW', tag: 'USER_FLOW', content: flowContent });

  // 8. STRUKTUR HALAMAN
  let pagesContent = '';
  if (req.pages && req.pages.length > 0) {
    pagesContent = req.pages
      .map(p => {
        const roles = p.allowedRoles && p.allowedRoles.length > 0 ? p.allowedRoles.join(', ') : 'Semua Role Terotentikasi';
        return `- \`${p.path}\` (${p.name}): ${p.description || 'Halaman fungsional'} | Auth: ${p.authRequired ? `Wajib (${roles})` : 'Publik'}`;
      })
      .join('\n');
  } else {
    pagesContent = `[Perlu Ditentukan: Pemetaan rute halaman dan struktur navigasi]`;
  }
  sections.push({ number: 8, title: 'STRUKTUR HALAMAN', tag: 'STRUKTUR_HALAMAN', content: pagesContent });

  // 9. DATABASE
  const isFirestore = (req.database?.type || '').toLowerCase().includes('firebase') || (req.database?.type || '').toLowerCase().includes('firestore');
  let dbContent = `Tipe Database: ${req.database?.type || '[Perlu Ditentukan: PostgreSQL / MySQL / Supabase / Firebase Firestore]'}
ORM / Query Layer: ${req.database?.orm || '[Perlu Ditentukan: Prisma / Drizzle / Firebase Web SDK / Native SQL]'}\n`;

  if (isFirestore) {
    dbContent += `Arsitektur Cloud: Cloud Firestore (NoSQL Document & Collection Store)
- Mode Akses: Firebase Client SDK (Modular: \`getFirestore\`, \`collection\`, \`doc\`, \`onSnapshot\`, \`setDoc\`, \`getDocs\`)
- Real-time Listeners: Gunakan \`onSnapshot\` untuk sinkronisasi data reaktif real-time.
- Aturan Keamanan: Wajib mendefinisikan \`firestore.rules\` untuk membatasi akses baca/tulis berdasarkan UID dan role pengguna.\n`;
  }

  if (req.database?.tables && req.database.tables.length > 0) {
    dbContent += isFirestore ? '\nStruktur Koleksi Firestore (Collections & Documents):\n' : '\nSkema Tabel Relasional / Koleksi:\n';
    dbContent += req.database.tables
      .map(t => {
        const cols = t.columns && t.columns.length > 0
          ? t.columns.map(c => `  - \`${c.name}\` (${c.type})${c.constraints ? ` : ${c.constraints}` : ''}${c.description ? ` // ${c.description}` : ''}`).join('\n')
          : '  - [Perlu Ditentukan: Field data untuk koleksi/tabel ini]';
        return `### ${isFirestore ? 'Koleksi' : 'Tabel'} \`${t.name}\`
Deskripsi: ${t.description || 'Data entitas sistem'}
Field / Kolom:
${cols}`;
      })
      .join('\n\n');
  } else {
    dbContent += `\n[Perlu Ditentukan: Definisi skema tabel/koleksi data secara detail]`;
  }
  if (req.database?.notes) {
    dbContent += `\n\nCatatan Khusus Database:\n${req.database.notes}`;
  }
  sections.push({ number: 9, title: 'DATABASE', tag: 'DATABASE', content: dbContent });

  // 10. API
  let apiContent = '';
  if (req.apis && req.apis.length > 0) {
    apiContent = req.apis
      .map(a => {
        return `### ${a.method} \`${a.path}\`
- Deskripsi: ${a.description}
- Autentikasi: ${a.authRequired ? 'Wajib (Bearer Token / Session Cookie)' : 'Publik'}
${a.requestBody ? `- Request Body:\n\`\`\`json\n${a.requestBody}\n\`\`\`` : ''}
${a.responseSample ? `- Response Sample:\n\`\`\`json\n${a.responseSample}\n\`\`\`` : ''}`;
      })
      .join('\n\n');
  } else {
    apiContent = `[Perlu Ditentukan: Spesifikasi endpoint REST / tRPC API]`;
  }
  sections.push({ number: 10, title: 'API', tag: 'API', content: apiContent });

  // 11. AUTHENTICATION & AUTHORIZATION
  const authContent = `Sistem Autentikasi: ${req.auth?.type || '[Perlu Ditentukan: JWT / Session / Supabase Auth / Firebase Auth]'}
Mekanisme Login: ${req.auth?.mechanism || 'Email + Password dengan bcrypt hashing'}
Multi-Factor Authentication (MFA): ${req.auth?.mfaRequired ? 'Wajib Diimplementasikan' : 'Opsional / Tahap Berikutnya'}

Aturan Otorisasi (RBAC):
${req.auth?.rbacRules && req.auth.rbacRules.length > 0 
  ? req.auth.rbacRules.map(r => `- ${r}`).join('\n')
  : '- [Perlu Ditentukan: Aturan Role-Based Access Control secara detail]'}

Keamanan Token & Session:
- Token disimpan dalam HTTP-Only, Secure, SameSite=Strict cookies (atau secure storage di client).
- Implementasi middleware proteksi rute di backend dan route guards di frontend.`;
  sections.push({ number: 11, title: 'AUTHENTICATION & AUTHORIZATION', tag: 'AUTH_AUTHZ', content: authContent });

  // 12. UI/UX
  const uiContent = `Gaya Desain: ${req.uiUx?.designStyle || 'Modern Minimalist, Clean & Focused Dashboard'}
Palet Warna / Tema: ${req.uiUx?.colorTheme || 'Dark Slate Theme dengan Accent Indigo/Blue'}
Tipografi: ${req.uiUx?.fontFamily || 'Sans-serif (Plus Jakarta Sans / Inter) + Monospace untuk kode'}
Komponen UI: ${req.uiUx?.componentLibrary || 'Tailwind CSS utility-first + Lucide React Icons'}
Kepadatan Layout (Density): ${req.uiUx?.density || 'Compact (Productivity-focused)'}

Prinsip UI/UX Wajib:
1. Tidak menggunakan ornamen visual berlebihan (anti-AI slop: tidak ada neon glow berlebihan atau gradient acak).
2. Status interaksi jelas: loading state, empty state, error banner, dan success toast wajib disediakan pada setiap aksi asinkron.
3. Hirarki visual tegas antara heading, body text, data badge, dan call-to-action buttons.`;
  sections.push({ number: 12, title: 'UI/UX', tag: 'UI_UX', content: uiContent });

  // 13. RESPONSIVE DESIGN
  const respContent = `Standar Responsivitas:
- Breakpoints: ${req.responsive?.breakpoints || 'sm (640px), md (768px), lg (1024px), xl (1280px)'}
- Navigasi Mobile: ${req.responsive?.mobileNavigation || 'Collapsible Drawer / Sheet Menu & Bottom Quick Action Bar'}
- Ukuran Minimum Touch Target: ${req.responsive?.touchTargetsMinSize || 'Minimal 44x44 pixel untuk seluruh tombol dan input di mobile'}
- Adaptasi Desktop: ${req.responsive?.desktopOptimizations || 'Bento grid multi-kolom, keyboard shortcuts, dan sidebar sticky'}`;
  sections.push({ number: 13, title: 'RESPONSIVE DESIGN', tag: 'RESPONSIVE_DESIGN', content: respContent });

  // 14. SECURITY
  const secContent = `Aturan & Protokol Keamanan Wajib:
1. Validasi Input & Sanitasi: ${req.security?.sanitization ? 'Diaktifkan (XSS prevention, SQL injection defense)' : '[Perlu Ditentukan]'}
2. Proteksi Brute-Force & Rate Limiting: ${req.security?.rateLimiting ? 'Diaktifkan (Maksimal request per menit per IP pada rute login & API sensitif)' : '[Perlu Ditentukan]'}
3. Kebijakan CORS: ${req.security?.corsPolicy || 'Batasi origin domain produksi saja, tolak wildcard (*) pada kredensial'}
4. Proteksi Data Sensitif: Password wajib di-hash menggunakan argon2id atau bcrypt (min salt round 10).
5. Authorization Guard: Jangan hanya menyembunyikan tombol di UI; backend wajib memverifikasi permission pada setiap controller handler.`;
  sections.push({ number: 14, title: 'SECURITY', tag: 'SECURITY', content: secContent });

  // 15. VALIDATION
  let valContent = `Framework Validasi: ${req.security?.dataValidation || 'Zod / Yup schema validator'}\n\nAturan Validasi Kunci:\n`;
  if (req.validations && req.validations.length > 0) {
    valContent += req.validations.map(v => `- \`${v.field}\`: ${v.rule} (Pesan: "${v.errorMessage}")`).join('\n');
  } else {
    valContent += `- Email: Wajib format email valid dan unik dalam basis data.
- Password: Minimal 8 karakter, kombinasi huruf besar, huruf kecil, dan angka.
- Form Input Penting: Wajib trim whitespace dan bebas dari tag HTML berbahaya.
- [Perlu Ditentukan: Aturan validasi bisnis khusus untuk entitas aplikasi]`;
  }
  sections.push({ number: 15, title: 'VALIDATION', tag: 'VALIDATION', content: valContent });

  // 16. TEKNOLOGI YANG DIGUNAKAN
  let techContent = `Frontend: ${req.techStack?.frontend || 'React 18/19 + TypeScript + Vite'}
Backend / API: ${req.techStack?.backend || 'Node.js (Express / Fastify) atau Next.js API Routes'}
Styling: ${req.techStack?.styling || 'Tailwind CSS'}
State Management: ${req.techStack?.stateManagement || 'React Context / Zustand / React Query'}
Database & ORM: ${req.database?.type || 'PostgreSQL'} dengan ${req.database?.orm || 'Prisma ORM'}
Icon & UI Assets: Lucide React Icons`;

  if (req.integrations && req.integrations.length > 0) {
    techContent += '\n\nIntegrasi Pihak Ketiga:\n' + req.integrations.map(ig => `- ${ig.name}: ${ig.purpose} (Env: \`${ig.envKeys.join(', ') || 'N/A'}\`)`).join('\n');
  }
  sections.push({ number: 16, title: 'TEKNOLOGI YANG DIGUNAKAN', tag: 'TEKNOLOGI', content: techContent });

  // 17. STRUKTUR PROJECT
  const projectStruct = `Rekomendasi Struktur Direktori Modular:
\`\`\`
├── .env.example
├── README.md
├── package.json
├── src/
│   ├── components/          # Reusable UI components (buttons, modals, forms)
│   ├── layouts/             # App shell, Navbar, Sidebar
│   ├── pages/ or routes/    # View components per route
│   ├── modules/ or features/# Feature-driven domain logic
│   │   ├── auth/            # Auth forms, hooks, services
│   │   └── [feature_name]/  # Domain-specific components & state
│   ├── services/ or api/    # HTTP client & API fetchers
│   ├── hooks/               # Custom React hooks
│   ├── types/               # Shared TypeScript types & interfaces
│   ├── lib/ or utils/       # Helpers, validators, formatters
│   ├── App.tsx              # Root component & route config
│   └── main.tsx             # Entry point
└── server/ (jika full-stack)
    ├── routes/
    ├── controllers/
    ├── middlewares/
    └── db/
\`\`\``;
  sections.push({ number: 17, title: 'STRUKTUR PROJECT', tag: 'STRUKTUR_PROJECT', content: projectStruct });

  // 18. REQUIREMENT TEKNIS
  const reqTeknis = `Spesifikasi Kualitas & Environment:
1. TypeScript Strict Mode aktif (\`noImplicitAny: true\`, type safety tanpa tipe \`any\`).
2. Error Boundary pada level aplikasi untuk menangani unhandled exception secara anggun.
3. Responsiveness 100% dari resolusi mobile (375px) hingga desktop layar lebar (1440px+).
4. Penanganan Async State yang solid:
   - Tampilkan skeleton / spinner saat memuat data.
   - Tampilkan pesan error informatif jika network gagal, beserta tombol "Coba Lagi" (Retry).
5. Konfigurasi Environment: Seluruh secret dan URL API wajib menggunakan \`process.env\` atau \`import.meta.env\`.`;
  sections.push({ number: 18, title: 'REQUIREMENT TEKNIS', tag: 'REQUIREMENT_TEKNIS', content: reqTeknis });

  // 19. OUTPUT YANG DIHARAPKAN
  const outputExpected = `Hasil Yang Diharapkan Dari AI Coding:
- Kelengkapan Kode: ${req.expectedAiOutput?.codeCompleteness || 'Full Production-Ready Code tanpa potongan placeholder // TODO'}
- Pola Arsitektur: ${req.expectedAiOutput?.cleanArchitecturePattern || 'Modular Feature-Driven Architecture'}
- Dokumentasi File .env.example: Wajib menyertakan seluruh environment variable yang dibutuhkan.
- Sample Data Mock/Seed: Sediakan data awal yang realistis agar aplikasi dapat langsung didemonstrasikan.
- Komentar Kode: Berikan komentar hanya pada logika bisnis kompleks, hindari komentar redundan.`;
  sections.push({ number: 19, title: 'OUTPUT YANG DIHARAPKAN', tag: 'OUTPUT_DIHARAPKAN', content: outputExpected });

  // 20. ATURAN IMPLEMENTASI
  const rules = req.implementationRules && req.implementationRules.length > 0
    ? req.implementationRules.map((r, i) => `${i + 1}. ${r}`).join('\n')
    : `1. Jangan memotong kode dengan komentar seperti "// isi implementasi sama dengan sebelumnya" atau "// lanjutkan sendiri". Tulis kode secara utuh dan fungsional.
2. Gunakan semantic HTML (header, main, section, nav, footer, button) untuk aksesibilitas tinggi.
3. Jangan mengekspos API secret key di sisi client (browser bundle).
4. Gunakan state management yang efisien untuk menghindari re-render yang tidak perlu.
5. Tangani seluruh skenario edge cases (data kosong, input null, format salah, timeout jaringan).`;
  sections.push({ number: 20, title: 'ATURAN IMPLEMENTASI', tag: 'ATURAN_IMPLEMENTASI', content: rules });

  // 21. CHECKLIST SEBELUM SELESAI
  const checklist = req.preLaunchChecklist && req.preLaunchChecklist.length > 0
    ? req.preLaunchChecklist.map(c => `- [ ] ${c}`).join('\n')
    : `- [ ] Seluruh dependensi dideklarasikan di package.json dan terinstall tanpa error.
- [ ] TypeScript lolos kompilasi tanpa error type (\`npm run lint\` atau \`tsc --noEmit\`).
- [ ] Desain responsif diuji di viewport mobile (375px) dan desktop (1280px).
- [ ] Semua tombol dan form memiliki event handler nyata (tidak ada dead clicks).
- [ ] Proteksi otentikasi dan otorisasi role bekerja sesuai matriks permission.
- [ ] Validasi form menampilkan feedback error yang jelas bagi pengguna.
- [ ] Data persistensi (Database / LocalStorage) tersimpan dan ter-update dengan benar.`;
  sections.push({ number: 21, title: 'CHECKLIST SEBELUM SELESAI', tag: 'CHECKLIST_SEBELUM_SELESAI', content: checklist });

  return sections;
}

export function compilePromptToMarkdown(sections: PromptSection[]): string {
  return sections
    .map(s => `## ${s.number}. ${s.title}\n\n${s.content}`)
    .join('\n\n---\n\n');
}

export function compilePromptMarkdown(req: AppRequirement): string {
  const sections = generatePromptSections(req);
  const header = `# TECHNICAL SPECIFICATION & CODING PROMPT
# Aplikasi: ${req.name || 'Web Application'}
# Target Platform: ${req.targetAiTool || 'AI Coding Tool'}
# Terakhir Diperbarui: ${new Date(req.updatedAt || Date.now()).toLocaleString('id-ID')}
# Status Dokumen: Ready for Code Generation

---
`;

  const body = compilePromptToMarkdown(sections);
  return header + body;
}

export function extractSingleSection(req: AppRequirement, sectionNumber: number): string | null {
  const sections = generatePromptSections(req);
  const found = sections.find(s => s.number === sectionNumber);
  if (!found) return null;
  return `## ${found.number}. ${found.title}\n\n${found.content}`;
}
