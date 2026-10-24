import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  HelpCircle,
  Menu,
  ChevronDown,
  User,
  LogOut,
  Check,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { users, fdrRecords } from '@/data/mockData';

const pageTitles: Record<string, { title: string; crumb: string[] }> = {
  '/': { title: 'Command Center', crumb: ['Workspace', 'Overview'] },
  '/registry': { title: 'FDR Registry', crumb: ['Workspace', 'FDR Registry'] },
  '/release-graph': { title: 'ReleaseGraph', crumb: ['Workspace', 'ReleaseGraph'] },
  '/proof-trace': { title: 'ProofTrace', crumb: ['Workspace', 'Evidence Verification'] },
  '/change-lens': { title: 'ChangeLens', crumb: ['Workspace', 'Document Comparison'] },
  '/queue-pilot': { title: 'QueuePilot', crumb: ['Workspace', 'Workflow Simulator'] },
  '/reports': { title: 'Reports & Analytics', crumb: ['Workspace', 'Reports'] },
  '/audit': { title: 'Audit Trail', crumb: ['Workspace', 'Audit Trail'] },
  '/settings': { title: 'Settings', crumb: ['Workspace', 'Settings'] },
};

export function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { user, setUser, pushToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const path = location.pathname.split('/fdr/')[0] || '/';
  const meta = pageTitles[path] || pageTitles['/'];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const suggestions = query
    ? fdrRecords
        .filter(
          (r) =>
            r.id.toLowerCase().includes(query.toLowerCase()) ||
            r.beneficiary.toLowerCase().includes(query.toLowerCase()) ||
            r.organization.toLowerCase().includes(query.toLowerCase()) ||
            r.issuingBank.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const notifications = [
    { id: 1, title: 'FDR-26-01024 blocked', desc: 'Document verification pending evidence', time: '12m ago', unread: true },
    { id: 2, title: 'Approval granted', desc: 'FDR-26-01018 cleared by Audit', time: '1h ago', unread: true },
    { id: 3, title: 'Maturity approaching', desc: 'FDR-26-01011 matures in 18 days', time: '3h ago', unread: true },
    { id: 4, title: 'New FDR registered', desc: 'FDR-26-01047 submitted by Administration', time: '5h ago', unread: false },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 h-16 glass border-b border-slate-200/70 flex items-center gap-3 px-4 lg:px-6">
        <button onClick={onOpenMobile} className="lg:hidden text-slate-600 p-1.5 -ml-1.5">
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            {meta.crumb.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-slate-300">/</span>}
                <span>{c}</span>
              </span>
            ))}
          </div>
          <h1 className="text-base font-semibold text-slate-900 truncate">{meta.title}</h1>
        </div>

        <button
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-2 w-64 lg:w-72 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-sm text-slate-400 transition"
        >
          <Search className="w-4 h-4" />
          <span>Search FDRs, people…</span>
          <kbd className="ml-auto text-[10px] font-semibold bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-500">⌘K</kbd>
        </button>

        <button onClick={() => setSearchOpen(true)} className="md:hidden text-slate-600 p-2 -mr-1">
          <Search className="w-5 h-5" />
        </button>

        <button className="text-slate-500 hover:text-slate-700 p-2 hover:bg-slate-100 rounded-lg transition" title="Help">
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="text-slate-500 hover:text-slate-700 p-2 hover:bg-slate-100 rounded-lg transition relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 card shadow-pop animate-scalein overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Notifications</p>
                <span className="text-xs text-brand-600 font-medium">3 unread</span>
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {notifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 cursor-pointer">
                    <div className="flex items-start gap-2">
                      {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-2.5 text-xs font-semibold text-brand-600 hover:bg-slate-50 border-t border-slate-100">
                View all notifications
              </button>
            </div>
          )}
        </div>

        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserOpen((o) => !o)}
            className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-slate-100 transition"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ink-600 to-ink-900 flex items-center justify-center text-white text-xs font-bold ring-1 ring-white/10 shadow-sm">
              {user.avatar}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-500">{user.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>
          {userOpen && (
            <div className="absolute right-0 mt-2 w-64 card shadow-pop animate-scalein overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
                <span className="chip bg-brand-50 text-brand-700 mt-2">{user.role}</span>
              </div>
              <div className="py-1.5">
                <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Switch Role</p>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => { setUser(u); setUserOpen(false); pushToast({ variant: 'success', title: 'Role switched', description: `Now viewing as ${u.name} (${u.role})` }); }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">{u.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{u.role}</p>
                      <p className="text-[10px] text-slate-400 truncate">{u.department}</p>
                    </div>
                    {u.id === user.id && <Check className="w-4 h-4 text-brand-600" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 py-1.5">
                <button onClick={() => { navigate('/login'); setUserOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-[95] flex items-start justify-center pt-[10vh] px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadein" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-xl card shadow-pop animate-scalein overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search FDRs by ID, beneficiary, organization, bank…"
                className="flex-1 text-sm outline-none bg-transparent text-slate-800"
              />
              <kbd className="text-[10px] font-semibold bg-slate-100 rounded px-1.5 py-0.5 text-slate-500">ESC</kbd>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {suggestions.length === 0 && query && (
                <p className="px-4 py-6 text-sm text-slate-400 text-center">No matches found for "{query}"</p>
              )}
              {suggestions.length === 0 && !query && (
                <p className="px-4 py-6 text-sm text-slate-400 text-center">Start typing to search registered FDRs…</p>
              )}
              {suggestions.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { navigate(`/fdr/${r.id}`); setSearchOpen(false); setQuery(''); }}
                  className="w-full px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-left border-b border-slate-50 last:border-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Search className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{r.id} <span className="text-slate-400 font-normal">· {r.beneficiary}</span></p>
                    <p className="text-xs text-slate-500 truncate">{r.organization} · {r.issuingBank}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
