import { type ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function KpiCard({
  icon,
  label,
  value,
  delta,
  trend,
  onClick,
  accent = 'brand',
  subtitle,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  delta?: string;
  trend?: 'up' | 'down';
  onClick?: () => void;
  accent?: 'brand' | 'amber' | 'blue' | 'red' | 'emerald' | 'slate';
  subtitle?: string;
}) {
  const accents: Record<string, { icon: string; glow: string; bar: string }> = {
    brand: { icon: 'bg-gradient-to-br from-brand-500 to-brand-700 text-white', glow: 'group-hover:shadow-glow', bar: 'from-brand-400 to-brand-600' },
    amber: { icon: 'bg-gradient-to-br from-amber-400 to-amber-600 text-white', glow: 'group-hover:shadow-[0_4px_24px_-6px_rgba(245,158,11,0.3)]', bar: 'from-amber-300 to-amber-500' },
    blue: { icon: 'bg-gradient-to-br from-accent-500 to-accent-600 text-white', glow: 'group-hover:shadow-glow-blue', bar: 'from-blue-400 to-accent-600' },
    red: { icon: 'bg-gradient-to-br from-red-500 to-red-700 text-white', glow: 'group-hover:shadow-[0_4px_24px_-6px_rgba(239,68,68,0.3)]', bar: 'from-red-400 to-red-600' },
    emerald: { icon: 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white', glow: 'group-hover:shadow-[0_4px_24px_-6px_rgba(16,185,129,0.3)]', bar: 'from-emerald-400 to-emerald-600' },
    slate: { icon: 'bg-gradient-to-br from-slate-600 to-ink-800 text-white', glow: 'group-hover:shadow-card', bar: 'from-slate-400 to-slate-600' },
  };
  return (
    <button
      onClick={onClick}
      className={`card group relative overflow-hidden text-left hover:shadow-card hover:border-slate-300/80 transition-all duration-200 w-full ${accents[accent].glow}`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accents[accent].bar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${accents[accent].icon}`}>
            {icon}
          </div>
          {delta && (
            <span className={`chip text-[11px] ${trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {delta}
            </span>
          )}
        </div>
        <p className="mt-4 text-2xl font-bold text-slate-900 tabular-nums tracking-tight">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1.5">{subtitle}</p>}
      </div>
    </button>
  );
}
