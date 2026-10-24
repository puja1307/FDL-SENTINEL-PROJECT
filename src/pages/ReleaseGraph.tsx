import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Circle,
  AlertTriangle,
  ChevronDown,
  ArrowRight,
  HelpCircle,
  FileText,
  Building2,
  Lightbulb,
} from 'lucide-react';
import { SectionCard } from '@/components/SectionCard';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { fdrRecords, formatDate, formatDateTime, formatINR } from '@/data/mockData';
import type { WorkflowStage, StageState } from '@/types';

const stateMeta: Record<StageState, { icon: typeof CheckCircle2; color: string; bg: string; border: string; label: string }> = {
  completed: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500', border: 'border-emerald-300', label: 'Completed' },
  in_progress: { icon: Clock, color: 'text-brand-600', bg: 'bg-brand-500', border: 'border-brand-300', label: 'In Progress' },
  blocked: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-500', border: 'border-red-400', label: 'Blocked' },
  upcoming: { icon: Circle, color: 'text-slate-300', bg: 'bg-slate-200', border: 'border-slate-200', label: 'Upcoming' },
};

export function ReleaseGraph() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(fdrRecords.find((r) => r.status === 'blocked')?.id || fdrRecords[0].id);
  const [selectedStage, setSelectedStage] = useState<WorkflowStage | null>(null);
  const [showBlockedOnly, setShowBlockedOnly] = useState(false);

  const record = fdrRecords.find((r) => r.id === selectedId)!;
  const blockedStages = record.workflow.filter((s) => s.state === 'blocked');
  const inProgress = record.workflow.find((s) => s.state === 'in_progress');

  const fdrList = showBlockedOnly ? fdrRecords.filter((r) => r.status === 'blocked') : fdrRecords.slice(0, 20);

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight gradient-text">ReleaseGraph</h1>
        <p className="text-sm text-slate-500 mt-1">Explainable release readiness — visualize and diagnose every workflow stage.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <SectionCard title="Select FDR" description="Choose a record to inspect" bodyClassName="p-0" className="lg:col-span-1">
          <div className="p-3 border-b border-slate-100">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input type="checkbox" checked={showBlockedOnly} onChange={(e) => setShowBlockedOnly(e.target.checked)} className="rounded border-slate-300" />
              Show blocked only
            </label>
          </div>
          <div className="max-h-[480px] overflow-y-auto scrollbar-thin">
            {fdrList.map((r) => (
              <button
                key={r.id}
                onClick={() => { setSelectedId(r.id); setSelectedStage(null); }}
                className={`w-full text-left px-4 py-2.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition ${r.id === selectedId ? 'bg-brand-50/60 border-l-2 border-l-brand-500' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-800">{r.id}</p>
                  <span className={`w-2 h-2 rounded-full ${r.status === 'blocked' ? 'bg-red-500' : r.status === 'released' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{r.beneficiary}</p>
                <p className="text-[11px] text-slate-400 truncate">{r.department} · {formatINR(r.amount)}</p>
              </button>
            ))}
          </div>
        </SectionCard>

        <div className="lg:col-span-3 space-y-5">
          <SectionCard>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-slate-900">{record.id}</h2>
                  <StatusBadge status={record.status} />
                </div>
                <p className="text-sm text-slate-500 mt-1">{record.beneficiary} · {record.organization} · {formatINR(record.amount)}</p>
              </div>
              <button onClick={() => navigate(`/fdr/${record.id}`)} className="btn-secondary btn-sm">Full detail <ArrowRight className="w-3.5 h-3.5" /></button>
            </div>
          </SectionCard>

          <SectionCard title="Release Readiness Workflow" description="Click any stage to inspect its state, evidence, and next actions">
            <div className="overflow-x-auto scrollbar-thin pb-2">
              <div className="flex items-stretch gap-0 min-w-[760px] py-4">
                {record.workflow.map((stage, i) => {
                  const meta = stateMeta[stage.state];
                  const Icon = meta.icon;
                  const isSelected = selectedStage?.id === stage.id;
                  return (
                    <div key={stage.id} className="flex items-stretch">
                      <button
                        onClick={() => setSelectedStage(stage)}
                        className={`relative w-44 rounded-xl border-2 p-4 text-left transition-all duration-200 hover:shadow-card ${
                          isSelected ? 'ring-2 ring-brand-400 ring-offset-2 ' : ''
                        } ${meta.border} ${
                          stage.state === 'completed' ? 'bg-emerald-50/40' :
                          stage.state === 'in_progress' ? 'bg-brand-50/40' :
                          stage.state === 'blocked' ? 'bg-red-50/40' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-8 h-8 rounded-full ${meta.bg} flex items-center justify-center shrink-0`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{i + 1}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 leading-tight">{stage.label}</p>
                        <p className="text-[11px] text-slate-500 mt-1">{stage.department}</p>
                        <span className={`chip text-[10px] mt-2 ${stage.state === 'completed' ? 'bg-emerald-100 text-emerald-700' : stage.state === 'in_progress' ? 'bg-brand-100 text-brand-700' : stage.state === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                          {meta.label}
                        </span>
                        {stage.timestamp && <p className="text-[10px] text-slate-400 mt-2">{formatDate(stage.timestamp)}</p>}
                        {stage.state === 'blocked' && <p className="text-[10px] text-red-600 mt-1 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Blocked</p>}
                      </button>
                      {i < record.workflow.length - 1 && (
                        <div className="flex items-center px-1">
                          <div className={`h-1 w-6 rounded-full ${stage.state === 'completed' ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                          <ArrowRight className={`w-4 h-4 ${stage.state === 'completed' ? 'text-emerald-400' : 'text-slate-300'}`} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </SectionCard>

          {(blockedStages.length > 0 || inProgress) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Why is this FDR pending?</p>
                  <p className="text-sm text-amber-800/90 mt-1">
                    {blockedStages.length > 0
                      ? `This FDR is blocked at ${blockedStages.map((s) => s.label).join(', ')}. ${blockedStages[0].blockerReason} The responsible department (${blockedStages[0].department}) must resolve the outstanding item before the workflow can proceed.`
                      : inProgress
                        ? `This FDR is currently at the ${inProgress.label} stage, awaiting sign-off from the ${inProgress.department} department.`
                        : 'This FDR has no active or blocked stages.'}
                  </p>
                  {blockedStages[0]?.recommendedAction && (
                    <p className="text-xs text-amber-800/80 mt-2 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" /> Recommended: {blockedStages[0].recommendedAction}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedStage ? (
            <SectionCard
              title={`${selectedStage.label} — Stage Detail`}
              description={`State: ${stateMeta[selectedStage.state].label} · ${selectedStage.department} Department`}
              action={<button onClick={() => setSelectedStage(null)} className="btn-ghost btn-sm">Close</button>}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Responsible Department</p>
                    <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5"><Building2 className="w-4 h-4 text-slate-400" /> {selectedStage.department}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Timestamp</p>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{selectedStage.timestamp ? formatDateTime(selectedStage.timestamp) : 'Not started'}</p>
                  </div>
                </div>

                {selectedStage.notes && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Notes</p>
                    <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{selectedStage.notes}</p>
                  </div>
                )}

                {selectedStage.state === 'blocked' && (
                  <div className="rounded-xl border border-red-200 bg-red-50/40 p-4 space-y-3">
                    <p className="text-sm font-semibold text-red-800 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Blocker Details</p>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-red-400">Reason</p>
                      <p className="text-sm text-red-800/90 mt-0.5">{selectedStage.blockerReason}</p>
                    </div>
                    {selectedStage.missingRequirement && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-red-400">Missing Requirement</p>
                        <p className="text-sm text-red-800/90 mt-0.5">{selectedStage.missingRequirement}</p>
                      </div>
                    )}
                    {selectedStage.evidence && selectedStage.evidence.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-red-400 mb-1.5">Supporting Evidence</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedStage.evidence.map((e) => (
                            <span key={e} className="chip bg-white border border-red-200 text-red-700"><FileText className="w-3 h-3" /> {e}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedStage.recommendedAction && (
                      <div className="rounded-lg bg-white border border-red-100 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-red-400">Recommended Next Action</p>
                        <p className="text-sm text-slate-800 mt-0.5">{selectedStage.recommendedAction}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedStage.state === 'completed' && (
                  <div className="rounded-lg bg-emerald-50/50 border border-emerald-100 p-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <p className="text-sm text-emerald-800">Completed by {selectedStage.actor} on {selectedStage.timestamp ? formatDate(selectedStage.timestamp) : ''}</p>
                  </div>
                )}
              </div>
            </SectionCard>
          ) : (
            <div className="card card-pad">
              <EmptyState
                icon={<ChevronDown className="w-6 h-6" />}
                title="Select a workflow stage"
                description="Click any node in the graph above to inspect its state, evidence, and recommended actions."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
