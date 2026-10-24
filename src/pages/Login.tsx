import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { users } from '@/data/mockData';

export function Login() {
  const navigate = useNavigate();
  const { setUser, pushToast } = useApp();
  const [email, setEmail] = useState('anita.verma@fdrsentinel.gov.in');
  const [password, setPassword] = useState('demo');
  const [role, setRole] = useState(users[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Enter email and password.'); return; }
    setLoading(true);
    setTimeout(() => {
      const u = users.find((x) => x.id === role) || users[0];
      setUser(u);
      pushToast({ variant: 'success', title: 'Signed in', description: `Welcome back, ${u.name}` });
      navigate('/');
    }, 700);
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-ink-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg-dark opacity-80" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-600/15 blur-3xl animate-pulseglow" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-accent-500/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-brand-500/5 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-900/40 ring-1 ring-white/10">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight">FDR Sentinel</p>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider">Release Intelligence Platform</p>
          </div>
        </div>

        <div className="relative space-y-6 max-w-md">
          <h1 className="text-3xl font-bold leading-tight text-balance">
            Explainable FDR release intelligence for <span className="text-brand-400">government financial operations.</span>
          </h1>
          <p className="text-slate-300 leading-relaxed">
            Monitor verification, approvals, and release readiness across departments. Trace every decision with auditable, evidence-backed workflows.
          </p>
          <div className="space-y-3 pt-2">
            {[
              'Full lifecycle traceability from registration to release',
              'Explainable blockers with evidence and next actions',
              'Cross-department workload and bottleneck analytics',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-slate-500">
          AICTE · SIH26265 — Streamline of Security Deposit / FDR Portal
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-slate-50 via-slate-50 to-brand-50/30">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">FDR Sentinel</p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">Release Intelligence</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to your workspace</h2>
          <p className="text-sm text-slate-500 mt-1.5">Enter your credentials to access the operations console.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-9"
                  placeholder="you@fdrsentinel.gov.in"
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-9"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div>
              <label className="label">Demo Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} — {u.role}</option>
                ))}
              </select>
            </div>

            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Signing in…' : (<>Sign in <ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>

          <div className="mt-6 p-3 rounded-lg bg-brand-50/60 border border-brand-100">
            <p className="text-xs text-brand-800 font-medium">Demo Environment</p>
            <p className="text-[11px] text-brand-700/80 mt-1">
              No real banking, government, or verification systems are connected. All data is fictional and for demonstration only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
