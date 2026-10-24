import type { FdrStatus } from '@/types';
import { statusConfig } from '@/data/mockData';

export function StatusBadge({ status }: { status: FdrStatus }) {
  const c = statusConfig[status];
  return (
    <span className={`chip ${c.badge} ring-1 ring-inset ring-current/10`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const map = {
    high: 'bg-red-50 text-red-700 ring-red-200/60',
    medium: 'bg-amber-50 text-amber-700 ring-amber-200/60',
    low: 'bg-slate-100 text-slate-600 ring-slate-200/60',
  };
  return <span className={`chip ring-1 ring-inset ${map[priority]}`}>{priority.charAt(0).toUpperCase() + priority.slice(1)} Priority</span>;
}
