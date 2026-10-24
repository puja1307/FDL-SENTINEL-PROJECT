import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Landmark,
  Calendar,
  Banknote,
  Hash,
  FileText,
  ShieldCheck,
  Stamp,
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Circle,
  XCircle,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { SectionCard } from '@/components/SectionCard';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/Modal';
import { getFdr, formatINR, formatDate, formatDateTime, relativeTime } from '@/data/mockData';
import { useApp } from '@/store/AppContext';
import type { FdrRecord, WorkflowStage } from '@/types';

const stageStateConfig = {
  completed: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500', ring: 'ring-emerald-200', label: 'Completed' },
  in_progress: { icon: Clock, color: 'text-brand-600', bg: 'bg-brand-500', ring: 'ring-brand-200', label: 'In Progress' },
  blocked: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-500', ring: 'ring-red-200', label: 'Blocked' },
  upcoming: { icon: Circle, color: 'text-slate-300', bg: 'bg-slate-300', ring: 'ring-slate-200', label: 'Upcoming' },
};

function WorkflowTimeline({ stages }: { stages: WorkflowStage[] }) {
  return (
    <div className="relative">
      {stages.map((s, i) => {
        const cfg = stageStateConfig[s.state];
        const Icon = cfg.icon;
        return (
          <div key={s.id} className="relative flex gap-4 pb-6 last:pb-0">
            {i < stages.length - 1 && (
              <div className={`absolute left-[15px] top-8 bottom-0 w-px ${s.state === 'completed' ? 'bg-emerald-300' : 'bg-slate-200'}`} />
            )}
            <div className={`relative w-8 h-8 rounded-full ring-4 ${cfg.ring} ${cfg.bg} flex items-center justify-center shrink-0`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-sm font-semibold text-slate-800">{s.label}</p>
                <span className={`chip text-[10px] ${s.state === 'completed' ? 'bg-emerald-50 text-emerald-700' : s.state === 'in_progress' ? 'bg-brand-50 text-brand-700' : s.state === 'blocked' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{s.department} Department{s.actor ? ` · ${s.actor}` : ''}</p>
              {s.timestamp && <p className="text-[11px] text-slate-400 mt-0.5">{formatDateTime(s.timestamp)}</p>}
              {s.notes && <p className="text-xs text-slate-600 mt-1.5">{s.notes}</p>}
              {s.state === 'blocked' && (
                <div className="mt-2 rounded-lg bg-red-50/60 border border-red-100 p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-red-700 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Blocker Reason</p>
                  <p className="text-xs text-red-700/90">{s.blockerReason}</p>
                  {s.missingRequirement && <p className="text-xs text-red-700/90"><span className="font-medium">Missing:</span> {s.missingRequirement}</p>}
                  {s.recommendedAction && <p className="text-xs text-red-700/90"><span className="font-medium">Next:</span> {s.recommendedAction}</p>}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function FdrDetailContent({ record, onOpenFull }: { record: FdrRecord; onOpenFull?: () => void }) {
  const { pushToast } = useApp();
  const [confirmRelease, setConfirmRelease] = useState(false);
  const [noteText, setNoteText] = useState('');

  const outstanding = record.workflow.filter((w) => w.state === 'blocked' || w.state === 'in_progress');
  const nextStage = record.workflow.find((w) => w.state === 'in_progress' || w.state === 'blocked');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-slate-900">{record.id}</h2>
            <StatusBadge status={record.status} />
            <PriorityBadge priority={record.priority} />
          </div>
          <p className="text-sm text-slate-500 mt-1">{record.beneficiary} · {record.organization}</p>
        </div>
        {onOpenFull && (
          <button onClick={onOpenFull} className="btn-secondary btn-sm">Open full page <ArrowRight className="w-3.5 h-3.5" /></button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DetailItem icon={<Banknote className="w-4 h-4" />} label="Principal Amount" value={formatINR(record.amount)} />
        <DetailItem icon={<Calendar className="w-4 h-4" />} label="Maturity Date" value={formatDate(record.maturityDate)} />
        <DetailItem icon={<Landmark className="w-4 h-4" />} label="Issuing Bank" value={record.issuingBank} />
        <DetailItem icon={<Building2 className="w-4 h-4" />} label="Branch" value={record.branch} />
        <DetailItem icon={<Hash className="w-4 h-4" />} label="Reference No." value={record.referenceNo} />
        <DetailItem icon={<Calendar className="w-4 h-4" />} label="Issue Date" value={formatDate(record.issueDate)} />
      </div>

      {nextStage && (
        <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4">
          <p className="text-xs font-semibold text-brand-700 uppercase tracking-wider">Next Required Action</p>
          <p className="text-sm text-brand-900 mt-1 font-medium">{record.nextAction}</p>
          <p className="text-xs text-brand-700/80 mt-1">Currently at: {nextStage.label} · {nextStage.department} Department</p>
        </div>
      )}

      <SectionCard title="Workflow Progress" description="Lifecycle timeline from registration to release">
        <WorkflowTimeline stages={record.workflow} />
      </SectionCard>

      <SectionCard title="Outstanding Requirements" description="Items needed to advance the release">
        {outstanding.length === 0 ? (
          <EmptyState icon={<CheckCircle2 className="w-6 h-6" />} title="No outstanding requirements" description="All workflow stages are complete." />
        ) : (
          <div className="space-y-2">
            {outstanding.map((s) => (
              <div key={s.id} className={`flex items-start gap-3 p-3 rounded-lg ${s.state === 'blocked' ? 'bg-red-50/60 border border-red-100' : 'bg-amber-50/40 border border-amber-100'}`}>
                <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${s.state === 'blocked' ? 'text-red-500' : 'text-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{s.label}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{s.state === 'blocked' ? s.blockerReason : s.notes}</p>
                  {s.missingRequirement && <p className="text-xs text-slate-500 mt-0.5">Missing: {s.missingRequirement}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Evidence Documents" description="Uploaded verification evidence">
        <div className="space-y-2">
          {record.documents.map((d) => (
            <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{d.name}</p>
                <p className="text-[11px] text-slate-500">{d.type} · {d.reference} · {formatDate(d.uploadedAt)}</p>
              </div>
              <span className={`chip text-[10px] ${d.status === 'verified' ? 'bg-emerald-50 text-emerald-700' : d.status === 'flagged' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                {d.status === 'verified' ? 'Verified' : d.status === 'flagged' ? 'Flagged' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Department Approvals" description="Sign-offs across the workflow">
        <div className="space-y-2">
          {record.workflow.filter((w) => w.state === 'completed').map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/60">
              <Stamp className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{s.label}</p>
                <p className="text-[11px] text-slate-500">{s.department} · {s.actor} · {s.timestamp ? formatDate(s.timestamp) : ''}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          ))}
          {record.workflow.filter((w) => w.state === 'completed').length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">No approvals completed yet.</p>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Internal Notes" description="Team collaboration on this FDR">
        <div className="space-y-3">
          {record.notes.map((n) => (
            <div key={n.id} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                {n.author.split(' ').map((w) => w[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700">{n.author} <span className="text-slate-400 font-normal">· {relativeTime(n.at)}</span></p>
                <p className="text-sm text-slate-600 mt-0.5">{n.text}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note…"
              className="input flex-1"
            />
            <button
              onClick={() => {
                if (noteText.trim()) { pushToast({ variant: 'success', title: 'Note added' }); setNoteText(''); }
              }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Audit Trail" description="Chronological record of all events" bodyClassName="p-0">
        <div className="max-h-64 overflow-y-auto scrollbar-thin">
          {record.audit.map((a) => (
            <div key={a.id} className="px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-800">{a.action}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.detail}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">{formatDateTime(a.timestamp)}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{a.actor} · {a.role}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {record.status === 'ready_for_release' && (
        <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600">This FDR is ready for final release authorization.</p>
          <button onClick={() => setConfirmRelease(true)} className="btn-primary">
            <ShieldCheck className="w-4 h-4" /> Authorize Release
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmRelease}
        onClose={() => setConfirmRelease(false)}
        onConfirm={() => pushToast({ variant: 'success', title: 'Release authorized', description: `${record.id} has been authorized for final release (demo).` })}
        title="Authorize final release?"
        message={`This will authorize the final release of ${record.id} for ${formatINR(record.amount)}. This is a simulated demo action.`}
        confirmLabel="Authorize"
        variant="primary"
      />
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 p-3">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-semibold text-slate-800 mt-1.5 truncate">{value}</p>
    </div>
  );
}

export function FdrDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const record = id ? getFdr(id) : undefined;

  if (!record) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <EmptyState
          icon={<GitBranch className="w-6 h-6" />}
          title="FDR record not found"
          description={`No record found with ID "${id}". It may have been removed.`}
          action={<button onClick={() => navigate('/registry')} className="btn-primary">Back to Registry</button>}
        />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="btn-ghost btn-sm -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <FdrDetailContent record={record} />
    </div>
  );
}
