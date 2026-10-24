import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileStack,
  GitBranch,
  ShieldCheck,
  GitCompare,
  Gauge,
  BarChart3,
  History,
  Settings,
  ChevronLeft,
  ShieldCheck as Logo,
} from 'lucide-react';

const nav = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/registry', label: 'FDR Registry', icon: FileStack },
  { to: '/release-graph', label: 'ReleaseGraph', icon: GitBranch },
  { to: '/proof-trace', label: 'ProofTrace', icon: ShieldCheck },
  { to: '/change-lens', label: 'ChangeLens', icon: GitCompare },
  { to: '/queue-pilot', label: 'QueuePilot', icon: Gauge },
  { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { to: '/audit', label: 'Audit Trail', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={onCloseMobile} />}
      <aside
        className={`fixed lg:sticky top-0 z-50 lg:z-30 h-screen bg-ink-900 text-slate-300 flex flex-col transition-all duration-200 ${
          collapsed ? 'w-[68px]' : 'w-60'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="absolute inset-0 grid-bg-dark opacity-60 pointer-events-none" />
        <div className="absolute -top-20 -left-10 w-48 h-48 rounded-full bg-brand-600/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 -right-10 w-40 h-40 rounded-full bg-accent-500/5 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col h-full">
        <div className="h-16 flex items-center gap-3 px-4 border-b border-white/5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shrink-0 shadow-lg shadow-brand-900/40 ring-1 ring-white/10">
            <Logo className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-white tracking-tight leading-tight">FDR Sentinel</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Release Intelligence</p>
            </div>
          )}
          <button
            onClick={onToggle}
            className="hidden lg:flex ml-auto w-6 h-6 items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/10"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-0.5">
          {!collapsed && <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Workspace</p>}
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onCloseMobile}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'} ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/5 p-3 shrink-0">
          {!collapsed ? (
            <div className="rounded-xl bg-white/[0.04] border border-white/5 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulseglow" />
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">AICTE Pilot</p>
              </div>
              <p className="text-xs text-slate-300 mt-1.5">SIH26265 — FDR Portal Streamline</p>
              <p className="text-[10px] text-brand-300 mt-1.5 font-medium">Demo Environment</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulseglow" />
            </div>
          )}
        </div>
        </div>
      </aside>
    </>
  );
}
