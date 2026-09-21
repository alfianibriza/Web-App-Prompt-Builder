import React, { useState, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  Search, 
  Code, 
  Eye, 
  RotateCcw, 
  Maximize2, 
  Minimize2,
  FileText,
  Layers,
  ChevronDown,
  ChevronUp,
  Bookmark
} from 'lucide-react';
import { AppRequirement, PromptSection } from '../types/prompt';
import { generatePromptSections, compilePromptToMarkdown } from '../utils/promptGenerator';

interface PromptEditorProps {
  requirement: AppRequirement;
  onUpdateRequirement: (req: AppRequirement) => void;
  onRefineWithAi: (userInstruction?: string) => void;
  isRefining: boolean;
  onDownloadMd: () => void;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  requirement,
  onUpdateRequirement,
  onRefineWithAi,
  isRefining,
  onDownloadMd,
}) => {
  const [viewMode, setViewMode] = useState<'visual' | 'raw'>('visual');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSectionId, setCopiedSectionId] = useState<number | null>(null);
  const [isCopiedAll, setIsCopiedAll] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({});
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<number | 'all'>('all');

  // Generate 21 structured sections
  const sections: PromptSection[] = useMemo(() => {
    return generatePromptSections(requirement);
  }, [requirement]);

  // Full compiled markdown
  const compiledMarkdown = useMemo(() => {
    return compilePromptToMarkdown(sections);
  }, [sections]);

  // Stats
  const charCount = compiledMarkdown.length;
  const wordCount = useMemo(() => {
    return compiledMarkdown.trim().split(/\s+/).filter(Boolean).length;
  }, [compiledMarkdown]);
  const tokenEstimate = Math.round(wordCount * 1.35);

  // Copy entire prompt
  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(compiledMarkdown);
      setIsCopiedAll(true);
      setTimeout(() => setIsCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  // Copy single section
  const handleCopySection = async (section: PromptSection) => {
    const text = `### ${section.number}. ${section.title}\n\n${section.content}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSectionId(section.number);
      setTimeout(() => setCopiedSectionId(null), 2000);
    } catch (err) {
      console.error('Failed to copy section:', err);
    }
  };

  const toggleCollapse = (num: number) => {
    setCollapsedSections(prev => ({ ...prev, [num]: !prev[num] }));
  };

  // Filter sections by search and section dropdown
  const filteredSections = useMemo(() => {
    return sections.filter((sec) => {
      if (selectedSectionFilter !== 'all' && sec.number !== selectedSectionFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        sec.title.toLowerCase().includes(q) ||
        sec.content.toLowerCase().includes(q) ||
        sec.number.toString().includes(q)
      );
    });
  }, [sections, selectedSectionFilter, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-[#09090b] border-l border-[rgba(228,228,231,0.1)] preview-pane">
      {/* Blueprint Header */}
      <div className="px-4 py-3 border-b border-[rgba(228,228,231,0.1)] bg-[#0c0c0e] flex items-center justify-between gap-2 shrink-0 preview-header">
        <div className="flex items-center gap-2">
          <h3 className="label-mono font-bold text-[#e4e4e7]">Blueprint Preview</h3>
          <span className="status-pill px-2 py-0.5 rounded-[99px] bg-emerald-500/10 text-[#10b981] font-mono text-[10px] font-bold border border-emerald-500/20">
            DRAFTED
          </span>
        </div>

        {/* View Mode & AI refine */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#18181b] border border-[rgba(228,228,231,0.1)] rounded-[3px] p-0.5">
            <button
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-1 px-2 py-1 rounded-[2px] text-[10px] font-mono uppercase tracking-wider transition-all ${
                viewMode === 'visual'
                  ? 'bg-[#6366f1] text-white font-bold'
                  : 'text-[rgba(228,228,231,0.5)] hover:text-[#e4e4e7]'
              }`}
              title="Visual Blueprint View"
            >
              <Eye className="w-3 h-3" />
              <span>Blocks</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1 px-2 py-1 rounded-[2px] text-[10px] font-mono uppercase tracking-wider transition-all ${
                viewMode === 'raw'
                  ? 'bg-[#6366f1] text-white font-bold'
                  : 'text-[rgba(228,228,231,0.5)] hover:text-[#e4e4e7]'
              }`}
              title="Raw Markdown Editor"
            >
              <Code className="w-3 h-3" />
              <span>Raw</span>
            </button>
          </div>

          {/* Section Selector */}
          <select
            value={selectedSectionFilter}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedSectionFilter(val === 'all' ? 'all' : parseInt(val, 10));
            }}
            className="bg-[#18181b] border border-[rgba(228,228,231,0.1)] text-[#e4e4e7] text-[10px] font-mono rounded-[3px] px-2 py-1 max-w-[120px] truncate focus:outline-none"
          >
            <option value="all">ALL 21</option>
            {sections.map((s) => (
              <option key={s.number} value={s.number} className="bg-[#18181b]">
                {String(s.number).padStart(2, '0')}. {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search & Metadata Stats Bar */}
      <div className="px-4 py-2 bg-[#0c0c0e]/70 border-b border-[rgba(228,228,231,0.1)] flex items-center justify-between gap-3 text-[10px] text-[rgba(228,228,231,0.5)] font-mono shrink-0">
        <div className="relative flex-1 max-w-[180px]">
          <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-[rgba(228,228,231,0.4)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter blocks..."
            className="w-full bg-[#18181b] border border-[rgba(228,228,231,0.1)] rounded-[2px] pl-7 pr-2 py-0.5 text-[10px] text-[#e4e4e7] placeholder-[rgba(228,228,231,0.3)] focus:outline-none focus:border-[#6366f1]"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <span>{wordCount} WORDS</span>
          <span>~{tokenEstimate} TOKENS</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 preview-content">
        {viewMode === 'visual' ? (
          /* VISUAL BLUEPRINT VIEW (Variation 2 Design) */
          <div className="space-y-3">
            {filteredSections.length === 0 ? (
              <div className="text-center py-12 text-[rgba(228,228,231,0.4)] text-xs font-mono">
                No prompt blocks matched "{searchQuery}".
              </div>
            ) : (
              filteredSections.map((sec) => {
                const isCollapsed = collapsedSections[sec.number];
                const isCopied = copiedSectionId === sec.number;

                return (
                  <div
                    key={sec.number}
                    id={`prompt-section-${sec.number}`}
                    className="prompt-block bg-white/[0.02] border border-[rgba(228,228,231,0.1)] p-3.5 rounded-[4px] transition-all hover:border-[rgba(228,228,231,0.2)]"
                  >
                    {/* Header with block-id */}
                    <div className="flex items-center justify-between mb-1.5 select-none">
                      <span className="block-id text-[#6366f1] font-bold font-mono text-xs tracking-wider">
                        [{String(sec.number).padStart(2, '0')}] {sec.title.toUpperCase()}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopySection(sec)}
                          className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-mono font-bold uppercase transition-all ${
                            isCopied
                              ? 'bg-emerald-500/20 text-[#10b981] border border-emerald-500/30'
                              : 'text-[rgba(228,228,231,0.4)] hover:text-[#e4e4e7] hover:bg-white/[0.05]'
                          }`}
                          title={`Copy block ${sec.number}`}
                        >
                          {isCopied ? 'COPIED' : 'COPY'}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCollapse(sec.number)}
                          className="p-0.5 text-[rgba(228,228,231,0.4)] hover:text-[#e4e4e7]"
                        >
                          {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Section Content in Space Mono */}
                    {!isCollapsed && (
                      <div className="text-[#a1a1aa] font-mono text-[11px] leading-relaxed whitespace-pre-wrap selection:bg-[#6366f1] selection:text-white">
                        {sec.content}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* RAW CODE / MARKDOWN VIEW */
          <div className="h-full flex flex-col">
            <div className="flex-1 rounded-[4px] border border-[rgba(228,228,231,0.1)] bg-[#0c0c0e] p-3 font-mono text-xs text-[#e4e4e7] leading-relaxed overflow-y-auto">
              <textarea
                readOnly
                value={compiledMarkdown}
                rows={35}
                className="w-full h-full bg-transparent text-[#a1a1aa] font-mono text-xs focus:outline-none resize-none leading-relaxed selection:bg-[#6366f1] selection:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Footer (Variation 2 Design) */}
      <div className="p-3 border-t border-[rgba(228,228,231,0.1)] bg-[#0c0c0e] grid grid-cols-2 gap-2 shrink-0">
        <button
          onClick={onDownloadMd}
          className="border border-[rgba(228,228,231,0.15)] hover:bg-white/[0.04] text-[#e4e4e7] py-2 px-3 rounded-[4px] text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download .MD</span>
        </button>
        <button
          onClick={handleCopyAll}
          className="border border-[rgba(228,228,231,0.15)] hover:bg-white/[0.04] text-[#e4e4e7] py-2 px-3 rounded-[4px] text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
        >
          {isCopiedAll ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{isCopiedAll ? 'Copied' : 'Copy Raw'}</span>
        </button>
      </div>
    </div>
  );
};
