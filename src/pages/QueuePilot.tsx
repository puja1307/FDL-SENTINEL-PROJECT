import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Cell,
} from 'recharts';
import {
  Gauge,
  Users,
  Clock,
  AlertTriangle,
  TrendingDown,
  Info,
  Layers,
  Zap,
} from 'lucide-react';
import { SectionCard } from '@/components/SectionCard';

export function QueuePilot() {
  const [pendingCases, setPendingCases] = useState(48);
  const [reviewers, setReviewers] = useState(6);
  const [avgDuration, setAvgDuration] = useState(45);
  const [priorityRatio, setPriorityRatio] = useState(30);
  const [extraCapacity, setExtraCapacity] = useState(0);

  const result = useMemo(() => {
    const totalReviewers = reviewers + extraCapacity;
    const workableHoursPerDay = 6;
    const minsPerDay = workableHoursPerDay * 60;
    const throughputPerDay = (minsPerDay / avgDuration) * totalReviewers;
    const daysToClear = pendingCases / throughputPerDay;
    const casesProcessed = Math.min(pendingCases, Math.round(throughputPerDay * 5));
    const remaining = Math.max(0, pendingCases - casesProcessed);
    const priorityCases = Math.round(pendingCases * (priorityRatio / 100));
    const normalCases = pendingCases - priorityCases;

    const workload = Array.from({ length: totalReviewers }).map((_, i) => ({
      reviewer: `R${i + 1}`,
      cases: Math.round(pendingCases / totalReviewers + (i % 2 === 0 ? 2 : -1)),
      isExtra: i >= reviewers,
    }));

    const baselineDays = pendingCases / ((minsPerDay / avgDuration) * reviewers);
    const improvement = ((baselineDays - daysToClear) / baselineDays) * 100;

    return {
      daysToClear,
      casesProcessed,
      remaining,
      priorityCases,
      normalCases,
      workload,
      improvement,
      throughputPerDay: Math.round(throughputPerDay),
      baselineDays,
    };
  }, [pendingCases, reviewers, avgDuration, priorityRatio, extraCapacity]);

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight gradient-text">QueuePilot</h1>
        <p className="text-sm text-slate-500 mt-1">Interactive workflow simulator — model capacity, throughput, and bottlenecks.</p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          <span className="font-semibold">All outputs are estimates, not guaranteed release dates.</span> Running a simulation never modifies real or demo FDR statuses. Assumptions: 6 reviewable hours per reviewer per day, uniform case distribution, no rework.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 space-y-4">
          <SectionCard title="Simulation Controls" description="Adjust inputs to model scenarios">
            <div className="space-y-5">
              <Slider
                icon={<Layers className="w-4 h-4" />}
                label="Pending Cases"
                value={pendingCases}
                min={10}
                max={200}
                step={1}
                onChange={setPendingCases}
                suffix="cases"
              />
              <Slider
                icon={<Users className="w-4 h-4" />}
                label="Available Reviewers"
                value={reviewers}
                min={1}
                max={20}
                step={1}
                onChange={setReviewers}
                suffix="people"
              />
              <Slider
                icon={<Clock className="w-4 h-4" />}
                label="Avg Review Duration"
                value={avgDuration}
                min={10}
                max={120}
                step={5}
                onChange={setAvgDuration}
                suffix="min/case"
              />
              <Slider
                icon={<AlertTriangle className="w-4 h-4" />}
                label="Priority Case Proportion"
                value={priorityRatio}
                min={0}
                max={80}
                step={5}
                onChange={setPriorityRatio}
                suffix="%"
              />
              <Slider
                icon={<Zap className="w-4 h-4" />}
                label="Additional Reviewer Capacity"
                value={extraCapacity}
                min={0}
                max={10}
                step={1}
                onChange={setExtraCapacity}
                suffix="extra"
              />
            </div>
          </SectionCard>

          <SectionCard title="Assumptions" description="How these numbers are computed">
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" /> 6 reviewable hours per reviewer per day</li>
              <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" /> Daily throughput = (360 min / avg duration) × total reviewers</li>
              <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" /> Cases distributed evenly across all reviewers</li>
              <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" /> No rework or escalation delays modeled</li>
            </ul>
          </SectionCard>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ResultCard
              icon={<Clock className="w-4 h-4" />}
              label="Est. Processing Duration"
              value={`${result.daysToClear.toFixed(1)} days`}
              accent="brand"
              sub={`Baseline: ${result.baselineDays.toFixed(1)}d`}
            />
            <ResultCard
              icon={<Layers className="w-4 h-4" />}
              label="Cases Processed (5d)"
              value={String(result.casesProcessed)}
              accent="emerald"
              sub={`of ${pendingCases} pending`}
            />
            <ResultCard
              icon={<TrendingDown className="w-4 h-4" />}
              label="Projected Backlog"
              value={String(result.remaining)}
              accent="amber"
              sub="after 5 days"
            />
            <ResultCard
              icon={<Zap className="w-4 h-4" />}
              label="Daily Throughput"
              value={`${result.throughputPerDay}`}
              accent="blue"
              sub="cases/day"
            />
          </div>

          {extraCapacity > 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-emerald-600" />
              <p className="text-sm text-emerald-800">
                Adding <span className="font-bold">{extraCapacity}</span> reviewer{extraCapacity > 1 ? 's' : ''} improves clearing time by <span className="font-bold">{result.improvement.toFixed(0)}%</span> ({result.baselineDays.toFixed(1)}d → {result.daysToClear.toFixed(1)}d).
              </p>
            </div>
          )}

          <SectionCard title="Reviewer Workload Distribution" description="Estimated cases assigned per reviewer">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={result.workload} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="reviewer" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="cases" radius={[4, 4, 0, 0]} barSize={28}>
                  {result.workload.map((w, i) => (
                    <Cell key={i} fill={w.isExtra ? '#2f6df6' : '#10b894'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-brand-500" /> Existing reviewers</span>
              <span className="flex items-center gap-1.5 text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-accent-500" /> Added capacity</span>
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SectionCard title="Case Composition" description="Priority vs. normal breakdown">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-50/50">
                  <span className="text-sm text-slate-700 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /> Priority cases</span>
                  <span className="text-lg font-bold text-red-700">{result.priorityCases}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="text-sm text-slate-700 flex items-center gap-2"><Layers className="w-4 h-4 text-slate-400" /> Normal cases</span>
                  <span className="text-lg font-bold text-slate-700">{result.normalCases}</span>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Bottleneck Identification" description="Constraints in the current scenario">
              <div className="space-y-2">
                {result.daysToClear > 10 && (
                  <BottleneckItem severity="high" text="Processing time exceeds 10 days — consider adding reviewer capacity." />
                )}
                {avgDuration > 60 && (
                  <BottleneckItem severity="medium" text="Average review duration is high — workflow optimization recommended." />
                )}
                {priorityRatio > 40 && (
                  <BottleneckItem severity="medium" text="High priority proportion may starve normal-case throughput." />
                )}
                {result.daysToClear <= 10 && avgDuration <= 60 && priorityRatio <= 40 && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <span className="text-sm text-emerald-800">No critical bottlenecks detected in this scenario.</span>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({
  icon, label, value, min, max, step, onChange, suffix,
}: {
  icon: React.ReactNode; label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; suffix: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">{icon} {label}</label>
        <span className="text-sm font-bold text-slate-900 tabular-nums">{value} <span className="text-xs font-normal text-slate-400">{suffix}</span></span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-600 h-1.5 cursor-pointer"
      />
    </div>
  );
}

function ResultCard({ icon, label, value, accent, sub }: { icon: React.ReactNode; label: string; value: string; accent: string; sub: string }) {
  const accents: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
  };
  return (
    <div className="card card-pad">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accents[accent]}`}>{icon}</div>
      <p className="text-xl font-bold text-slate-900 mt-3 tabular-nums">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      <p className="text-[10px] text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

function BottleneckItem({ severity, text }: { severity: 'high' | 'medium'; text: string }) {
  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg ${severity === 'high' ? 'bg-red-50/50 border border-red-100' : 'bg-amber-50/50 border border-amber-100'}`}>
      <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${severity === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
      <p className="text-xs text-slate-700">{text}</p>
    </div>
  );
}
