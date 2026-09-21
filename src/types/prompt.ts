export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface AppModule {
  id: string;
  name: string;
  description?: string;
  features: string[];
  priority?: 'High' | 'Medium' | 'Low';
}

export interface AppPageRoute {
  id: string;
  path: string;
  name: string;
  description: string;
  authRequired: boolean;
  allowedRoles: string[];
}

export interface DatabaseColumn {
  name: string;
  type: string;
  constraints?: string;
  description?: string;
}

export interface DatabaseTable {
  id: string;
  name: string;
  description: string;
  columns: DatabaseColumn[];
}

export interface DatabaseConfig {
  type: string; // PostgreSQL, MySQL, MongoDB, Supabase, SQLite, Firebase
  orm: string; // Prisma, Drizzle, TypeORM, Mongoose, Native SQL
  tables: DatabaseTable[];
  notes?: string;
}

export interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  authRequired: boolean;
  requestBody?: string;
  responseSample?: string;
}

export interface AuthConfig {
  type: string; // JWT Bearer, Session-based, Supabase Auth, Firebase Auth, NextAuth/Auth.js, OAuth (Google/GitHub)
  mechanism: string;
  rbacRules: string[];
  mfaRequired?: boolean;
}

export interface TechStackConfig {
  frontend: string;
  backend: string;
  styling: string;
  stateManagement: string;
  runtime: string;
  additionalLibraries: string[];
}

export interface ThirdPartyIntegration {
  id: string;
  name: string;
  purpose: string;
  envKeys: string[];
}

export interface UiUxConfig {
  designStyle: string; // Modern Minimalist, Enterprise Clean, Creative Dashboard, High-Contrast Dark IDE
  colorTheme: string;
  fontFamily: string;
  componentLibrary: string; // Tailwind CSS, Radix UI, Lucide Icons, etc.
  layoutPattern: string; // Single Page App, Sidebar + Main Content, Multi-step Wizard
  density: 'Compact (Productivity)' | 'Comfortable (Standard)' | 'Spacious (Marketing/Consumer)';
}

export interface ResponsiveConfig {
  mobileNavigation: string; // Bottom bar, Drawer/Hamburger, Collapsible sidebar
  breakpoints: string;
  touchTargetsMinSize: string; // e.g. "Min 44x44px"
  desktopOptimizations: string;
}

export interface SecurityConfig {
  sanitization: boolean;
  rateLimiting: boolean;
  csrfProtection: boolean;
  corsPolicy: string;
  dataValidation: string; // Zod, Yup, Joi, class-validator
  storageEncryption: string;
  authGuards: string;
}

export interface ValidationRule {
  id: string;
  field: string;
  rule: string;
  errorMessage: string;
}

export interface ExpectedAiOutput {
  codeCompleteness: 'Full Production-Ready Code' | 'Modular Architecture with Snippets' | 'MVP Ready-to-Run';
  fileStructureDetail: boolean;
  cleanArchitecturePattern: string; // Feature-based, MVC, Clean Architecture, Layered
  includeSampleSeedData: boolean;
  includeEnvExample: boolean;
  includeTestingGuide: boolean;
}

export interface AppRequirement {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  targetUsers: string;
  roles: UserRole[];
  modules: AppModule[];
  pages: AppPageRoute[];
  userFlows: string[];
  database: DatabaseConfig;
  apis: ApiEndpoint[];
  auth: AuthConfig;
  techStack: TechStackConfig;
  integrations: ThirdPartyIntegration[];
  uiUx: UiUxConfig;
  responsive: ResponsiveConfig;
  security: SecurityConfig;
  validations: ValidationRule[];
  expectedAiOutput: ExpectedAiOutput;
  implementationRules: string[];
  preLaunchChecklist: string[];
  specialNotes: string;
  targetAiTool: 'Google AI Studio' | 'Claude 3.7 Sonnet' | 'ChatGPT / OpenAI' | 'Cursor' | 'Windsurf / v0' | 'Umum';
  mode: 'quick' | 'guided' | 'expert';
  updatedAt: string;
}

export interface MissingItem {
  id: string;
  section: string;
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
  autoFixPayload?: Partial<AppRequirement>;
}

export interface RequirementConflict {
  id: string;
  title: string;
  explanation: string;
  solution: string;
}

export interface AnalysisReport {
  completenessScore: number; // 0 - 100
  missingItems: MissingItem[];
  conflicts: RequirementConflict[];
  recommendations: string[];
  detectedDomain: string;
  lastAnalyzed: string;
}

export interface PromptSection {
  number: number;
  title: string;
  tag: string;
  content: string;
}

export interface PromptHistoryItem {
  id: string;
  timestamp: string;
  label: string;
  promptContent?: string;
  requirement: AppRequirement;
}

export interface AppProject {
  id: string;
  name: string;
  requirement: AppRequirement;
  history: PromptHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export type DeviceViewMode = 'desktop' | 'mobile';
export type MobileViewTab = 'builder' | 'prompt' | 'analysis' | 'projects';
