import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  Rows3,
  FileSearch,
} from 'lucide-react';
import { SectionCard } from '@/components/SectionCard';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { Drawer } from '@/components/Drawer';
import { FdrDetailContent } from '@/pages/FdrDetail';
import { fdrRecords, formatINR, formatDate, formatDateTime, statusConfig } from '@/data/mockData';
import { useApp } from '@/store/AppContext';
import type { FdrRecord, FdrStatus, Department } from '@/types';

type SortKey = 'id' | 'beneficiary' | 'amount' | 'maturityDate' | 'status' | 'updatedAt';

export function Registry() {
  const navigate = useNavigate();
  const { pushToast } = useApp();
  const [params, setParams] = useSearchParams();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FdrStatus | 'all'>(
    (params.get('status') as FdrStatus) || 'all'
  );
  const [deptFilter, setDeptFilter] = useState<Department | 'all'>('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<FdrRecord | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (params.get('status')) setStatusFilter(params.get('status') as FdrStatus);
  }, [params]);

  const filtered = useMemo(() => {
    let r = fdrRecords.filter((rec) => {
      if (query) {
        const q = query.toLowerCase();
        if (!rec.id.toLowerCase().includes(q) && !rec.beneficiary.toLowerCase().includes(q) && !rec.organization.toLowerCase().includes(q) && !rec.issuingBank.toLowerCase().includes(q)) return false;
      }
      if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
      if (deptFilter !== 'all' && rec.department !== deptFilter) return false;
      if (minAmount && rec.amount < Number(minAmount) * 100000) return false;
      if (maxAmount && rec.amount > Number(maxAmount) * 100000) return false;
      return true;
    });
    r = [...r].sort((a, b) => {
      let av: string | number = a[sortKey];
      let bv: string | number = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return r;
  }, [query, statusFilter, deptFilter, minAmount, maxAmount, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages, page]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setSortDir('asc'); }
  }

  function resetFilters() {
    setQuery(''); setStatusFilter('all'); setDeptFilter('all'); setMinAmount(''); setMaxAmount(''); setParams({});
    pushToast({ variant: 'info', title: 'Filters cleared' });
  }

  function exportCsv() {
    const headers = ['FDR ID', 'Beneficiary', 'Organization', 'Issuing Bank', 'Amount', 'Issue Date', 'Maturity Date', 'Department', 'Status', 'Next Action'];
    const rows = filtered.map((r) => [r.id, r.beneficiary, r.organization, r.issuingBank, r.amount, r.issueDate, r.maturityDate, r.department, statusConfig[r.status].label, r.nextAction]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'fdr-registry-export.csv'; a.click();
    URL.revokeObjectURL(url);
    pushToast({ variant: 'success', title: 'Export ready', description: `${filtered.length} records exported to CSV` });
  }

  const activeFilterCount = (statusFilter !== 'all' ? 1 : 0) + (deptFilter !== 'all' ? 1 : 0) + (minAmount ? 1 : 0) + (maxAmount ? 1 : 0);

  const columns: { key: SortKey | 'org' | 'bank' | 'dept' | 'action'; label: string; sortable?: boolean; hideOnMobile?: boolean }[] = [
    { key: 'id', label: 'FDR ID', sortable: true },
    { key: 'beneficiary', label: 'Beneficiary', sortable: true },
    { key: 'bank', label: 'Issuing Bank', sortable: false, hideOnMobile: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'maturityDate', label: 'Maturity', sortable: true, hideOnMobile: true },
    { key: 'dept', label: 'Department', sortable: false, hideOnMobile: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'action', label: 'Next Action', sortable: false, hideOnMobile: true },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">FDR Registry</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} of {fdrRecords.length} records · manage and track every registered FDR</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv} className="btn-secondary"><Download className="w-4 h-4" /> Export CSV</button>
        </div>
      </div>

      <SectionCard bodyClassName="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by FDR ID, beneficiary, organization, or bank…"
              className="input pl-9"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`btn-secondary ${activeFilterCount > 0 ? '!border-brand-300 !bg-brand-50 !text-brand-700' : ''}`}
            >
              <Filter className="w-4 h-4" /> Filters
              {activeFilterCount > 0 && <span className="chip bg-brand-600 text-white text-[10px] px-1.5 py-0">{activeFilterCount}</span>}
            </button>
            {activeFilterCount > 0 && <button onClick={resetFilters} className="btn-ghost btn-sm">Clear</button>}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fadein">
            <div>
              <label className="label">Status</label>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as FdrStatus | 'all'); setPage(1); }} className="input">
                <option value="all">All statuses</option>
                {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Department</label>
              <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value as Department | 'all'); setPage(1); }} className="input">
                <option value="all">All departments</option>
                {['Finance', 'Administration', 'Accounts', 'Audit', 'Treasury', 'Compliance'].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Min Amount (₹ Lakh)</label>
              <input type="number" value={minAmount} onChange={(e) => { setMinAmount(e.target.value); setPage(1); }} className="input" placeholder="0" />
            </div>
            <div>
              <label className="label">Max Amount (₹ Lakh)</label>
              <input type="number" value={maxAmount} onChange={(e) => { setMaxAmount(e.target.value); setPage(1); }} className="input" placeholder="100" />
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard bodyClassName="p-0">
        {pageData.length === 0 ? (
          <EmptyState
            icon={<FileSearch className="w-6 h-6" />}
            title="No FDR records found"
            description="Try adjusting your search or filters to see records."
            action={<button onClick={resetFilters} className="btn-secondary">Reset filters</button>}
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className={`text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-4 py-3 ${c.hideOnMobile ? 'hidden lg:table-cell' : ''} ${c.sortable ? 'cursor-pointer hover:text-slate-700 select-none' : ''}`}
                      onClick={() => c.sortable && toggleSort(c.key as SortKey)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {c.label}
                        {c.sortable && sortKey === c.key && (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                        {c.sortable && sortKey !== c.key && <ChevronsUpDown className="w-3 h-3 text-slate-300" />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition group"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800 text-xs">{r.id}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{r.referenceNo}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-800 text-xs font-medium">{r.beneficiary}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{r.organization}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-600 text-xs">{r.issuingBank}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-800 text-xs font-semibold">{formatINR(r.amount)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-600 text-xs">{formatDate(r.maturityDate)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell"><span className="chip bg-slate-100 text-slate-600">{r.department}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-slate-600 truncate inline-block max-w-[160px]">{r.nextAction}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Rows3 className="w-3.5 h-3.5" />
              <span>Rows per page</span>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="text-xs border border-slate-200 rounded px-2 py-1">
                {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="ml-2">Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost btn-sm !px-2"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs text-slate-600 px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost btn-sm !px-2"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </SectionCard>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? selected.id : ''}
        description={selected ? `${selected.beneficiary} · ${selected.organization}` : ''}
        width="max-w-3xl"
      >
        {selected && <FdrDetailContent record={selected} onOpenFull={() => navigate(`/fdr/${selected.id}`)} />}
      </Drawer>
    </div>
  );
}
