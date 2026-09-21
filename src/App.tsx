import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { QuickModeBuilder } from './components/QuickModeBuilder';
import { GuidedModeBuilder } from './components/GuidedModeBuilder';
import { ExpertModeBuilder } from './components/ExpertModeBuilder';
import { PromptEditor } from './components/PromptEditor';
import { AnalysisInspector } from './components/AnalysisInspector';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileProjectView } from './components/MobileProjectView';
import { 
  AppProject, 
  AppRequirement, 
  MissingItem, 
  PromptHistoryItem, 
  MobileViewTab 
} from './types/prompt';
import { ChevronRight, Sparkles } from 'lucide-react';
import { PROMPT_TEMPLATES, PromptTemplate } from './data/templates';
import { 
  analyzeRequirements, 
  detectDomain, 
  generateDomainHeuristicRequirement,
  resolveMissingItem
} from './data/heuristics';
import { generatePromptSections, compilePromptToMarkdown } from './utils/promptGenerator';
import { 
  getSavedProjects, 
  saveProjects, 
  getActiveProjectId, 
  setActiveProjectId, 
  createEmptyRequirement,
  downloadPromptAsMarkdown 
} from './utils/storage';
import { 
  initFirebaseConnection, 
  subscribeFirebaseStatus, 
  subscribeProjects, 
  saveProjectToFirestore, 
  deleteProjectFromFirestore,
  FirebaseConnectionStatus 
} from './services/firebase';

export function App() {
  // Firebase Connection Status
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseConnectionStatus>({
    status: 'connecting',
    projectId: 'teak-vertex-9j4jh',
    user: null,
  });

  // Projects State
  const [projects, setProjects] = useState<AppProject[]>(() => getSavedProjects());
  const [activeProjectId, setActiveId] = useState<string>(() => {
    const saved = getActiveProjectId();
    const existing = getSavedProjects();
    if (saved && existing.some(p => p.id === saved)) {
      return saved;
    }
    return existing[0]?.id || 'proj-default';
  });

  // Initialize Firebase and Real-Time Firestore Sync
  useEffect(() => {
    initFirebaseConnection();
    const unsubStatus = subscribeFirebaseStatus(setFirebaseStatus);
    const unsubProjects = subscribeProjects((remoteProjects) => {
      if (remoteProjects && remoteProjects.length > 0) {
        setProjects(remoteProjects);
        saveProjects(remoteProjects);
      } else {
        // If Firestore is brand new, seed the current template project
        const currentSaved = getSavedProjects();
        if (currentSaved.length > 0) {
          currentSaved.forEach((p) => {
            saveProjectToFirestore(p).catch(console.warn);
          });
        }
      }
    });

    return () => {
      unsubStatus();
      unsubProjects();
    };
  }, []);

  // Active Project & Requirement
  const activeProject = useMemo(() => {
    return projects.find(p => p.id === activeProjectId) || projects[0];
  }, [projects, activeProjectId]);

  const [requirement, setRequirement] = useState<AppRequirement>(() => {
    return activeProject ? activeProject.requirement : PROMPT_TEMPLATES[0].requirement;
  });

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeViewMobile, setActiveViewMobile] = useState<'builder' | 'preview'>('builder');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);

  // Dark / Light Theme Mode
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('prompt_builder_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // fallback
    }
    return 'dark';
  });

  useEffect(() => {
    try {
      localStorage.setItem('prompt_builder_theme', theme);
    } catch {
      // ignore
    }
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Mobile navigation tabs: 'builder' | 'prompt' | 'analysis' | 'projects'
  const [mobileActiveTab, setMobileActiveTab] = useState<MobileViewTab>('builder');

  // Sync state when active project changes
  useEffect(() => {
    if (activeProject) {
      setRequirement(activeProject.requirement);
    }
  }, [activeProjectId]);

  // Requirement Analysis Report (Instant Heuristic + Confict Detector)
  const analysisReport = useMemo(() => {
    return analyzeRequirements(requirement);
  }, [requirement]);

  // Update requirement and persist
  const handleUpdateRequirement = useCallback((newReq: AppRequirement) => {
    setRequirement(newReq);
    setProjects(prevProjects => {
      const updated = prevProjects.map(p => {
        if (p.id === activeProjectId) {
          const updatedProject: AppProject = {
            ...p,
            name: newReq.name || 'Proyek Tanpa Nama',
            requirement: newReq,
            updatedAt: new Date().toISOString(),
          };
          // Persist to Cloud Firestore
          saveProjectToFirestore(updatedProject).catch((err) => {
            console.warn('[Firestore] Auto-save warning:', err);
          });
          return updatedProject;
        }
        return p;
      });
      saveProjects(updated);
      return updated;
    });
  }, [activeProjectId]);

  // Save current snapshot
  const handleSaveSnapshot = useCallback(() => {
    const historyItem: PromptHistoryItem = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toISOString(),
      label: `${requirement.name || 'Snapshot'} (${new Date().toLocaleTimeString('id-ID')})`,
      requirement: JSON.parse(JSON.stringify(requirement)),
    };

    setProjects(prev => {
      const updated = prev.map(p => {
        if (p.id === activeProjectId) {
          const updatedProject: AppProject = {
            ...p,
            history: [historyItem, ...(p.history || [])].slice(0, 20),
            updatedAt: new Date().toISOString(),
          };
          saveProjectToFirestore(updatedProject).catch(console.warn);
          return updatedProject;
        }
        return p;
      });
      saveProjects(updated);
      return updated;
    });
  }, [activeProjectId, requirement]);

  // Create new project
  const handleNewProject = useCallback(() => {
    const empty = createEmptyRequirement();
    const newProj: AppProject = {
      id: `proj-${Date.now()}`,
      name: 'Proyek Aplikasi Baru',
      requirement: empty,
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newProj, ...projects];
    setProjects(updated);
    setActiveId(newProj.id);
    setActiveProjectId(newProj.id);
    setRequirement(empty);
    saveProjects(updated);
    saveProjectToFirestore(newProj).catch(console.warn);
  }, [projects]);

  // Duplicate project
  const handleDuplicateProject = useCallback((id: string) => {
    const target = projects.find(p => p.id === id);
    if (!target) return;
    const duplicated: AppProject = {
      ...target,
      id: `proj-${Date.now()}`,
      name: `${target.name} (Salinan)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requirement: {
        ...target.requirement,
        name: `${target.requirement.name} (Salinan)`,
      },
    };
    const updated = [duplicated, ...projects];
    setProjects(updated);
    setActiveId(duplicated.id);
    setActiveProjectId(duplicated.id);
    setRequirement(duplicated.requirement);
    saveProjects(updated);
    saveProjectToFirestore(duplicated).catch(console.warn);
  }, [projects]);

  // Delete project
  const handleDeleteProject = useCallback((id: string) => {
    if (projects.length <= 1) return;
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    const nextId = updated[0].id;
    setActiveId(nextId);
    setActiveProjectId(nextId);
    setRequirement(updated[0].requirement);
    saveProjects(updated);
    deleteProjectFromFirestore(id).catch(console.warn);
  }, [projects]);

  // Load Template
  const handleLoadTemplate = useCallback((tpl: PromptTemplate) => {
    const cloned = JSON.parse(JSON.stringify(tpl.requirement));
    handleUpdateRequirement(cloned);
  }, [handleUpdateRequirement]);

  // Restore snapshot
  const handleRestoreHistory = useCallback((item: PromptHistoryItem) => {
    handleUpdateRequirement(item.requirement);
  }, [handleUpdateRequirement]);

  // AI Requirement Analysis & Expansion
  const handleAnalyzeWithAi = async (ideaInput?: string) => {
    setIsAnalyzing(true);
    const textToAnalyze = ideaInput || requirement.description || requirement.name;

    try {
      // Try backend endpoint first
      const res = await fetch('/api/analyze-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: textToAnalyze,
          currentRequirement: requirement,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.requirement) {
          handleUpdateRequirement({
            ...requirement,
            ...data.requirement,
            updatedAt: new Date().toISOString(),
          });
          setIsAnalyzing(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable or error, using intelligent domain heuristic:', err);
    }

    // Fallback: Use built-in heuristics
    setTimeout(() => {
      const heuristicReq = generateDomainHeuristicRequirement(textToAnalyze, requirement);
      handleUpdateRequirement(heuristicReq);
      setIsAnalyzing(false);
    }, 600);
  };

  // AI Prompt Refinement
  const handleRefineWithAi = async (userInstruction?: string) => {
    setIsRefining(true);
    const sections = generatePromptSections(requirement);
    const currentPromptText = compilePromptToMarkdown(sections);

    try {
      const res = await fetch('/api/refine-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: currentPromptText,
          targetAiTool: requirement.targetAiTool,
          userInstruction: userInstruction || 'Tingkatkan ketajaman spesifikasi teknis dan instruksi AI.',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.refinedPrompt) {
          // Add as special note or update instructions
          handleUpdateRequirement({
            ...requirement,
            specialNotes: `${requirement.specialNotes ? requirement.specialNotes + '\n\n' : ''}Refined Polish:\n${data.refinedPrompt.slice(0, 300)}...`,
          });
        }
      }
    } catch (err) {
      console.warn('Refinement error:', err);
    } finally {
      setIsRefining(false);
    }
  };

  // Auto-Fix All Gaps
  const handleAutoFixAll = () => {
    let current = { ...requirement };
    for (const item of analysisReport.missingItems) {
      current = resolveMissingItem(current, item);
    }
    handleUpdateRequirement(current);
  };

  // Apply Single Quick Fix
  const handleApplyQuickFix = (item: MissingItem) => {
    const updated = resolveMissingItem(requirement, item);
    handleUpdateRequirement(updated);
  };

  // Copy Entire Prompt
  const handleCopyAll = async () => {
    const sections = generatePromptSections(requirement);
    const markdown = compilePromptToMarkdown(sections);
    try {
      await navigator.clipboard.writeText(markdown);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  // Download Markdown file
  const handleDownloadMd = () => {
    const sections = generatePromptSections(requirement);
    const markdown = compilePromptToMarkdown(sections);
    const sanitizedName = (requirement.name || 'prompt-aplikasi')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    downloadPromptAsMarkdown(`${sanitizedName}-prompt.md`, markdown);
  };

  // Import Markdown file
  const handleImportMd = async (file: File) => {
    try {
      const content = await file.text();
      // Basic parse: extract title or use file name
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const name = titleMatch ? titleMatch[1] : file.name.replace(/\.md$/, '');
      const newReq: AppRequirement = {
        ...createEmptyRequirement(),
        name,
        description: content.slice(0, 500),
        specialNotes: `Imported from ${file.name}:\n${content.slice(0, 1000)}`,
      };
      handleUpdateRequirement(newReq);
    } catch (err) {
      console.error('Error importing file:', err);
    }
  };

  // Jump to specific section
  const handleJumpToSection = (sectionNumber: number) => {
    setMobileActiveTab('prompt');
    setActiveViewMobile('preview');
    setTimeout(() => {
      const el = document.getElementById(`prompt-section-${sectionNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  // Reset requirement
  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mereset formulir ke kondisi kosong?')) {
      handleUpdateRequirement(createEmptyRequirement());
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white transition-colors duration-200 ${
      theme === 'light' 
        ? 'light bg-[#f4f5f7] text-slate-900' 
        : 'bg-[#070b15] text-slate-100 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.12),rgba(255,255,255,0))]'
    }`}>
      {/* Top Header */}
      <Header
        requirement={requirement}
        onUpdateRequirement={handleUpdateRequirement}
        onAnalyzeWithAi={() => handleAnalyzeWithAi()}
        isAnalyzing={isAnalyzing}
        onCopyAll={handleCopyAll}
        isCopied={isCopied}
        onDownloadMd={handleDownloadMd}
        onReset={handleReset}
        onSave={handleSaveSnapshot}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeViewMobile={activeViewMobile}
        onToggleViewMobile={setActiveViewMobile}
        firebaseStatus={firebaseStatus}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* 1. DESKTOP VIEW (Screen >= lg): System Architect 3-Column Grid Layout */}
      <div className="hidden lg:grid flex-1 overflow-hidden h-[calc(100vh-4rem)] grid-cols-[280px_1fr_420px] app-shell">
        {/* Left Column: Workspace Explorer & Architecture Stages */}
        <Sidebar
          isOpen={false}
          onClose={() => setIsSidebarOpen(false)}
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={(id) => {
            setActiveId(id);
            setActiveProjectId(id);
          }}
          onNewProject={handleNewProject}
          onDuplicateProject={handleDuplicateProject}
          onDeleteProject={handleDeleteProject}
          onLoadTemplate={handleLoadTemplate}
          history={activeProject?.history || []}
          onRestoreHistory={handleRestoreHistory}
          completenessScore={analysisReport.completenessScore}
          detectedDomain={analysisReport.detectedDomain}
          onImportMd={handleImportMd}
          onJumpToSection={handleJumpToSection}
          onSelectStage={(stageNum) => {
            setCurrentStage(stageNum);
            handleUpdateRequirement({ ...requirement, mode: 'guided' });
          }}
          currentStage={currentStage}
          firebaseStatus={firebaseStatus}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Center Column: System Architect Main Content Area */}
        <main className="overflow-y-auto p-6 xl:p-8 bg-[#0c0c0e] border-r border-[rgba(228,228,231,0.1)]">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Requirement Analyzer & Conflict Inspector Bar */}
            <AnalysisInspector
              report={analysisReport}
              requirement={requirement}
              onApplyQuickFix={handleApplyQuickFix}
              onAutoFixAll={handleAutoFixAll}
            />

            {/* Mode-dependent Builder UI */}
            {requirement.mode === 'quick' && (
              <QuickModeBuilder
                requirement={requirement}
                onUpdateRequirement={handleUpdateRequirement}
                onAnalyzeAndExpand={(idea) => handleAnalyzeWithAi(idea)}
                isAnalyzing={isAnalyzing}
              />
            )}

            {requirement.mode === 'guided' && (
              <GuidedModeBuilder
                requirement={requirement}
                onUpdateRequirement={handleUpdateRequirement}
                currentStep={currentStage}
                onStepChange={setCurrentStage}
              />
            )}

            {requirement.mode === 'expert' && (
              <ExpertModeBuilder
                requirement={requirement}
                onUpdateRequirement={handleUpdateRequirement}
              />
            )}
          </div>
        </main>

        {/* Right Column: Blueprint Preview Pane */}
        <aside className="h-full overflow-hidden bg-[#09090b]">
          <PromptEditor
            requirement={requirement}
            onUpdateRequirement={handleUpdateRequirement}
            onRefineWithAi={handleRefineWithAi}
            isRefining={isRefining}
            onDownloadMd={handleDownloadMd}
          />
        </aside>
      </div>

      {/* Shared Slide-over Drawer / Sidebar for Mobile Only */}
      <div className="lg:hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={(id) => {
            setActiveId(id);
            setActiveProjectId(id);
            setIsSidebarOpen(false);
          }}
          onNewProject={() => {
            handleNewProject();
            setIsSidebarOpen(false);
          }}
          onDuplicateProject={handleDuplicateProject}
          onDeleteProject={handleDeleteProject}
          onLoadTemplate={(tmpl) => {
            handleLoadTemplate(tmpl);
            setIsSidebarOpen(false);
          }}
          history={activeProject?.history || []}
          onRestoreHistory={(h) => {
            handleRestoreHistory(h);
            setIsSidebarOpen(false);
          }}
          completenessScore={analysisReport.completenessScore}
          detectedDomain={analysisReport.detectedDomain}
          onImportMd={handleImportMd}
          onJumpToSection={(secNum) => {
            handleJumpToSection(secNum);
            setIsSidebarOpen(false);
          }}
          onSelectStage={(stageNum) => {
            setCurrentStage(stageNum);
            handleUpdateRequirement({ ...requirement, mode: 'guided' });
            setIsSidebarOpen(false);
          }}
          currentStage={currentStage}
          firebaseStatus={firebaseStatus}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      </div>

      {/* 2. MOBILE VIEW (Screen < lg): Fluid, Full-Width Responsive Mobile Experience */}
      <div className="flex lg:hidden flex-1 flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 pb-24 space-y-4">
          {/* TAB 1: FORMULIR / BUILDER */}
          {mobileActiveTab === 'builder' && (
            <div className="space-y-4">
              {/* Compact Quality Score Pill */}
              <div 
                onClick={() => setMobileActiveTab('analysis')}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/50 cursor-pointer flex items-center justify-between transition-all shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">
                        Kelengkapan: {analysisReport.completenessScore}%
                      </span>
                      {analysisReport.conflicts.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                          {analysisReport.conflicts.length} Konflik
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                      Domain: {analysisReport.detectedDomain} • Ketuk untuk analisis
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>

              {/* Active Builder Form */}
              {requirement.mode === 'quick' && (
                <QuickModeBuilder
                  requirement={requirement}
                  onUpdateRequirement={handleUpdateRequirement}
                  onAnalyzeAndExpand={(idea) => handleAnalyzeWithAi(idea)}
                  isAnalyzing={isAnalyzing}
                />
              )}

              {requirement.mode === 'guided' && (
                <GuidedModeBuilder
                  requirement={requirement}
                  onUpdateRequirement={handleUpdateRequirement}
                />
              )}

              {requirement.mode === 'expert' && (
                <ExpertModeBuilder
                  requirement={requirement}
                  onUpdateRequirement={handleUpdateRequirement}
                />
              )}
            </div>
          )}

          {/* TAB 2: HASIL PROMPT */}
          {mobileActiveTab === 'prompt' && (
            <div className="h-full min-h-[540px] rounded-2xl overflow-hidden border border-slate-800/90 bg-slate-900/60 shadow-lg">
              <PromptEditor
                requirement={requirement}
                onUpdateRequirement={handleUpdateRequirement}
                onRefineWithAi={handleRefineWithAi}
                isRefining={isRefining}
                onDownloadMd={handleDownloadMd}
              />
            </div>
          )}

          {/* TAB 3: ANALISIS KUALITAS & KONFLIK */}
          {mobileActiveTab === 'analysis' && (
            <div className="space-y-4">
              <AnalysisInspector
                report={analysisReport}
                requirement={requirement}
                onApplyQuickFix={handleApplyQuickFix}
                onAutoFixAll={handleAutoFixAll}
              />
            </div>
          )}

          {/* TAB 4: KELOLA PROYEK & TEMPLATE */}
          {mobileActiveTab === 'projects' && (
            <MobileProjectView
              projects={projects}
              activeProjectId={activeProjectId}
              onSelectProject={(id) => {
                setActiveId(id);
                setActiveProjectId(id);
                setMobileActiveTab('builder');
              }}
              onNewProject={() => {
                handleNewProject();
                setMobileActiveTab('builder');
              }}
              onDuplicateProject={handleDuplicateProject}
              onDeleteProject={handleDeleteProject}
              onLoadTemplate={(tmpl) => {
                handleLoadTemplate(tmpl);
                setMobileActiveTab('builder');
              }}
              history={activeProject?.history || []}
              onRestoreHistory={(item) => {
                handleRestoreHistory(item);
                setMobileActiveTab('builder');
              }}
              onImportMd={handleImportMd}
              firebaseStatus={firebaseStatus}
            />
          )}
        </div>

        {/* Mobile Touch-Friendly Bottom Navigation Bar */}
        <MobileBottomNav
          activeTab={mobileActiveTab}
          onChangeTab={setMobileActiveTab}
          completenessScore={analysisReport.completenessScore}
          conflictCount={analysisReport.conflicts.length}
          missingHighCount={analysisReport.missingItems.filter(i => i.severity === 'high').length}
          onQuickCopy={handleCopyAll}
          isCopied={isCopied}
        />
      </div>
    </div>
  );
}

export default App;
