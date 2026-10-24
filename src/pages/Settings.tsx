import { useState } from 'react';
import { User, Bell, Shield, Palette, Database, Save, Check } from 'lucide-react';
import { SectionCard } from '@/components/SectionCard';
import { useApp } from '@/store/AppContext';

export function Settings() {
  const { user, pushToast } = useApp();
  const [tab, setTab] = useState<'profile' | 'notifications' | 'security' | 'appearance' | 'data'>('profile');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifInApp, setNotifInApp] = useState(true);
  const [notifBlocked, setNotifBlocked] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  function save() {
    pushToast({ variant: 'success', title: 'Settings saved', description: 'Your preferences have been updated.' });
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    { id: 'data' as const, label: 'Data & Privacy', icon: Database },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight gradient-text">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your profile, preferences, and workspace configuration.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5">
        <div className="sm:w-48 shrink-0">
          <nav className="flex sm:flex-col gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${tab === t.id ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 min-w-0">
          {tab === 'profile' && (
            <SectionCard title="Profile" description="Your account information">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ink-700 to-ink-900 flex items-center justify-center text-white text-xl font-bold">
                    {user.avatar}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <span className="chip bg-brand-50 text-brand-700 mt-1">{user.role}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="label">Full Name</label><input className="input" defaultValue={user.name} /></div>
                  <div><label className="label">Email</label><input className="input" defaultValue={user.email} /></div>
                  <div><label className="label">Department</label><input className="input" defaultValue={user.department} disabled /></div>
                  <div><label className="label">Role</label><input className="input" defaultValue={user.role} disabled /></div>
                </div>
                <button onClick={save} className="btn-primary"><Save className="w-4 h-4" /> Save changes</button>
              </div>
            </SectionCard>
          )}

          {tab === 'notifications' && (
            <SectionCard title="Notifications" description="Choose what alerts you receive">
              <div className="space-y-3">
                <Toggle label="Email notifications" desc="Receive alerts via email" checked={notifEmail} onChange={setNotifEmail} />
                <Toggle label="In-app notifications" desc="Show alerts in the top bar" checked={notifInApp} onChange={setNotifInApp} />
                <Toggle label="Blocked FDR alerts" desc="Notify when an FDR is blocked" checked={notifBlocked} onChange={setNotifBlocked} />
                <div className="pt-3"><button onClick={save} className="btn-primary"><Save className="w-4 h-4" /> Save preferences</button></div>
              </div>
            </SectionCard>
          )}

          {tab === 'security' && (
            <SectionCard title="Security" description="Account security settings">
              <div className="space-y-4">
                <Toggle label="Two-factor authentication" desc="Require a second verification step" checked={twoFactor} onChange={setTwoFactor} />
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-sm font-semibold text-slate-800 mb-3">Change Password</p>
                  <div className="space-y-3">
                    <div><label className="label">Current Password</label><input type="password" className="input" placeholder="••••••••" /></div>
                    <div><label className="label">New Password</label><input type="password" className="input" placeholder="••••••••" /></div>
                    <div><label className="label">Confirm New Password</label><input type="password" className="input" placeholder="••••••••" /></div>
                  </div>
                </div>
                <button onClick={save} className="btn-primary"><Save className="w-4 h-4" /> Update security</button>
              </div>
            </SectionCard>
          )}

          {tab === 'appearance' && (
            <SectionCard title="Appearance" description="Customize your workspace display">
              <div className="space-y-4">
                <div>
                  <label className="label">Table Density</label>
                  <div className="flex gap-2">
                    <button onClick={() => setDensity('comfortable')} className={`btn-secondary ${density === 'comfortable' ? '!border-brand-400 !bg-brand-50 !text-brand-700' : ''}`}>
                      {density === 'comfortable' && <Check className="w-3.5 h-3.5" />} Comfortable
                    </button>
                    <button onClick={() => setDensity('compact')} className={`btn-secondary ${density === 'compact' ? '!border-brand-400 !bg-brand-50 !text-brand-700' : ''}`}>
                      {density === 'compact' && <Check className="w-3.5 h-3.5" />} Compact
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Theme</label>
                  <div className="flex gap-2">
                    <div className="card card-pad flex items-center gap-2 cursor-pointer border-2 border-brand-400">
                      <div className="w-5 h-5 rounded-full bg-white border border-slate-200" /> Light
                    </div>
                    <div className="card card-pad flex items-center gap-2 cursor-pointer opacity-50">
                      <div className="w-5 h-5 rounded-full bg-ink-900" /> Dark (soon)
                    </div>
                  </div>
                </div>
                <button onClick={save} className="btn-primary"><Save className="w-4 h-4" /> Save appearance</button>
              </div>
            </SectionCard>
          )}

          {tab === 'data' && (
            <SectionCard title="Data & Privacy" description="Data retention and export controls">
              <div className="space-y-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">Demo Data Notice</p>
                  <p className="text-xs text-slate-600 mt-1">This is a demonstration environment. All FDR records, documents, and audit entries are fictional. No real banking or government data is stored.</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 mb-2">Export Your Data</p>
                  <p className="text-xs text-slate-500 mb-3">Download a copy of your activity and preferences.</p>
                  <button onClick={() => pushToast({ variant: 'success', title: 'Data export started', description: 'You will receive a download link (demo).' })} className="btn-secondary">Request data export</button>
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-sm font-semibold text-slate-800 mb-2">Session</p>
                  <p className="text-xs text-slate-500 mb-3">Clear locally stored demo preferences.</p>
                  <button onClick={() => pushToast({ variant: 'info', title: 'Local data cleared' })} className="btn-secondary">Clear local storage</button>
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-slate-100">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition shrink-0 ${checked ? 'bg-brand-600' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}
