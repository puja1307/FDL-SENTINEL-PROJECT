import { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Upload,
  AlertTriangle,
  FileCheck2,
  User,
  Hash,
} from 'lucide-react';
import { SectionCard } from '@/components/SectionCard';
import { EmptyState } from '@/components/EmptyState';
import { fdrRecords, formatDate, formatDateTime, relativeTime } from '@/data/mockData';
import type { DocumentRecord, VerificationState } from '@/types';

const vStateMeta: Record<VerificationState, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  match: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 text-emerald-700', label: 'Match' },
  mismatch: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 text-red-700', label: 'Mismatch' },
  unverified: { icon: HelpCircle, color: 'text-slate-400', bg: 'bg-slate-100 text-slate-500', label: 'Unverified' },
};

export function ProofTrace() {
  const recordsWithDocs = fdrRecords.filter((r) => r.documents.length > 0);
  const [selectedFdrId, setSelectedFdrId] = useState(recordsWithDocs.find((r) => r.status === 'blocked')?.id || recordsWithDocs[0].id);
  const record = recordsWithDocs.find((r) => r.id === selectedFdrId)!;
  const [selectedDocId, setSelectedDocId] = useState(record.documents[0].id);
  const doc = record.documents.find((d) => d.id === selectedDocId) || record.documents[0];

  const verifiedCount = record.documents.filter((d) => d.status === 'verified').length;
  const completeness = Math.round((verifiedCount / record.documents.length) * 100);

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight gradient-text">ProofTrace</h1>
        <p className="text-sm text-slate-500 mt-1">Evidence verification workspace — inspect documents, fields, and verification traces.</p>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800">
          <span className="font-semibold">Demo verification environment.</span> Field-level results shown here are simulated for demonstration. No real bank, government, or OCR verification has occurred.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <SectionCard title="Documents" description={`${record.id} · ${record.documents.length} files`} bodyClassName="p-0" className="lg:col-span-3">
          <div className="p-3 border-b border-slate-100">
            <select value={selectedFdrId} onChange={(e) => { setSelectedFdrId(e.target.value); const r = recordsWithDocs.find((x) => x.id === e.target.value)!; setSelectedDocId(r.documents[0].id); }} className="input">
              {recordsWithDocs.slice(0, 15).map((r) => <option key={r.id} value={r.id}>{r.id} — {r.beneficiary.slice(0, 16)}</option>)}
            </select>
          </div>
          <div className="max-h-[420px] overflow-y-auto scrollbar-thin">
            {record.documents.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDocId(d.id)}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition ${d.id === selectedDocId ? 'bg-brand-50/60 border-l-2 border-l-brand-500' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{d.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{d.type}</p>
                    <span className={`chip text-[10px] mt-1.5 ${d.status === 'verified' ? 'bg-emerald-50 text-emerald-700' : d.status === 'flagged' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                      {d.status === 'verified' ? 'Verified' : d.status === 'flagged' ? 'Flagged' : 'Pending'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        <div className="lg:col-span-5 space-y-4">
          <SectionCard title="Document Preview" description={doc.name}>
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-6 min-h-[360px]">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 max-w-md mx-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-ink-900 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-brand-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{record.issuingBank}</p>
                      <p className="text-[10px] text-slate-500">{doc.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">Reference</p>
                    <p className="text-[10px] font-mono text-slate-600">{doc.reference}</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {doc.fields.map((f) => {
                    const v = vStateMeta[f.state];
                    const VIcon = v.icon;
                    return (
                      <div key={f.label} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-500">{f.label}</span>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-medium text-slate-800 truncate">{f.value}</span>
                          <VIcon className={`w-3.5 h-3.5 shrink-0 ${v.color}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-between">
                  <p className="text-[10px] text-slate-400">Generated preview · simulated</p>
                  <p className="text-[10px] font-mono text-slate-400">{doc.sizeKb} KB</p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Upload History" description="Document submission timeline">
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/60">
                <Upload className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-800">Uploaded by {doc.uploadedBy}</p>
                  <p className="text-[11px] text-slate-500">{formatDateTime(doc.uploadedAt)} · {relativeTime(doc.uploadedAt)}</p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <SectionCard title="Evidence Completeness" description="Overall verification status">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#10b894" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 34 * completeness / 100} ${2 * Math.PI * 34}`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-slate-800">{completeness}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between text-xs"><span className="flex items-center gap-1.5 text-slate-600"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Verified</span><span className="font-semibold text-slate-800">{verifiedCount}</span></div>
                <div className="flex items-center justify-between text-xs"><span className="flex items-center gap-1.5 text-slate-600"><Clock className="w-3.5 h-3.5 text-amber-500" /> Pending</span><span className="font-semibold text-slate-800">{record.documents.filter((d) => d.status === 'pending').length}</span></div>
                <div className="flex items-center justify-between text-xs"><span className="flex items-center gap-1.5 text-slate-600"><AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Flagged</span><span className="font-semibold text-slate-800">{record.documents.filter((d) => d.status === 'flagged').length}</span></div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Verification Results" description="Field-level trace for selected document">
            <div className="space-y-2">
              {doc.fields.map((f) => {
                const v = vStateMeta[f.state];
                return (
                  <div key={f.label} className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 transition">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-700">{f.label}</p>
                      <p className="text-[11px] text-slate-500 truncate">{f.value}</p>
                      {f.note && <p className="text-[10px] text-red-600 mt-0.5">{f.note}</p>}
                    </div>
                    <span className={`chip text-[10px] shrink-0 ${v.bg}`}>{v.label}</span>
                  </div>
                );
              })}
            </div>
            {doc.notes && (
              <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Reviewer Notes</p>
                <p className="text-xs text-slate-600 mt-1">{doc.notes}</p>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Verification Timeline" description="Chronological verification events" bodyClassName="p-0">
            <div className="max-h-48 overflow-y-auto scrollbar-thin">
              {record.audit.filter((a) => a.category === 'verification' || a.category === 'document').map((a) => (
                <div key={a.id} className="px-4 py-2.5 border-b border-slate-50 last:border-0">
                  <p className="text-xs font-medium text-slate-800">{a.action}</p>
                  <p className="text-[11px] text-slate-500">{a.detail}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{a.actor} · {relativeTime(a.timestamp)}</p>
                </div>
              ))}
              {record.audit.filter((a) => a.category === 'verification' || a.category === 'document').length === 0 && (
                <EmptyState icon={<FileCheck2 className="w-6 h-6" />} title="No verification events" />
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
