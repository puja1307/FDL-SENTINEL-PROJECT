import { useState } from 'react';
import {
  GitCompare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  FileText,
} from 'lucide-react';
import { SectionCard } from '@/components/SectionCard';
import { fdrRecords, formatDate } from '@/data/mockData';
import { useApp } from '@/store/AppContext';
import type { FdrRecord } from '@/types';

interface Comparison {
  label: string;
  a: string;
  b: string;
  match: boolean;
  severity: 'low' | 'medium' | 'high';
}

function buildComparisons(record: FdrRecord): Comparison[] {
  return record.versionA.map((row, i) => {
    const bRow = record.versionB[i];
    const match = row.value === bRow.value;
    let severity: Comparison['severity'] = 'low';
    if (!match) {
      if (row.label === 'Principal Amount') severity = 'high';
      else if (row.label === 'Maturity Date' || row.label === 'Beneficiary') severity = 'medium';
      else severity = 'low';
    }
    return { label: row.label, a: row.value, b: bRow.value, match, severity };
  });
}

export function ChangeLens() {
  const { pushToast } = useApp();
  const [selectedId, setSelectedId] = useState(fdrRecords[0].id);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [decision, setDecision] = useState<'accept' | 'reject' | null>(null);

  const record = fdrRecords.find((r) => r.id === selectedId)!;
  const comparisons = buildComparisons(record);
  const discrepancies = comparisons.filter((c) => !c.match);

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight gradient-text">ChangeLens</h1>
        <p className="text-sm text-slate-500 mt-1">Side-by-side document comparison — detect and explain field-level discrepancies.</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <GitCompare className="w-5 h-5 text-brand-600" />
          <select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setSelectedField(null); setDecision(null); }} className="input w-auto">
            {fdrRecords.slice(0, 12).map((r) => <option key={r.id} value={r.id}>{r.id} — {r.beneficiary}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip bg-slate-100 text-slate-600"><FileText className="w-3 h-3" /> Version A: Original</span>
          <ArrowRight className="w-4 h-4 text-slate-300" />
          <span className="chip bg-slate-100 text-slate-600"><FileText className="w-3 h-3" /> Version B: Revised</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <SectionCard title="Field Comparison" description="Synchronized rows — matching fields are subtle, discrepancies are highlighted">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-2.5 w-40">Field</th>
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-2.5">Version A</th>
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-2.5">Version B</th>
                    <th className="text-center font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-2.5 w-24">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((c) => {
                    const isSel = selectedField === c.label;
                    return (
                      <tr
                        key={c.label}
                        onClick={() => { setSelectedField(c.label); setDecision(null); }}
                        className={`border-b border-slate-50 last:border-0 cursor-pointer transition ${isSel ? 'bg-brand-50/40' : !c.match ? 'bg-red-50/20 hover:bg-red-50/40' : 'hover:bg-slate-50'}`}
                      >
                        <td className="px-3 py-3 text-xs font-medium text-slate-700">{c.label}</td>
                        <td className="px-3 py-3 text-xs text-slate-700 font-mono">{c.a}</td>
                        <td className="px-3 py-3 text-xs font-mono">
                          <span className={c.match ? 'text-slate-700' : 'text-red-700 font-semibold bg-red-100/60 rounded px-1.5 py-0.5'}>{c.b}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {c.match ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" />
                          ) : (
                            <span className="chip text-[10px] bg-red-50 text-red-700 inline-flex"><XCircle className="w-3 h-3" /> Diff</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {selectedField && (
            <SectionCard
              title={`Field Detail: ${selectedField}`}
              description="Examine the discrepancy and make a reviewer decision"
              action={<button onClick={() => setSelectedField(null)} className="btn-ghost btn-sm">Close</button>}
            >
              {(() => {
                const c = comparisons.find((x) => x.label === selectedField)!;
                return (
                  <div className="space-y-4">
                    {!c.match ? (
                      <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
                        <p className="text-sm font-semibold text-red-800 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Discrepancy Detected</p>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div className="rounded-lg bg-white border border-slate-200 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Version A</p>
                            <p className="text-sm font-mono text-slate-800 mt-1">{c.a}</p>
                          </div>
                          <div className="rounded-lg bg-white border border-red-200 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400">Version B</p>
                            <p className="text-sm font-mono text-red-700 mt-1">{c.b}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-[11px] text-slate-500">Severity:</span>
                          <span className={`chip text-[10px] ${c.severity === 'high' ? 'bg-red-100 text-red-700' : c.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                            {c.severity.charAt(0).toUpperCase() + c.severity.slice(1)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-3">
                          {c.label === 'Maturity Date'
                            ? 'The maturity date in Version B is 22 days later than Version A. This could affect release timing and interest accrual. Confirm which version reflects the actual bank certificate.'
                            : `The ${c.label.toLowerCase()} differs between versions. Verify against the source document.`}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-emerald-50/50 border border-emerald-100 p-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <p className="text-sm text-emerald-800">Both versions match for this field.</p>
                      </div>
                    )}

                    {!c.match && (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-500 mr-2">Reviewer decision:</p>
                        <button
                          onClick={() => { setDecision('accept'); pushToast({ variant: 'success', title: 'Decision recorded', description: `Version B accepted for ${c.label} (demo).` }); }}
                          className={`btn-sm ${decision === 'accept' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> Accept Version B
                        </button>
                        <button
                          onClick={() => { setDecision('reject'); pushToast({ variant: 'info', title: 'Decision recorded', description: `Version A retained for ${c.label} (demo).` }); }}
                          className={`btn-sm ${decision === 'reject' ? 'btn-danger' : 'btn-secondary'}`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" /> Keep Version A
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </SectionCard>
          )}
        </div>

        <div className="space-y-5">
          <SectionCard title="Discrepancy Summary" description="Overview of all differences">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-xl font-bold text-emerald-700">{comparisons.filter((c) => c.match).length}</p>
                  <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">Matched</p>
                </div>
                <div className="rounded-lg bg-red-50 p-3">
                  <p className="text-xl font-bold text-red-700">{discrepancies.length}</p>
                  <p className="text-[10px] text-red-600 font-medium uppercase tracking-wider">Differs</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xl font-bold text-slate-700">{comparisons.length}</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Total</p>
                </div>
              </div>

              {discrepancies.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Discrepancies</p>
                  {discrepancies.map((d) => (
                    <button
                      key={d.label}
                      onClick={() => { setSelectedField(d.label); setDecision(null); }}
                      className="w-full text-left p-3 rounded-lg border border-red-100 bg-red-50/30 hover:bg-red-50/50 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-800">{d.label}</p>
                        <span className={`chip text-[10px] ${d.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{d.severity}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-mono truncate">{d.a} → {d.b}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-emerald-50/50 border border-emerald-100 p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs text-emerald-800">All fields match between versions.</p>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Comparison History" description="Previous comparisons for this FDR" bodyClassName="p-0">
            <div className="max-h-56 overflow-y-auto scrollbar-thin">
              {[
                { id: 1, label: 'Rev 2 vs Rev 1', date: formatDate(record.updatedAt), changes: discrepancies.length, by: 'Anita Verma' },
                { id: 2, label: 'Rev 1 vs Original', date: formatDate(record.createdAt), changes: 0, by: 'Rajiv Menon' },
              ].map((h) => (
                <div key={h.id} className="px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-slate-800 flex items-center gap-1.5"><History className="w-3.5 h-3.5 text-slate-400" /> {h.label}</p>
                    <span className={`chip text-[10px] ${h.changes > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{h.changes} diffs</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{h.date} · {h.by}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
