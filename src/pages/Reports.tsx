import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Download, TrendingUp, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SectionCard } from '@/components/SectionCard';
import { useApp } from '@/store/AppContext';
import { getKpis, getReleaseTrends, getDepartmentWorkload, fdrRecords, formatINR } from '@/data/mockData';

export function Reports() {
  const { pushToast } = useApp();
  const kpis = getKpis();
  const trends = getReleaseTrends();
  const workload = getDepartmentWorkload();

  const statusDist = [
    { name: 'Released', value: kpis.released, color: '#10b981' },
    { name: 'Ready', value: kpis.readyForRelease, color: '#10b894' },
    { name: 'Pending Approval', value: kpis.pendingApprovals, color: '#2f6df6' },
    { name: 'Awaiting Verification', value: kpis.awaitingVerification, color: '#f59e0b' },
    { name: 'Blocked', value: kpis.blocked, color: '#ef4444' },
  ];

  const avgAmount = Math.round(fdrRecords.reduce((s, r) => s + r.amount, 0) / fdrRecords.length);
  const avgDays = Math.round(fdrRecords.reduce((s, r) => {
    const diff = (new Date(r.maturityDate).getTime() - new Date(r.issueDate).getTime()) / 86400000;
    return s + diff;
  }, 0) / fdrRecords.length);

  function exportReport() {
    pushToast({ variant: 'success', title: 'Report generated', description: 'Analytics report exported as PDF (demo).' });
  }

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Aggregate insights across the FDR lifecycle.</p>
        </div>
        <button onClick={exportReport} className="btn-secondary"><Download className="w-4 h-4" /> Export Report</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Release Rate" value={`${Math.round((kpis.released / kpis.total) * 100)}%`} sub={`${kpis.released} of ${kpis.total} released`} accent="emerald" />
        <StatCard icon={<Clock className="w-4 h-4" />} label="Avg. Processing Days" value={`${avgDays}d`} sub="issue to maturity" accent="blue" />
        <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Avg. FDR Amount" value={formatINR(avgAmount)} sub="across all records" accent="brand" />
        <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Block Rate" value={`${Math.round((kpis.blocked / kpis.total) * 100)}%`} sub={`${kpis.blocked} blocked cases`} accent="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="Status Distribution" description="Breakdown of all FDRs by current status" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {statusDist.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <RTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Release Trends" description="Monthly submitted vs released" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trends} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="rSub" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b894" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b894" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Area type="monotone" dataKey="submitted" stroke="#10b894" strokeWidth={2} fill="url(#rSub)" />
              <Area type="monotone" dataKey="released" stroke="#2f6df6" strokeWidth={2} fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Department Workload" description="Pending cases per department">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={workload} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="pending" fill="#2f6df6" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Amount Distribution" description="FDR amounts by range (in ₹ Lakh)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={[
                { range: '0-10L', count: fdrRecords.filter((r) => r.amount < 1000000).length },
                { range: '10-25L', count: fdrRecords.filter((r) => r.amount >= 1000000 && r.amount < 2500000).length },
                { range: '25-50L', count: fdrRecords.filter((r) => r.amount >= 2500000 && r.amount < 5000000).length },
                { range: '50-75L', count: fdrRecords.filter((r) => r.amount >= 5000000 && r.amount < 7500000).length },
                { range: '75L+', count: fdrRecords.filter((r) => r.amount >= 7500000).length },
              ]}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="count" fill="#10b894" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub: string; accent: string }) {
  const accents: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    brand: 'bg-brand-50 text-brand-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="card card-pad">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accents[accent]}`}>{icon}</div>
      <p className="text-xl font-bold text-slate-900 mt-3">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      <p className="text-[10px] text-slate-400 mt-1">{sub}</p>
    </div>
  );
}
