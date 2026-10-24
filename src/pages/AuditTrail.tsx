import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  FileText,
  ShieldCheck,
  GitBranch,
  Stamp,
  CheckCircle2,
  X,
  Download,
} from 'lucide-react';
import { SectionCard } from '@/components/SectionCard';
import { EmptyState } from '@/components/EmptyState';
import { getAllAudit, formatDateTime, relativeTime } from '@/data/mockData';
import { useApp } from '@/store/AppContext';
import type { AuditEntry } from '@/types';

const catMeta: Record<AuditEntry['category'], { icon: typeof FileText; color: string }> = {
  document: { icon: FileText, color: 'bg-slate-100 text-slate-600' },
  verification: { icon: ShieldCheck, color: 'bg-blue-50 text-blue-600' },
  status: { icon: GitBranch, color: 'bg-brand-50 text-brand-600' },
  approval: { icon: Stamp, color: 'bg-emerald-50 text-emerald-600' },
  note: { icon: FileText, color: 'bg-amber-50 text-amber-600' },
  system: { icon: CheckCircle2, color: 'bg-slate-100 text-slate-500' },
};

export function AuditTrail() {
  const navigate = useNavigate();
  const { pushToast } = useApp();
  const allAudit = getAllAudit();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<AuditEntry['category'] | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return allAudit.filter((a) => {
      if (query) {
        const q = query.toLowerCase();
        if (!a.fdrId.toLowerCase().includes(q) && !a.actor.toLowerCase().includes(q) && !a.action.toLowerCase().includes(q) && !a.detail.toLowerCase().includes(q)) return false;
      }
      if (category !== 'all' && a.category !== category) return false;
      return true;
    });
  }, [allAudit, query, category]);

  function exportCsv() {
    const headers = ['Timestamp', 'FDR ID', 'Actor', 'Role', 'Action', 'Detail', 'Category'];
    const rows = filtered.map((a) => [a.timestamp, a.fdrId, a.actor, a.role, a.action, a.detail, a.category]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'audit-trail-export.csv'; a.click();
    URL.revokeObjectURL(url);
    pushToast({ variant: 'success', title: 'Audit trail exported', description: `${filtered.length} entries exported` });
  }

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">Audit Trail</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} events · complete chronological record of all operations</p>
        </div>
        <button onClick={exportCsv} className="btn-secondary"><Download className="w-4 h-4" /> Export CSV</button>
      </div>

      <SectionCard bodyClassName="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by FDR ID, actor, action…" className="input pl-9" />
            {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>}
          </div>
          <button onClick={() => setShowFilters((s) => !s)} className={`btn-secondary ${category !== 'all' ? '!border-brand-300 !bg-brand-50 !text-brand-700' : ''}`}>
            <Filter className="w-4 h-4" /> Filter {category !== 'all' && <span className="chip bg-brand-600 text-white text-[10px] px-1.5 py-0">1</span>}
          </button>
        </div>
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fadein">
            <div className="col-span-2 lg:col-span-4">
              <label className="label">Category</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setCategory('all')} className={`chip ${category === 'all' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>All</button>
                {(Object.keys(catMeta) as AuditEntry['category'][]).map((c) => (
                  <button key={c} onClick={() => setCategory(c)} className={`chip capitalize ${category === c ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{c}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard bodyClassName="p-0">
        {filtered.length === 0 ? (
          <EmptyState icon={<Search className="w-6 h-6" />} title="No audit events found" description="Try adjusting your search or filter." />
        ) : (
          <div className="max-h-[640px] overflow-y-auto scrollbar-thin">
            {filtered.map((a) => {
              const meta = catMeta[a.category];
              const Icon = meta.icon;
              return (
                <div key={a.id} className="px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition cursor-pointer" onClick={() => navigate(`/fdr/${a.fdrId}`)}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-800">{a.action} <span className="text-slate-400 font-normal">· {a.fdrId}</span></p>
                        <span className="text-[10px] text-slate-400 shrink-0">{relativeTime(a.timestamp)}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{a.detail}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{a.actor} · {a.role} · {formatDateTime(a.timestamp)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
