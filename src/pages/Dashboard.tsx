import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
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
import {
  FileStack,
  ShieldCheck,
  Stamp,
  Rocket,
  AlertTriangle,
  ArrowRight,
  FileText,
  Upload,
  CheckCircle2,
  GitBranch,
  Clock,
} from 'lucide-react';
import { KpiCard } from '@/components/KpiCard';
import { SectionCard } from '@/components/SectionCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Skeleton, ChartSkeleton } from '@/components/Skeleton';
import {
  getKpis,
  getReleaseTrends,
  getWorkflowHealth,
  getDepartmentWorkload,
  getPriorityQueue,
  getRecentActivity,
  getUpcomingMaturities,
  formatINR,
  formatDate,
  relativeTime,
} from '@/data/mockData';
import type { AuditEntry } from '@/types';

const activityIcons: Record<AuditEntry['category'], React.ReactNode> = {
  document: <FileText className="w-3.5 h-3.5" />,
  verification: <ShieldCheck className="w-3.5 h-3.5" />,
  status: <GitBranch className="w-3.5 h-3.5" />,
  approval: <Stamp className="w-3.5 h-3.5" />,
  note: <FileText className="w-3.5 h-3.5" />,
  system: <CheckCircle2 className="w-3.5 h-3.5" />,
};

const activityColors: Record<AuditEntry['category'], string> = {
  document: 'bg-slate-100 text-slate-600',
  verification: 'bg-blue-50 text-blue-600',
  status: 'bg-brand-50 text-brand-600',
  approval: 'bg-emerald-50 text-emerald-600',
  note: 'bg-amber-50 text-amber-600',
  system: 'bg-slate-100 text-slate-500',
};

export function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const kpis = getKpis();
  const trends = getReleaseTrends();
  const health = getWorkflowHealth();
  const workload = getDepartmentWorkload();
  const queue = getPriorityQueue();
  const activity = getRecentActivity(8);
  const maturities = getUpcomingMaturities();

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">FDR Operations Command Center</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor verification, approvals, release readiness, and operational bottlenecks.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-soft">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulseglow" />
          <span className="text-xs font-medium text-slate-600">System operational</span>
          <span className="text-xs text-slate-300">|</span>
          <span className="text-xs text-slate-400">Updated just now</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36" />)
        ) : (
          <>
            <KpiCard
              icon={<FileStack className="w-5 h-5" />}
              label="Total Registered FDRs"
              value={kpis.total}
              delta="+12.4%"
              trend="up"
              accent="slate"
              subtitle="vs. previous period"
              onClick={() => navigate('/registry')}
            />
            <KpiCard
              icon={<ShieldCheck className="w-5 h-5" />}
              label="Awaiting Verification"
              value={kpis.awaitingVerification}
              delta="+3"
              trend="up"
              accent="amber"
              subtitle="compliance queue"
              onClick={() => navigate('/registry?status=awaiting_verification')}
            />
            <KpiCard
              icon={<Stamp className="w-5 h-5" />}
              label="Pending Approvals"
              value={kpis.pendingApprovals}
              delta="-2"
              trend="down"
              accent="blue"
              subtitle="across departments"
              onClick={() => navigate('/registry?status=pending_approval')}
            />
            <KpiCard
              icon={<Rocket className="w-5 h-5" />}
              label="Ready for Release"
              value={kpis.readyForRelease}
              delta="+5"
              trend="up"
              accent="emerald"
              subtitle="awaiting authorization"
              onClick={() => navigate('/registry?status=ready_for_release')}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? <ChartSkeleton /> : (
            <SectionCard
              title="FDR Release Trends"
              description="Submitted versus released FDRs over the last 6 months"
              action={
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-brand-500" />Submitted</span>
                  <span className="flex items-center gap-1.5 text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-accent-500" />Released</span>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trends} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gSub" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b894" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b894" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gRel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2f6df6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2f6df6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <RTooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 4px 16px rgba(15,23,42,0.08)' }}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                  />
                  <Area type="monotone" dataKey="submitted" stroke="#10b894" strokeWidth={2} fill="url(#gSub)" />
                  <Area type="monotone" dataKey="released" stroke="#2f6df6" strokeWidth={2} fill="url(#gRel)" />
                </AreaChart>
              </ResponsiveContainer>
            </SectionCard>
          )}
        </div>

        {loading ? <ChartSkeleton /> : (
          <SectionCard title="Workflow Health" description="Cases at each lifecycle stage">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={health} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} width={110} />
                <RTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" fill="#10b894" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? <Skeleton className="h-72" /> : (
            <SectionCard
              title="Priority Action Queue"
              description="High-priority cases requiring immediate attention"
              action={<button onClick={() => navigate('/registry')} className="btn-ghost btn-sm">View all <ArrowRight className="w-3.5 h-3.5" /></button>}
              bodyClassName="p-0"
            >
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-5 py-2.5">FDR</th>
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-2.5">Blocker</th>
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-2.5 hidden md:table-cell">Department</th>
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-2.5">Next Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map((q) => (
                      <tr
                        key={q.id}
                        onClick={() => navigate(`/fdr/${q.id}`)}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition"
                      >
                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-800 text-xs">{q.id}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[160px]">{q.beneficiary}</p>
                        </td>
                        <td className="px-3 py-3 max-w-[200px]">
                          <p className="text-xs text-slate-600 truncate">{q.blocker}</p>
                        </td>
                        <td className="px-3 py-3 hidden md:table-cell"><span className="chip bg-slate-100 text-slate-600">{q.department}</span></td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span className="text-xs text-slate-600">{q.nextAction}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}
        </div>

        {loading ? <Skeleton className="h-72" /> : (
          <SectionCard title="Recent Activity" description="Latest operations events" bodyClassName="p-0">
            <div className="max-h-[320px] overflow-y-auto scrollbar-thin">
              {activity.map((a) => (
                <div key={a.id} className="px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition">
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${activityColors[a.category]}`}>
                      {activityIcons[a.category]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{a.action}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.detail}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{a.actor} · {relativeTime(a.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {loading ? <ChartSkeleton /> : (
          <SectionCard title="Department Workload" description="Pending cases across departments">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={workload} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="pending" fill="#2f6df6" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        )}

        {loading ? <Skeleton className="h-72 lg:col-span-2" /> : (
          <SectionCard
            title="Upcoming Maturities"
            description="FDRs approaching maturity"
            className="lg:col-span-2"
            action={<button onClick={() => navigate('/registry')} className="btn-ghost btn-sm">View registry <ArrowRight className="w-3.5 h-3.5" /></button>}
            bodyClassName="p-0"
          >
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-5 py-2.5">FDR</th>
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-2.5">Beneficiary</th>
                    <th className="text-right font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-2.5 hidden sm:table-cell">Amount</th>
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-2.5">Maturity</th>
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {maturities.map((m) => {
                    const days = Math.round((new Date(m.maturityDate).getTime() - new Date('2026-10-24').getTime()) / 86400000);
                    return (
                      <tr key={m.id} onClick={() => navigate(`/fdr/${m.id}`)} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition">
                        <td className="px-5 py-3 font-semibold text-slate-800 text-xs">{m.id}</td>
                        <td className="px-3 py-3 text-slate-600 text-xs truncate max-w-[180px]">{m.beneficiary}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-slate-700 text-xs hidden sm:table-cell">{formatINR(m.amount)}</td>
                        <td className="px-3 py-3">
                          <p className="text-xs text-slate-700">{formatDate(m.maturityDate)}</p>
                          <p className={`text-[10px] font-medium ${days < 20 ? 'text-amber-600' : 'text-slate-400'}`}>in {days} days</p>
                        </td>
                        <td className="px-3 py-3"><StatusBadge status={m.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
