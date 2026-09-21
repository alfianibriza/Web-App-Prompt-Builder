import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Lightbulb, 
  Sparkles, 
  Wrench, 
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AnalysisReport, AppRequirement, MissingItem, RequirementConflict } from '../types/prompt';

interface AnalysisInspectorProps {
  report: AnalysisReport;
  requirement: AppRequirement;
  onApplyQuickFix: (missingItem: MissingItem) => void;
  onAutoFixAll: () => void;
}

export const AnalysisInspector: React.FC<AnalysisInspectorProps> = ({
  report,
  requirement,
  onApplyQuickFix,
  onAutoFixAll,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const highSeverityCount = report.missingItems.filter(i => i.severity === 'high').length;
  const conflictCount = report.conflicts.length;

  return (
    <div className="rounded-[4px] border border-[rgba(228,228,231,0.1)] bg-[#111113] overflow-hidden shadow-sm transition-all mb-4">
      {/* Header bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-2.5 bg-[#18181b] border-b border-[rgba(228,228,231,0.1)] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-[4px] bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="label-mono font-bold text-[#e4e4e7] truncate">
                Requirement Analyzer & Gap Inspector
              </h3>
              {conflictCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 flex items-center gap-1 shrink-0">
                  <ShieldAlert className="w-3 h-3" />
                  {conflictCount} Conflicts
                </span>
              )}
              {highSeverityCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20 shrink-0">
                  {highSeverityCount} Gaps
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-[rgba(228,228,231,0.5)] mt-0.5 truncate">
              Domain: <span className="text-[#e4e4e7]">{report.detectedDomain}</span> • Readiness Score:{' '}
              <span className={`font-bold ${
                report.completenessScore >= 80 ? 'text-[#10b981]' : report.completenessScore >= 50 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {report.completenessScore}%
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          {(highSeverityCount > 0 || conflictCount > 0) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAutoFixAll();
              }}
              className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-[3px] bg-[#6366f1] hover:bg-[#5558e6] text-white transition-colors flex items-center gap-1 shadow-sm"
            >
              <Wrench className="w-3 h-3" />
              Auto-Resolve Gaps
            </button>
          )}
          <button className="text-[rgba(228,228,231,0.5)] hover:text-[#e4e4e7] p-1">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3.5 text-xs">
          {/* Conflicts Section */}
          {report.conflicts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Konflik Requirement Terdeteksi ({report.conflicts.length})
              </h4>
              <div className="grid gap-2">
                {report.conflicts.map((conf) => (
                  <div 
                    key={conf.id} 
                    className="p-3 rounded-lg border border-rose-900/50 bg-rose-950/20 text-rose-200 space-y-1"
                  >
                    <div className="font-semibold text-xs text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                      {conf.title}
                    </div>
                    <p className="text-[11px] text-rose-200/90 leading-relaxed pl-5">
                      {conf.explanation}
                    </p>
                    <div className="text-[11px] text-emerald-400 font-medium pl-5 pt-1">
                      💡 Solusi Rekomendasi: {conf.solution}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing items list */}
          {report.missingItems.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Informasi Belum Lengkap / Perlu Ditentukan ({report.missingItems.length})
              </h4>
              <div className="grid sm:grid-cols-2 gap-2">
                {report.missingItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/50 space-y-1.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                          {item.section}
                        </span>
                        <span className={`text-[10px] font-bold uppercase ${
                          item.severity === 'high' ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          {item.severity === 'high' ? 'Kritis' : 'Menengah'}
                        </span>
                      </div>
                      <h5 className="font-semibold text-slate-100 text-xs mt-1">{item.title}</h5>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{item.message}</p>
                    </div>

                    <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between">
                      <p className="text-[10px] text-emerald-400/90 italic truncate mr-2">
                        {item.recommendation}
                      </p>
                      <button
                        onClick={() => onApplyQuickFix(item)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white font-medium text-[10px] transition-colors shrink-0"
                      >
                        Lengkapi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-emerald-900/40 bg-emerald-950/20 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-xs">
                Luar biasa! Seluruh komponen dan requirement penting telah terisi lengkap tanpa gap kritis.
              </p>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mb-1.5">
                <Lightbulb className="w-3 h-3 text-amber-400" />
                Rekomendasi Software Architect:
              </div>
              <ul className="space-y-1">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
